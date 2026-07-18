import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, Table } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export type TableOpenOrder = Prisma.OrderGetPayload<{
  include: { items: { include: { menuItem: true } } };
}>;

@Injectable()
export class TablesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<Table[]> {
    return this.prisma.table.findMany({ orderBy: { number: 'asc' } });
  }

  /** Open orders (unpaid, not closed) of a table — supports split bills per person. */
  async findOpenOrders(tableId: string): Promise<TableOpenOrder[]> {
    const table = await this.prisma.table.findUnique({ where: { id: tableId } });
    if (!table) {
      throw new NotFoundException('Table not found');
    }
    return this.prisma.order.findMany({
      where: { tableId, paymentStatus: 'unpaid', closedAt: null },
      include: { items: { include: { menuItem: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  /**
   * Aggregation rule (HU-41): a table is `occupied` while it has at least one
   * unpaid order; it goes back to `free` when the last one is paid.
   * Centralised here — the client never re-implements it.
   */
  async refreshStatus(tx: Prisma.TransactionClient, tableId: string): Promise<Table> {
    const openOrders = await tx.order.count({
      where: { tableId, paymentStatus: 'unpaid' },
    });
    return tx.table.update({
      where: { id: tableId },
      data: { status: openOrders > 0 ? 'occupied' : 'free' },
    });
  }
}
