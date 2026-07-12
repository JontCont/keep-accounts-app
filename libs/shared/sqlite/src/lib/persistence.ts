import { Capacitor } from '@capacitor/core';
import { AccountGroup, Transaction } from '@keep-accounts-app/domain';
import type {
  HistoryPageResult,
  StatsAggregationResult,
  StatsCategoryBucket,
  StatsTrendPoint,
} from './query-store';

export interface KeepAccountsSnapshot {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
}

const GROUPS_KEY = 'keep_accounts_groups';
const TRANSACTIONS_KEY = 'keep_accounts_transactions';
const SQLITE_MIGRATION_MARKER = 'keep_accounts_sqlite_v2_migrated';

const readLocalSnapshot = (): KeepAccountsSnapshot => {
  const rawGroups = localStorage.getItem(GROUPS_KEY);
  const rawTransactions = localStorage.getItem(TRANSACTIONS_KEY);

  let accountGroups: AccountGroup[] = [];
  let transactions: Transaction[] = [];

  if (rawGroups) {
    try {
      accountGroups = JSON.parse(rawGroups);
    } catch (error) {
      console.error(error);
    }
  }

  if (rawTransactions) {
    try {
      transactions = JSON.parse(rawTransactions);
    } catch (error) {
      console.error(error);
    }
  }

  return { accountGroups, transactions };
};

const writeLocalSnapshot = (snapshot: KeepAccountsSnapshot) => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(snapshot.accountGroups));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(snapshot.transactions));
};

const safeParseArray = <T>(value: string | null): T[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch (error) {
    console.error(error);
    return [];
  }
};

let sqliteDbPromise: Promise<any> | null = null;

const getSqliteDb = async () => {
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  if (!sqliteDbPromise) {
    sqliteDbPromise = (async () => {
      const sqlite = await import('@capacitor-community/sqlite');
      const connection = new sqlite.SQLiteConnection(sqlite.CapacitorSQLite);
      const db = await connection.createConnection(
        'keep_accounts',
        false,
        'no-encryption',
        1,
        false
      );
      await db.open();
      await db.execute(`
        CREATE TABLE IF NOT EXISTS keep_accounts_kv (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT NOT NULL
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS keep_accounts_groups (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          emoji TEXT NOT NULL,
          color TEXT NOT NULL,
          categories_json TEXT NOT NULL,
          description TEXT,
          budget REAL,
          target_ratio REAL,
          is_source INTEGER NOT NULL DEFAULT 0
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS keep_accounts_transactions (
          id TEXT PRIMARY KEY NOT NULL,
          description TEXT NOT NULL,
          amount REAL NOT NULL,
          type TEXT NOT NULL,
          category TEXT NOT NULL,
          date TEXT NOT NULL,
          account_group_id TEXT NOT NULL,
          installment_id TEXT,
          installment_period INTEGER,
          installment_count INTEGER
        );
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_transactions_date
        ON keep_accounts_transactions(date DESC);
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_transactions_group_type_date
        ON keep_accounts_transactions(account_group_id, type, date DESC);
      `);
      await db.execute(`
        CREATE INDEX IF NOT EXISTS idx_transactions_installment
        ON keep_accounts_transactions(installment_id);
      `);
      return db;
    })().catch((error) => {
      sqliteDbPromise = null;
      throw error;
    });
  }

  return sqliteDbPromise;
};

export const isNativePersistenceEnabled = () => Capacitor.isNativePlatform();

const readSqliteKvSnapshot = async (): Promise<KeepAccountsSnapshot | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    'SELECT key, value FROM keep_accounts_kv WHERE key IN (?, ?)',
    [GROUPS_KEY, TRANSACTIONS_KEY]
  );
  const rows = (result?.values ?? []) as { key: string; value: string }[];
  if (rows.length === 0) {
    return null;
  }

  const rowMap = new Map(rows.map((row) => [row.key, row.value]));
  const accountGroups = rowMap.get(GROUPS_KEY)
    ? (JSON.parse(rowMap.get(GROUPS_KEY) as string) as AccountGroup[])
    : [];
  const transactions = rowMap.get(TRANSACTIONS_KEY)
    ? (JSON.parse(rowMap.get(TRANSACTIONS_KEY) as string) as Transaction[])
    : [];

  return { accountGroups, transactions };
};

