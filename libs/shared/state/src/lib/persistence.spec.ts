import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Snapshot = {
  accountGroups: any[];
  transactions: any[];
};

const seedLocalSnapshot = (snapshot: Snapshot) => {
  localStorage.setItem('keep_accounts_groups', JSON.stringify(snapshot.accountGroups));
  localStorage.setItem('keep_accounts_transactions', JSON.stringify(snapshot.transactions));
};

describe('persistence', () => {
  beforeEach(() => {
    const storage: Record<string, string> = {};
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: (key: string) => (key in storage ? storage[key] : null),
        setItem: (key: string, value: string) => {
          storage[key] = value;
        },
        clear: () => {
          Object.keys(storage).forEach((key) => delete storage[key]);
        },
        removeItem: (key: string) => {
          delete storage[key];
        },
      },
      configurable: true,
      writable: true,
    });
  });

  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads from localStorage on non-native platforms', async () => {
    seedLocalSnapshot({
      accountGroups: [{ id: '1', name: 'Group A' }],
      transactions: [{ id: 't1', amount: 100 }],
    });

    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => false,
      },
    }));
    vi.doMock('@capacitor-community/sqlite', () => ({}));

    const { loadKeepAccountsSnapshot } = await import('./persistence');
    const snapshot = await loadKeepAccountsSnapshot();

    expect(snapshot.accountGroups).toHaveLength(1);
    expect(snapshot.transactions).toHaveLength(1);
  });

  it('loads from sqlite rows on native platforms', async () => {
    class FakeDb {
      async open() {}
      async execute() {}
      async query(sql: string) {
        if (sql.includes('FROM keep_accounts_groups')) {
          return {
            values: [
              {
                id: 'db-group',
                name: 'DB Group',
                emoji: '🏦',
                color: '#000000',
                categories_json: '[]',
                description: null,
                budget: null,
                target_ratio: null,
                is_source: 0,
              },
            ],
          };
        }

        if (sql.includes('FROM keep_accounts_transactions')) {
          return {
            values: [
              {
                id: 'db-tx',
                description: 'DB Tx',
                amount: 25,
                type: 'expense',
                category: 'misc',
                date: '2024-01-01T00:00:00.000Z',
                account_group_id: 'db-group',
                installment_id: null,
                installment_period: null,
                installment_count: null,
              },
            ],
          };
        }

        return { values: [] };
      }
      async run() {}
    }

    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
      },
    }));
    vi.doMock('@capacitor-community/sqlite', () => ({
      CapacitorSQLite: {},
      SQLiteConnection: class {
        createConnection() {
          return new FakeDb();
        }
      },
    }));

    const { loadKeepAccountsSnapshot } = await import('./persistence');
    const snapshot = await loadKeepAccountsSnapshot();

    expect(snapshot.accountGroups[0].id).toBe('db-group');
    expect(snapshot.transactions[0].id).toBe('db-tx');
  });

  it('falls back to localStorage when sqlite startup fails on native', async () => {
    seedLocalSnapshot({
      accountGroups: [{ id: 'fallback-group', name: 'Fallback' }],
      transactions: [{ id: 'fallback-tx', amount: 30 }],
    });

    vi.doMock('@capacitor/core', () => ({
      Capacitor: {
        isNativePlatform: () => true,
      },
    }));
    vi.doMock('@capacitor-community/sqlite', () => ({
      CapacitorSQLite: {},
      SQLiteConnection: class {
        createConnection() {
          throw new Error('sqlite unavailable');
        }
      },
    }));

    const { loadKeepAccountsSnapshot, saveKeepAccountsSnapshot } = await import('./persistence');
    const snapshot = await loadKeepAccountsSnapshot();

    expect(snapshot.accountGroups[0].id).toBe('fallback-group');
    expect(snapshot.transactions[0].id).toBe('fallback-tx');

    await saveKeepAccountsSnapshot({
      accountGroups: [{ id: 'next-group', name: 'Next' }] as any,
      transactions: [{ id: 'next-tx', amount: 88 }] as any,
    });

    expect(localStorage.getItem('keep_accounts_groups')).toContain('next-group');
    expect(localStorage.getItem('keep_accounts_transactions')).toContain('next-tx');
  });
});
