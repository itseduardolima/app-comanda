import { create } from 'zustand';
import * as tablesApi from '../api/tables';
import { localStore } from '../db/schema';
import { Order } from '../types/order';
import { Table } from '../types/table';

const TABLES_CACHE_KEY = 'tables';

interface TablesState {
  tables: Table[];
  tableOrders: Record<string, Order[]>;
  loading: boolean;
  loadError: boolean;
  load(): Promise<void>;
  loadTableOrders(tableId: string): Promise<void>;
}

export const useTablesStore = create<TablesState>((set, get) => ({
  tables: [],
  tableOrders: {},
  loading: false,
  loadError: false,

  async load() {
    if (get().tables.length === 0) {
      const cached = localStore.getCache(TABLES_CACHE_KEY);
      if (cached) {
        set({ tables: JSON.parse(cached) as Table[] });
      }
    }
    set({ loading: true });
    try {
      const tables = await tablesApi.listTables();
      localStore.setCache(TABLES_CACHE_KEY, JSON.stringify(tables));
      set({ tables, loading: false, loadError: false });
    } catch {
      set((state) => ({ loading: false, loadError: state.tables.length === 0 }));
    }
  },

  async loadTableOrders(tableId) {
    try {
      const orders = await tablesApi.listTableOrders(tableId);
      set((state) => ({ tableOrders: { ...state.tableOrders, [tableId]: orders } }));
    } catch {
      // Screen shows last known data; refresh happens on next focus.
    }
  },
}));
