/**
 * Menu store (HU-26). The screen consumes both `GET /api/menu` (items) and
 * `GET /api/menu/categories` (canonical chip order). The network layer is
 * mocked so the offline fallback can be exercised; under Jest, localStore is
 * the in-memory implementation (NODE_ENV=test).
 */
import { NetworkError } from '../api/client';
import * as menuApi from '../api/menu';
import { localStore } from '../db/schema';
import { MenuCategory } from '../types/menu';
import { resolveCategoryNames, useMenuStore } from './menu.store';

jest.mock('../api/menu');

const mockedApi = jest.mocked(menuApi);

const menu: MenuCategory[] = [
  {
    category: 'Lanches',
    items: [{ id: 'menu-1', name: 'X-Burger', price: 2500, category: 'Lanches' }],
  },
  {
    category: 'Bebidas',
    items: [{ id: 'menu-2', name: 'Guaraná', price: 800, category: 'Bebidas' }],
  },
];

/** Canonical order differs from the grouped menu, plus an empty category. */
const serverCategories = ['Entradas', 'Lanches', 'Bebidas'];

beforeEach(() => {
  jest.clearAllMocks();
  localStore.clearAll();
  useMenuStore.setState({
    categories: [],
    categoryNames: [],
    loading: false,
    loadError: false,
  });
});

describe('menu store — categories from the endpoint', () => {
  it('loads the menu and the canonical category list, and caches both', async () => {
    mockedApi.getMenu.mockResolvedValue(menu);
    mockedApi.getCategories.mockResolvedValue(serverCategories);

    await useMenuStore.getState().load();

    const state = useMenuStore.getState();
    expect(mockedApi.getCategories).toHaveBeenCalledTimes(1);
    expect(state.categories).toEqual(menu);
    // Endpoint order wins over the grouped-menu order, and an item-less
    // category ("Entradas") survives — neither is derivable from the menu.
    expect(resolveCategoryNames(state.categoryNames, state.categories)).toEqual(serverCategories);
    expect(state.loadError).toBe(false);

    expect(JSON.parse(localStore.getCache('menu') ?? 'null')).toEqual(menu);
    expect(JSON.parse(localStore.getCache('menu-categories') ?? 'null')).toEqual(serverCategories);
  });

  it('serves cached categories before the network answers', async () => {
    localStore.setCache('menu-categories', JSON.stringify(serverCategories));
    mockedApi.getMenu.mockResolvedValue(menu);
    mockedApi.getCategories.mockRejectedValue(new NetworkError(new Error('offline')));

    await useMenuStore.getState().load();

    expect(useMenuStore.getState().categoryNames).toEqual(serverCategories);
  });
});

describe('menu store — offline fallback', () => {
  it('keeps the menu when only the categories call fails', async () => {
    mockedApi.getMenu.mockResolvedValue(menu);
    mockedApi.getCategories.mockRejectedValue(new NetworkError(new Error('offline')));

    await useMenuStore.getState().load();

    const state = useMenuStore.getState();
    expect(state.categories).toEqual(menu);
    expect(state.loadError).toBe(false);
    // No endpoint answer and no cache: chips derive from the grouped menu.
    expect(resolveCategoryNames(state.categoryNames, state.categories)).toEqual([
      'Lanches',
      'Bebidas',
    ]);
  });

  it('appends menu categories the stale endpoint list does not know about', () => {
    expect(resolveCategoryNames(['Entradas', 'Lanches'], menu)).toEqual([
      'Entradas',
      'Lanches',
      'Bebidas',
    ]);
  });

  it('flags loadError only when the menu itself is unavailable', async () => {
    mockedApi.getMenu.mockRejectedValue(new NetworkError(new Error('offline')));
    mockedApi.getCategories.mockResolvedValue(serverCategories);

    await useMenuStore.getState().load();

    const state = useMenuStore.getState();
    expect(state.loadError).toBe(true);
    expect(state.loading).toBe(false);
    // Categories still arrived; they are not gated on the menu call.
    expect(state.categoryNames).toEqual(serverCategories);
  });

  it('falls back to the cached menu when offline and does not flag an error', async () => {
    localStore.setCache('menu', JSON.stringify(menu));
    mockedApi.getMenu.mockRejectedValue(new NetworkError(new Error('offline')));
    mockedApi.getCategories.mockRejectedValue(new NetworkError(new Error('offline')));

    await useMenuStore.getState().load();

    const state = useMenuStore.getState();
    expect(state.categories).toEqual(menu);
    expect(state.loadError).toBe(false);
    expect(resolveCategoryNames(state.categoryNames, state.categories)).toEqual([
      'Lanches',
      'Bebidas',
    ]);
  });
});
