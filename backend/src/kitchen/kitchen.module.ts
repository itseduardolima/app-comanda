import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { KitchenController } from './kitchen.controller';
import { KitchenGateway } from './kitchen.gateway';
import { KitchenService } from './kitchen.service';

@Module({
  imports: [AuthModule],
  controllers: [KitchenController],
  providers: [KitchenGateway, KitchenService],
  exports: [KitchenGateway, KitchenService],
})
export class KitchenModule {}
