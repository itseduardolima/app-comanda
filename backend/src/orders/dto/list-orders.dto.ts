import { IsIn, IsOptional } from 'class-validator';

export const ORDER_LIST_FILTERS = ['open', 'paid', 'all'] as const;
export type OrderListFilter = (typeof ORDER_LIST_FILTERS)[number];

export class ListOrdersDto {
  @IsOptional()
  @IsIn(ORDER_LIST_FILTERS)
  status?: OrderListFilter;
}
