import { Module } from '@nestjs/common';
import { KitchenModule } from '../kitchen/kitchen.module';
import { TablesModule } from '../tables/tables.module';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [TablesModule, KitchenModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