const writeSqliteGroups = async (groups: AccountGroup[]) => {
  const db = await getSqliteDb();
  if (!db) return;

  await db.execute('DELETE FROM keep_accounts_groups;');
  for (const group of groups) {
    await db.run(
      `INSERT INTO keep_accounts_groups
      (id, name, emoji, color, categories_json, description, budget, target_ratio, is_source)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        group.id,
        group.name,
        group.emoji,
        group.color,
        JSON.stringify(group.categories ?? []),
        group.description ?? null,
        group.budget ?? null,
        group.targetRatio ?? null,
        group.isSource ? 1 : 0,
      ]
    );
  }
};

const writeSqliteTransactions = async (transactions: Transaction[]) => {
  const db = await getSqliteDb();
  if (!db) return;

  await db.execute('DELETE FROM keep_accounts_transactions;');
  for (const tx of transactions) {
    await db.run(
      `INSERT INTO keep_accounts_transactions
      (id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.description,
        tx.amount,
        tx.type,
        tx.category,
        tx.date,
        tx.accountGroupId,
        tx.installmentId ?? null,
        tx.installmentPeriod ?? null,
        tx.installmentCount ?? null,
      ]
    );
  }
};

const readSqliteStructuredSnapshot = async (): Promise<KeepAccountsSnapshot | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const groupResult = await db.query(
    `SELECT id, name, emoji, color, categories_json, description, budget, target_ratio, is_source
     FROM keep_accounts_groups`
  );
  const txResult = await db.query(
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count
     FROM keep_accounts_transactions
     ORDER BY date DESC`
  );

  const groupRows = (groupResult?.values ?? []) as Array<{
    id: string;
    name: string;
    emoji: string;
    color: string;
    categories_json: string;
    description: string | null;
    budget: number | null;
    target_ratio: number | null;
    is_source: number;
  }>;
  const txRows = (txResult?.values ?? []) as Array<{
    id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    account_group_id: string;
    installment_id: string | null;
    installment_period: number | null;
    installment_count: number | null;
  }>;

  if (groupRows.length === 0 && txRows.length === 0) {
    return null;
  }

  const accountGroups: AccountGroup[] = groupRows.map((row) => ({
    id: row.id,
    name: row.name,
    emoji: row.emoji,
    color: row.color,
    categories: safeParseArray(row.categories_json),
    description: row.description ?? undefined,
    budget: row.budget ?? undefined,
    targetRatio: row.target_ratio ?? undefined,
    isSource: row.is_source === 1,
  }));

  const transactions: Transaction[] = txRows.map((row) => ({
    id: row.id,
    description: row.description,
    amount: row.amount,
    type: row.type,
    category: row.category,
    date: row.date,
    accountGroupId: row.account_group_id,
    installmentId: row.installment_id ?? undefined,
    installmentPeriod: row.installment_period ?? undefined,
    installmentCount: row.installment_count ?? undefined,
  }));

  return {
    accountGroups,
    transactions,
  };
};

const migrateSqliteLegacyKvToStructured = async () => {
  if (!isNativePersistenceEnabled()) return;
  if (localStorage.getItem(SQLITE_MIGRATION_MARKER) === 'true') return;

  const kvSnapshot = await readSqliteKvSnapshot();
  if (!kvSnapshot) {
    localStorage.setItem(SQLITE_MIGRATION_MARKER, 'true');
    return;
  }

  await writeSqliteGroups(kvSnapshot.accountGroups);
  await writeSqliteTransactions(kvSnapshot.transactions);
  localStorage.setItem(SQLITE_MIGRATION_MARKER, 'true');
};

const readSqliteSnapshot = async (): Promise<KeepAccountsSnapshot | null> => {
  await migrateSqliteLegacyKvToStructured();
  const structured = await readSqliteStructuredSnapshot();
  if (structured) {
    return structured;
  }
  return readSqliteKvSnapshot();
};

const writeSqliteSnapshot = async (snapshot: KeepAccountsSnapshot): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;

  const groupsValue = JSON.stringify(snapshot.accountGroups);
  const transactionsValue = JSON.stringify(snapshot.transactions);

  await db.run(
    `INSERT INTO keep_accounts_kv (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [GROUPS_KEY, groupsValue]
  );
  await db.run(
    `INSERT INTO keep_accounts_kv (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [TRANSACTIONS_KEY, transactionsValue]
  );
  await writeSqliteGroups(snapshot.accountGroups);
  await writeSqliteTransactions(snapshot.transactions);
  localStorage.setItem(SQLITE_MIGRATION_MARKER, 'true');
  return true;
};

export const loadKeepAccountsSnapshot = async (): Promise<KeepAccountsSnapshot> => {
  try {
    const sqliteSnapshot = await readSqliteSnapshot();
    if (sqliteSnapshot) {
      return sqliteSnapshot;
    }
  } catch (error) {
    console.error('SQLite load failed, falling back to localStorage', error);
  }

  const localSnapshot = readLocalSnapshot();

  try {
    if (localSnapshot.accountGroups.length > 0 || localSnapshot.transactions.length > 0) {
      await writeSqliteSnapshot(localSnapshot);
    }
  } catch (error) {
    console.error('SQLite migration write failed, keep localStorage as source', error);
  }

  return localSnapshot;
};

export const saveKeepAccountsSnapshot = async (
  snapshot: KeepAccountsSnapshot
): Promise<void> => {
  let sqliteSaved = false;

  try {
    sqliteSaved = await writeSqliteSnapshot(snapshot);
  } catch (error) {
    console.error('SQLite save failed, falling back to localStorage', error);
  }

  if (!sqliteSaved) {
    writeLocalSnapshot(snapshot);
    return;
  }

  // Keep a lightweight compatibility copy for existing export/import paths.
  writeLocalSnapshot(snapshot);
};

export const queryNativeHistoryPage = async ({
  filterType,
  filterGroup,
  offset,
  pageSize,
}: {
  filterType: 'all' | 'income' | 'expense' | 'installment';
  filterGroup: string;
  offset: number;
  pageSize: number;
}): Promise<HistoryPageResult | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const conditions: string[] = [];
  const params: Array<string | number> = [];

  if (filterType !== 'all') {
    if (filterType === 'installment') {
      conditions.push('installment_id IS NOT NULL');
    } else {
      conditions.push('type = ?');
      params.push(filterType);
    }
  }
  if (filterGroup !== 'all') {
    conditions.push('account_group_id = ?');
    params.push(filterGroup);
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  const safeOffset = Math.max(0, offset);
  const safePageSize = Math.max(1, pageSize);

  const countResult = await db.query(
    `SELECT COUNT(1) as total FROM keep_accounts_transactions ${where}`,
    params
  );
  const total = Number((countResult?.values?.[0] as any)?.total ?? 0);

  const rowsResult = await db.query(
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count
     FROM keep_accounts_transactions
     ${where}
     ORDER BY date DESC
     LIMIT ? OFFSET ?`,
    [...params, safePageSize, safeOffset]
  );
  const rows = (rowsResult?.values ?? []) as Array<any>;
  const items: Transaction[] = rows.map((row) => ({
    id: row.id,
    description: row.description,
    amount: Number(row.amount),
    type: row.type,
    category: row.category,
    date: row.date,
    accountGroupId: row.account_group_id,
    installmentId: row.installment_id ?? undefined,
    installmentPeriod:
      row.installment_period === null || row.installment_period === undefined
        ? undefined
        : Number(row.installment_period),
    installmentCount:
      row.installment_count === null || row.installment_count === undefined
        ? undefined
        : Number(row.installment_count),
  }));

  const nextOffset = safeOffset + items.length;
  return {
    items,
    hasMore: nextOffset < total,
    nextOffset,
  };
};

