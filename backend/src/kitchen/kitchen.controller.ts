import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { UpdateKitchenStatusDto } from './dto/update-kitchen-status.dto';
import { KitchenService, TicketWithItems, UpdatedKitchenItem } from './kitchen.service';

@Controller('kitchen')
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  @Patch('items/:itemId')
  updateItemStatus(
    @Param('itemId') itemId: string,
    @Body() dto: UpdateKitchenStatusDto,
  ): Promise<UpdatedKitchenItem> {
    return this.kitchenService.updateItemStatus(itemId, dto.kitchenStatus);
  }

  @Get('tickets')
  getTickets(@Query('orderId') orderId?: string): Promise<TicketWithItems[]> {
    return this.kitchenService.getTickets(orderId);
  }
}
