import { Controller, Get, Param } from '@nestjs/common';
import { Table } from '@prisma/client';
import { TableOpenOrder, TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Get()
  findAll(): Promise<Table[]> {
    return this.tablesService.findAll();
  }

  @Get(':id/orders')
  findOpenOrders(@Param('id') id: string): Promise<TableOpenOrder[]> {
    return this.tablesService.findOpenOrders(id);
  }
}
