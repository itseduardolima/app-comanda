import { IsInt, IsNotEmpty, IsObject, IsOptional, IsString, Min } from 'class-validator';

/**
 * `modifiers` is free-form JSON by contract (.specs/03-api-contrato.md), e.g.
 * `{ "point": "ao_ponto", "remove": ["cebola"], "add": ["Farofa"], "note": "sem sal" }`.
 */
export class AddOrderItemDto {
  @IsString()
  @IsNotEmpty()
  menuItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @IsOptional()
  @IsObject()
  modifiers?: Record<string, unknown>;
}
