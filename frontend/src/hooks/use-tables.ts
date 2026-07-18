import { useEffect } from 'react';
import { useTablesStore } from '../store/tables.store';

export function useTables() {
  const tables = useTablesStore((state) => state.tables);
  const tableOrders = useTablesStore((state) => state.tableOrders);
  const loading = useTablesStore((state) => state.loading);
  const loadError = useTablesStore((state) => state.loadError);
  const load = useTablesStore((state) => state.load);
  const loadTableOrders = useTablesStore((state) => state.loadTableOrders);

  useEffect(() => {
    void load();
  }, [load]);

  return { tables, tableOrders, loading, loadError, reload: load, loadTableOrders };
}
