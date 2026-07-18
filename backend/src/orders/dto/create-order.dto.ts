import { OrderType } from '@prisma/client';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateIf } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(OrderType)
  type!: OrderType;

  /** Required for dine_in; ignored for counter/delivery. */
  @ValidateIf((dto: CreateOrderDto) => dto.type === OrderType.dine_in)
  @IsString()
  @IsNotEmpty()
  tableId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  customerName?: string;
}
