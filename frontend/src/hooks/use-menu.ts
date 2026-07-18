import { useEffect } from 'react';
import { useMenuStore } from '../store/menu.store';

export function useMenu() {
  const categories = useMenuStore((state) => state.categories);
  const loading = useMenuStore((state) => state.loading);
  const loadError = useMenuStore((state) => state.loadError);
  const load = useMenuStore((state) => state.load);
  const findItem = useMenuStore((state) => state.findItem);

  useEffect(() => {
    void load();
  }, [load]);

  return { categories, loading, loadError, reload: load, findItem };
}