export const queryNativeStatsAggregates = async ({
  accountGroups,
  statsGroup,
}: {
  accountGroups: AccountGroup[];
  statsGroup: string;
}): Promise<StatsAggregationResult | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const scopedParams: Array<string> = [];
  const scopedWhere =
    statsGroup === 'all'
      ? `WHERE type = 'expense'`
      : `WHERE type = 'expense' AND account_group_id = ?`;
  if (statsGroup !== 'all') {
    scopedParams.push(statsGroup);
  }

  const totalResult = await db.query(
    `SELECT COUNT(1) as total_count, COALESCE(SUM(amount), 0) as total_expense
     FROM keep_accounts_transactions
     ${scopedWhere}`,
    scopedParams
  );
  const totalCount = Number((totalResult?.values?.[0] as any)?.total_count ?? 0);
  const totalExpense = Number((totalResult?.values?.[0] as any)?.total_expense ?? 0);

  const categoryResult = await db.query(
    `SELECT category, COALESCE(SUM(amount), 0) as amount
     FROM keep_accounts_transactions
     ${scopedWhere}
     GROUP BY category
     ORDER BY amount DESC`,
    scopedParams
  );
  const categoryRows = (categoryResult?.values ?? []) as Array<any>;
  const categories: StatsCategoryBucket[] = categoryRows.map((row) => {
    const categoryName = String(row.category);
    let emoji = '🏷️';
    let color = '#6b7280';

    if (statsGroup === 'all') {
      for (const group of accountGroups) {
        const match = group.categories.find((cat) => cat.name === categoryName);
        if (match) {
          emoji = match.emoji;
          color = match.color;
          break;
        }
      }
    } else {
      const selectedGroup = accountGroups.find((group) => group.id === statsGroup);
      const match = selectedGroup?.categories.find((cat) => cat.name === categoryName);
      if (match) {
        emoji = match.emoji;
        color = match.color;
      }
    }

    return {
      name: categoryName,
      emoji,
      color,
      amount: Number(row.amount),
    };
  });

  const trendResult = await db.query(
    `SELECT substr(date, 1, 10) as date, COALESCE(SUM(amount), 0) as amount
     FROM keep_accounts_transactions
     ${scopedWhere}
     GROUP BY substr(date, 1, 10)
     ORDER BY date ASC`,
    scopedParams
  );
  const trendRows = (trendResult?.values ?? []) as Array<any>;
  const trend: StatsTrendPoint[] = trendRows.map((row) => ({
    date: String(row.date),
    amount: Number(row.amount),
  }));

  return {
    totalCount,
    totalExpense,
    categories,
    trend,
  };
};

