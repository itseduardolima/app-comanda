import { create } from 'zustand';
import * as menuApi from '../api/menu';
import { localStore } from '../db/schema';
import { MenuCategory, MenuItem } from '../types/menu';

const MENU_CACHE_KEY = 'menu';

interface MenuState {
  categories: MenuCategory[];
  loading: boolean;
  loadError: boolean;
  load(): Promise<void>;
  findItem(menuItemId: string): MenuItem | undefined;
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  loading: false,
  loadError: false,

  /** Cache-first: serves the last menu immediately, then refreshes online. */
  async load() {
    if (get().categories.length === 0) {
      const cached = localStore.getCache(MENU_CACHE_KEY);
      if (cached) {
        set({ categories: JSON.parse(cached) as MenuCategory[] });
      }
    }
    set({ loading: true });
    try {
      const categories = await menuApi.getMenu();
      localStore.setCache(MENU_CACHE_KEY, JSON.stringify(categories));
      set({ categories, loading: false, loadError: false });
    } catch {
      set((state) => ({ loading: false, loadError: state.categories.length === 0 }));
    }
  },

  findItem(menuItemId) {
    for (const category of get().categories) {
      const item = category.items.find((candidate) => candidate.id === menuItemId);
      if (item) {
        return item;
      }
    }
    return undefined;
  },
}));
