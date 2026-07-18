import { Platform } from 'react-native';
import { Order } from '../types/order';

/**
 * Local persistence (offline-first, HU-28). Orders — with their items — are
 * cached as JSON documents keyed by order id; pending mutations live in
 * `sync_queue`; `id_map` records local→server id swaps after sync.
 *
 * On web (and in Jest) an in-memory store substitutes SQLite so the same
 * code paths run everywhere; native devices get durable storage.
 */

export interface QueueEntry {
  id: number;
  kind: string;
  payload: string;
  createdAt: number;
  attempts: number;
  lastError: string | null;
}

interface LocalStore {
  init(): void;
  upsertOrder(order: Order): void;
  deleteOrder(id: string): void;
  getOrders(): Order[];
  replaceOrderId(localId: string, serverId: string): void;
  setCache(key: string, json: string): void;
  getCache(key: string): string | null;
  enqueue(kind: string, payload: string): number;
  nextQueueEntry(): QueueEntry | null;
  updateQueueEntry(id: number, attempts: number, lastError: string | null): void;
  deleteQueueEntry(id: number): void;
  queueSize(): number;
  rewriteQueuePayloads(rewrite: (payload: string) => string): void;
  addIdAlias(localId: string, serverId: string): void;
  getIdAliases(): Record<string, string>;
  clearAll(): void;
}

function createMemoryStore(): LocalStore {
  const orders = new Map<string, Order>();
  const cache = new Map<string, string>();
  const aliases = new Map<string, string>();
  let queue: QueueEntry[] = [];
  let nextId = 1;
  return {
    init: () => undefined,
    upsertOrder: (order) => void orders.set(order.id, order),
    deleteOrder: (id) => void orders.delete(id),
    getOrders: () => Array.from(orders.values()),
    replaceOrderId: (localId, serverId) => {
      const order = orders.get(localId);
      if (order) {
        orders.delete(localId);
        orders.set(serverId, { ...order, id: serverId });
      }
    },
    setCache: (key, json) => void cache.set(key, json),
    getCache: (key) => cache.get(key) ?? null,
    enqueue: (kind, payload) => {
      const entry: QueueEntry = {
        id: nextId++,
        kind,
        payload,
        createdAt: Date.now(),
        attempts: 0,
        lastError: null,
      };
      queue.push(entry);
      return entry.id;
    },
    nextQueueEntry: () => queue[0] ?? null,
    updateQueueEntry: (id, attempts, lastError) => {
      queue = queue.map((entry) => (entry.id === id ? { ...entry, attempts, lastError } : entry));
    },
    deleteQueueEntry: (id) => {
      queue = queue.filter((entry) => entry.id !== id);
    },
    queueSize: () => queue.length,
    rewriteQueuePayloads: (rewrite) => {
      queue = queue.map((entry) => ({ ...entry, payload: rewrite(entry.payload) }));
    },
    addIdAlias: (localId, serverId) => void aliases.set(localId, serverId),
    getIdAliases: () => Object.fromEntries(aliases),
    clearAll: () => {
      orders.clear();
      cache.clear();
      aliases.clear();
      queue = [];
    },
  };
}