const mapTransactionRow = (row: any): Transaction => ({
  id: row.id,
  description: row.description,
  amount: Number(row.amount),
  type: row.type,
  category: row.category,
  date: row.date,
  accountGroupId: row.account_group_id,
  installmentId: row.installment_id ?? undefined,
  installmentPeriod:
    row.installment_period === null || row.installment_period === undefined
      ? undefined
      : Number(row.installment_period),
  installmentCount:
    row.installment_count === null || row.installment_count === undefined
      ? undefined
      : Number(row.installment_count),
});

export const queryNativeRecentTransactions = async (
  limit: number
): Promise<Transaction[] | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const safeLimit = Math.max(1, limit);
  const result = await db.query(
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count
     FROM keep_accounts_transactions
     ORDER BY date DESC
     LIMIT ?`,
    [safeLimit]
  );

  return ((result?.values ?? []) as Array<any>).map(mapTransactionRow);
};

export const saveNativeAccountGroups = async (
  groups: AccountGroup[]
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;
  await writeSqliteGroups(groups);
  return true;
};

export const insertNativeTransactions = async (
  transactions: Transaction[]
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;

  for (const tx of transactions) {
    await db.run(
      `INSERT INTO keep_accounts_transactions
      (id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.description,
        tx.amount,
        tx.type,
        tx.category,
        tx.date,
        tx.accountGroupId,
        tx.installmentId ?? null,
        tx.installmentPeriod ?? null,
        tx.installmentCount ?? null,
      ]
    );
  }

  return true;
};

