import { useEffect, useMemo } from 'react';
import { resolveCategoryNames, useMenuStore } from '../store/menu.store';

export function useMenu() {
  const categories = useMenuStore((state) => state.categories);
  const fetchedCategoryNames = useMenuStore((state) => state.categoryNames);
  const loading = useMenuStore((state) => state.loading);
  const loadError = useMenuStore((state) => state.loadError);
  const load = useMenuStore((state) => state.load);
  const findItem = useMenuStore((state) => state.findItem);

  useEffect(() => {
    void load();
  }, [load]);

  const categoryNames = useMemo(
    () => resolveCategoryNames(fetchedCategoryNames, categories),
    [fetchedCategoryNames, categories],
  );

  return { categories, categoryNames, loading, loadError, reload: load, findItem };
}