function createSqliteStore(): LocalStore {
  // Required lazily so Jest/web never load the native module at import time.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sqlite = require('expo-sqlite') as typeof import('expo-sqlite');
  const db = sqlite.openDatabaseSync('app-comanda.db');
  return {
    init: () => {
      db.execSync(`
        CREATE TABLE IF NOT EXISTS orders (
          id TEXT PRIMARY KEY,
          payload TEXT NOT NULL,
          updated_at INTEGER NOT NULL
        );
        CREATE TABLE IF NOT EXISTS cache (
          key TEXT PRIMARY KEY,
          payload TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS sync_queue (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          kind TEXT NOT NULL,
          payload TEXT NOT NULL,
          created_at INTEGER NOT NULL,
          attempts INTEGER NOT NULL DEFAULT 0,
          last_error TEXT
        );
        CREATE TABLE IF NOT EXISTS id_map (
          local_id TEXT PRIMARY KEY,
          server_id TEXT NOT NULL
        );
      `);
    },
    upsertOrder: (order) => {
      db.runSync(
        'INSERT OR REPLACE INTO orders (id, payload, updated_at) VALUES (?, ?, ?)',
        order.id,
        JSON.stringify(order),
        Date.now(),
      );
    },
    deleteOrder: (id) => {
      db.runSync('DELETE FROM orders WHERE id = ?', id);
    },
    getOrders: () => {
      const rows = db.getAllSync<{ payload: string }>('SELECT payload FROM orders');
      return rows.map((row) => JSON.parse(row.payload) as Order);
    },
    replaceOrderId: (localId, serverId) => {
      const row = db.getFirstSync<{ payload: string }>(
        'SELECT payload FROM orders WHERE id = ?',
        localId,
      );
      if (row) {
        const order = JSON.parse(row.payload) as Order;
        db.runSync('DELETE FROM orders WHERE id = ?', localId);
        db.runSync(
          'INSERT OR REPLACE INTO orders (id, payload, updated_at) VALUES (?, ?, ?)',
          serverId,
          JSON.stringify({ ...order, id: serverId }),
          Date.now(),
        );
      }
    },
    setCache: (key, json) => {
      db.runSync('INSERT OR REPLACE INTO cache (key, payload) VALUES (?, ?)', key, json);
    },
    getCache: (key) => {
      const row = db.getFirstSync<{ payload: string }>(
        'SELECT payload FROM cache WHERE key = ?',
        key,
      );
      return row?.payload ?? null;
    },
    enqueue: (kind, payload) => {
      const result = db.runSync(
        'INSERT INTO sync_queue (kind, payload, created_at) VALUES (?, ?, ?)',
        kind,
        payload,
        Date.now(),
      );
      return Number(result.lastInsertRowId);
    },
    nextQueueEntry: () => {
      const row = db.getFirstSync<{
        id: number;
        kind: string;
        payload: string;
        created_at: number;
        attempts: number;
        last_error: string | null;
      }>('SELECT * FROM sync_queue ORDER BY id ASC LIMIT 1');
      return row
        ? {
            id: row.id,
            kind: row.kind,
            payload: row.payload,
            createdAt: row.created_at,
            attempts: row.attempts,
            lastError: row.last_error,
          }
        : null;
    },
    updateQueueEntry: (id, attempts, lastError) => {
      db.runSync(
        'UPDATE sync_queue SET attempts = ?, last_error = ? WHERE id = ?',
        attempts,
        lastError,
        id,
      );
    },
    deleteQueueEntry: (id) => {
      db.runSync('DELETE FROM sync_queue WHERE id = ?', id);
    },
    queueSize: () => {
      const row = db.getFirstSync<{ n: number }>('SELECT COUNT(*) as n FROM sync_queue');
      return row?.n ?? 0;
    },
    rewriteQueuePayloads: (rewrite) => {
      const rows = db.getAllSync<{ id: number; payload: string }>(
        'SELECT id, payload FROM sync_queue',
      );
      for (const row of rows) {
        const next = rewrite(row.payload);
        if (next !== row.payload) {
          db.runSync('UPDATE sync_queue SET payload = ? WHERE id = ?', next, row.id);
        }
      }
    },
    addIdAlias: (localId, serverId) => {
      db.runSync(
        'INSERT OR REPLACE INTO id_map (local_id, server_id) VALUES (?, ?)',
        localId,
        serverId,
      );
    },
    getIdAliases: () => {
      const rows = db.getAllSync<{ local_id: string; server_id: string }>('SELECT * FROM id_map');
      return Object.fromEntries(rows.map((row) => [row.local_id, row.server_id]));
    },
    clearAll: () => {
      db.execSync('DELETE FROM orders; DELETE FROM cache; DELETE FROM sync_queue; DELETE FROM id_map;');
    },
  };
}

const isNative = Platform.OS === 'ios' || Platform.OS === 'android';
export const localStore: LocalStore =
  isNative && process.env.NODE_ENV !== 'test' ? createSqliteStore() : createMemoryStore();

localStore.init();
