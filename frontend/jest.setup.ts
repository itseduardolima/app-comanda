/// <reference types="jest" />
/**
 * Jest environment: silence the RN animation warning noise and provide a
 * deterministic expo-constants mock (API URLs come from app.json extra).
 */
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: { apiUrl: 'http://localhost:3000/api', wsUrl: 'http://localhost:3000' },
    },
  },
}));

jest.mock('expo-secure-store', () => {
  const storage = new Map<string, string>();
  return {
    getItemAsync: jest.fn((key: string) => Promise.resolve(storage.get(key) ?? null)),
    setItemAsync: jest.fn((key: string, value: string) => {
      storage.set(key, value);
      return Promise.resolve();
    }),
    deleteItemAsync: jest.fn((key: string) => {
      storage.delete(key);
      return Promise.resolve();
    }),
  };
});
