import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CurrentOperator } from '../auth/decorators/current-operator.decorator';
import { AuthenticatedOperator } from '../common/types/authenticated-operator';
import { TicketWithItems } from '../kitchen/kitchen.service';
import { AddOrderItemDto } from './dto/add-order-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ListOrdersDto } from './dto/list-orders.dto';
import { UpdateOrderItemDto } from './dto/update-order-item.dto';
import { OrderItemWithMenuItem, OrdersService, OrderWithDetails } from './orders.service';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  create(
    @Body() dto: CreateOrderDto,
    @CurrentOperator() operator: AuthenticatedOperator,
  ): Promise<OrderWithDetails> {
    return this.ordersService.create(dto, operator.id);
  }

  @Get()
  findAll(@Query() query: ListOrdersDto): Promise<OrderWithDetails[]> {
    return this.ordersService.findAll(query.status ?? 'all');
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<OrderWithDetails> {
    return this.ordersService.findOne(id);
  }

  @Post(':id/items')
  addItem(@Param('id') id: string, @Body() dto: AddOrderItemDto): Promise<OrderItemWithMenuItem> {
    return this.ordersService.addItem(id, dto);
  }

  @Patch(':id/items/:itemId')
  updateItem(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: UpdateOrderItemDto,
  ): Promise<OrderItemWithMenuItem> {
    return this.ordersService.updateItem(id, itemId, dto);
  }

  @Delete(':id/items/:itemId')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeItem(@Param('id') id: string, @Param('itemId') itemId: string): Promise<void> {
    return this.ordersService.removeItem(id, itemId);
  }

  @Post(':id/close')
  @HttpCode(HttpStatus.OK)
  close(
    @Param('id') id: string,
    @CurrentOperator() operator: AuthenticatedOperator,
  ): Promise<OrderWithDetails> {
    return this.ordersService.close(id, operator.id);
  }

  @Post(':id/send-to-kitchen')
  @HttpCode(HttpStatus.CREATED)
  sendToKitchen(@Param('id') id: string): Promise<TicketWithItems> {
    return this.ordersService.sendToKitchen(id);
  }
}
