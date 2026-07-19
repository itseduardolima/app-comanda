import { create } from 'zustand';
import * as menuApi from '../api/menu';
import { localStore } from '../db/schema';
import { MenuCategory, MenuItem } from '../types/menu';

const MENU_CACHE_KEY = 'menu';
const CATEGORIES_CACHE_KEY = 'menu-categories';

interface MenuState {
  /** Menu items grouped by category (`GET /api/menu`). */
  categories: MenuCategory[];
  /** Canonical category names and order (`GET /api/menu/categories`). */
  categoryNames: string[];
  loading: boolean;
  loadError: boolean;
  load(): Promise<void>;
  findItem(menuItemId: string): MenuItem | undefined;
}

/**
 * Category names for the filter chips. The dedicated endpoint is the preferred
 * source — only it knows the canonical order and the categories that currently
 * have no items — but it is not a single point of failure: any category present
 * in the grouped menu and missing from that list (offline, stale cache, or a
 * failed call) is appended so it stays reachable.
 */
export function resolveCategoryNames(
  categoryNames: string[],
  categories: MenuCategory[],
): string[] {
  const known = new Set(categoryNames);
  const derived = categories
    .map((group) => group.category)
    .filter((category) => !known.has(category));
  return [...categoryNames, ...derived];
}

export const useMenuStore = create<MenuState>((set, get) => ({
  categories: [],
  categoryNames: [],
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
    if (get().categoryNames.length === 0) {
      const cachedCategories = localStore.getCache(CATEGORIES_CACHE_KEY);
      if (cachedCategories) {
        set({ categoryNames: JSON.parse(cachedCategories) as string[] });
      }
    }
    set({ loading: true });

    // Settled, not `all`: a failing categories call must not discard the menu
    // (nor the other way around) — the chips fall back to derived names.
    const [menuResult, categoriesResult] = await Promise.allSettled([
      menuApi.getMenu(),
      menuApi.getCategories(),
    ]);

    if (categoriesResult.status === 'fulfilled') {
      localStore.setCache(CATEGORIES_CACHE_KEY, JSON.stringify(categoriesResult.value));
      set({ categoryNames: categoriesResult.value });
    }

    if (menuResult.status === 'fulfilled') {
      localStore.setCache(MENU_CACHE_KEY, JSON.stringify(menuResult.value));
      set({ categories: menuResult.value, loading: false, loadError: false });
    } else {
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
