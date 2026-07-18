import { Order } from '../types/order';
import { Table } from '../types/table';
import { request } from './client';

export function listTables(): Promise<Table[]> {
  return request<Table[]>('/tables');
}

export function listTableOrders(tableId: string): Promise<Order[]> {
  return request<Order[]>(`/tables/${tableId}/orders`);
}
