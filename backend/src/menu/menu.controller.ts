import { Controller, Get } from '@nestjs/common';
import { MenuCategory, MenuService } from './menu.service';

@Controller('menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  getMenu(): Promise<MenuCategory[]> {
    return this.menuService.getMenu();
  }

  @Get('categories')
  getCategories(): Promise<string[]> {
    return this.menuService.getCategories();
  }
}
