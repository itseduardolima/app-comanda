import { KitchenStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateKitchenStatusDto {
  @IsEnum(KitchenStatus)
  kitchenStatus!: KitchenStatus;
}
