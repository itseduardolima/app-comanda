import { Injectable } from '@nestjs/common';
import { MenuItem } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface MenuCategory {
  category: string;
  items: MenuItem[];
}

@Injectable()
export class MenuService {
  constructor(private readonly prisma: PrismaService) {}

  /** Full menu, grouped by category (categories and items alphabetically). */
  async getMenu(): Promise<MenuCategory[]> {
    const items = await this.prisma.menuItem.findMany({
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    });
    const byCategory = new Map<string, MenuItem[]>();
    for (const item of items) {
      const group = byCategory.get(item.category);
      if (group) {
        group.push(item);
      } else {
        byCategory.set(item.category, [item]);
      }
    }
    return Array.from(byCategory, ([category, categoryItems]) => ({
      category,
      items: categoryItems,
    }));
  }

  async getCategories(): Promise<string[]> {
    const groups = await this.prisma.menuItem.groupBy({
      by: ['category'],
      orderBy: { category: 'asc' },
    });
    return groups.map((group) => group.category);
  }
}