export const updateNativeTransaction = async (
  tx: Transaction
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;

  await db.run(
    `UPDATE keep_accounts_transactions
     SET description = ?, amount = ?, type = ?, category = ?, date = ?, account_group_id = ?,
         installment_id = ?, installment_period = ?, installment_count = ?
     WHERE id = ?`,
    [
      tx.description,
      tx.amount,
      tx.type,
      tx.category,
      tx.date,
      tx.accountGroupId,
      tx.installmentId ?? null,
      tx.installmentPeriod ?? null,
      tx.installmentCount ?? null,
      tx.id,
    ]
  );

  return true;
};

export const queryNativeTransactionById = async (
  id: string
): Promise<Transaction | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count
     FROM keep_accounts_transactions
     WHERE id = ?
     LIMIT 1`,
    [id]
  );
  const row = (result?.values ?? [])[0] as any;
  return row ? mapTransactionRow(row) : null;
};

export const queryNativeInstallmentTransactions = async (
  installmentId: string
): Promise<Transaction[] | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count
     FROM keep_accounts_transactions
     WHERE installment_id = ?
     ORDER BY installment_period ASC, date ASC`,
    [installmentId]
  );
  return ((result?.values ?? []) as Array<any>).map(mapTransactionRow);
};

export const deleteNativeTransactionById = async (id: string): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;
  await db.run(`DELETE FROM keep_accounts_transactions WHERE id = ?`, [id]);
  return true;
};

export const deleteNativeInstallmentGroupById = async (
  installmentId: string
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;
  await db.run(`DELETE FROM keep_accounts_transactions WHERE installment_id = ?`, [
    installmentId,
  ]);
  return true;
};

export const replaceNativeInstallmentGroup = async (
  installmentId: string,
  transactions: Transaction[]
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;

  await db.run(`DELETE FROM keep_accounts_transactions WHERE installment_id = ?`, [
    installmentId,
  ]);
  for (const tx of transactions) {
    await db.run(
      `INSERT INTO keep_accounts_transactions
      (id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        tx.id,
        tx.description,
        tx.amount,
        tx.type,
        tx.category,
        tx.date,
        tx.accountGroupId,
        tx.installmentId ?? null,
        tx.installmentPeriod ?? null,
        tx.installmentCount ?? null,
      ]
    );
  }

  return true;
};

export const reassignNativeTransactionsGroup = async ({
  fromGroupId,
  toGroupId,
}: {
  fromGroupId: string;
  toGroupId: string;
}): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;
  await db.run(
    `UPDATE keep_accounts_transactions
     SET account_group_id = ?
     WHERE account_group_id = ?`,
    [toGroupId, fromGroupId]
  );
  return true;
};

export const queryNativeCurrentMonthExpenseForGroup = async ({
  groupId,
  currentMonthPrefix,
}: {
  groupId: string;
  currentMonthPrefix: string;
}): Promise<number | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    `SELECT COALESCE(SUM(amount), 0) as total_expense
     FROM keep_accounts_transactions
     WHERE account_group_id = ?
       AND type = 'expense'
       AND date LIKE ?`,
    [groupId, `${currentMonthPrefix}%`]
  );
  return Number((result?.values?.[0] as any)?.total_expense ?? 0);
};

export const loadAllNativeTransactions = async (): Promise<Transaction[] | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count
     FROM keep_accounts_transactions
     ORDER BY date DESC`
  );

  return ((result?.values ?? []) as Array<any>).map(mapTransactionRow);
};
