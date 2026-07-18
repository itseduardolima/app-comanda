import { IsInt, IsObject, IsOptional, Min } from 'class-validator';

export class UpdateOrderItemDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsObject()
  modifiers?: Record<string, unknown>;
}
