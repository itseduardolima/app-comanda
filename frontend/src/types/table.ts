export type TableStatus = 'free' | 'occupied';

export interface Table {
  id: string;
  number: number;
  status: TableStatus;
}
