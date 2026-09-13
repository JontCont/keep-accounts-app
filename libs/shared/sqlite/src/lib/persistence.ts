import { Capacitor, registerPlugin, type Plugin } from '@capacitor/core';
import {
  AccountGroup,
  FinancialAccount,
  Transaction,
  STORAGE_KEYS,
} from '@keep-accounts-app/domain';
import type {
  HistoryPageResult,
  StatsAggregationResult,
  StatsCategoryBucket,
  StatsTrendPoint,
} from './query-store';
import { queryFinancialAccountSummaries } from './query-store';
import type { KeepAccountsWidgetSummary } from './widget-summary';

export interface KeepAccountsSnapshot {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  financialAccounts: FinancialAccount[];
}

export type KeepAccountsSnapshotInput = Omit<KeepAccountsSnapshot, 'financialAccounts'> & {
  financialAccounts?: FinancialAccount[];
};

const GROUPS_KEY = STORAGE_KEYS.ACCOUNTS.GROUPS;
const TRANSACTIONS_KEY = STORAGE_KEYS.ACCOUNTS.TRANSACTIONS;
const FINANCIAL_ACCOUNTS_KEY = STORAGE_KEYS.ACCOUNTS.FINANCIAL_ACCOUNTS;
const SQLITE_MIGRATION_MARKER = 'keep_accounts_sqlite_v2_migrated';
const TRANSACTION_SELECT_COLUMNS =
  'id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count, financial_account_id, transfer_source_financial_account_id, transfer_destination_financial_account_id';

interface KeepAccountsWidgetPlugin extends Plugin {
  updateSummary(summary: KeepAccountsWidgetSummary): Promise<void>;
}

const KeepAccountsWidget = registerPlugin<KeepAccountsWidgetPlugin>('KeepAccountsWidget');

const readLocalSnapshot = (): KeepAccountsSnapshot => {
  const rawGroups = localStorage.getItem(GROUPS_KEY);
  const rawTransactions = localStorage.getItem(TRANSACTIONS_KEY);
  const rawFinancialAccounts = localStorage.getItem(FINANCIAL_ACCOUNTS_KEY);

  let accountGroups: AccountGroup[] = [];
  let transactions: Transaction[] = [];
  let financialAccounts: FinancialAccount[] = [];

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

  if (rawFinancialAccounts) {
    try {
      const parsed = JSON.parse(rawFinancialAccounts);
      financialAccounts = Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(error);
    }
  }

  return { accountGroups, transactions, financialAccounts };
};

const writeLocalSnapshot = (snapshot: KeepAccountsSnapshotInput) => {
  localStorage.setItem(GROUPS_KEY, JSON.stringify(snapshot.accountGroups));
  localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(snapshot.transactions));
  localStorage.setItem(
    FINANCIAL_ACCOUNTS_KEY,
    JSON.stringify(snapshot.financialAccounts ?? [])
  );
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
          installment_count INTEGER,
          financial_account_id TEXT,
          transfer_source_financial_account_id TEXT,
          transfer_destination_financial_account_id TEXT
        );
      `);
      await db.execute(`
        CREATE TABLE IF NOT EXISTS keep_accounts_financial_accounts (
          id TEXT PRIMARY KEY NOT NULL,
          name TEXT NOT NULL,
          type TEXT NOT NULL,
          opening_amount REAL NOT NULL,
          is_archived INTEGER NOT NULL DEFAULT 0,
          statement_closing_day INTEGER,
          payment_due_day INTEGER,
          opening_adjustments_json TEXT NOT NULL DEFAULT '[]'
        );
      `);
      const financialAccountColumns = await db.query(
        'PRAGMA table_info(keep_accounts_financial_accounts)'
      );
      const existingFinancialAccountColumns = new Set(
        ((financialAccountColumns?.values ?? []) as Array<{ name: string }>).map(
          (column) => column.name
        )
      );
      for (const column of ['statement_closing_day', 'payment_due_day', 'opening_adjustments_json']) {
        if (!existingFinancialAccountColumns.has(column)) {
          const columnDefinition = column === 'opening_adjustments_json'
            ? "TEXT NOT NULL DEFAULT '[]'"
            : 'INTEGER';
          await db.execute(`ALTER TABLE keep_accounts_financial_accounts ADD COLUMN ${column} ${columnDefinition}`);
        }
      }
      const transactionColumns = await db.query(
        'PRAGMA table_info(keep_accounts_transactions)'
      );
      const existingTransactionColumns = new Set(
        ((transactionColumns?.values ?? []) as Array<{ name: string }>).map(
          (column) => column.name
        )
      );
      for (const column of [
        'financial_account_id',
        'transfer_source_financial_account_id',
        'transfer_destination_financial_account_id',
      ]) {
        if (!existingTransactionColumns.has(column)) {
          await db.execute(`ALTER TABLE keep_accounts_transactions ADD COLUMN ${column} TEXT`);
        }
      }
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
    'SELECT key, value FROM keep_accounts_kv WHERE key IN (?, ?, ?)',
    [GROUPS_KEY, TRANSACTIONS_KEY, FINANCIAL_ACCOUNTS_KEY]
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
  const financialAccounts = rowMap.get(FINANCIAL_ACCOUNTS_KEY)
    ? (JSON.parse(rowMap.get(FINANCIAL_ACCOUNTS_KEY) as string) as FinancialAccount[])
    : [];

  return { accountGroups, transactions, financialAccounts };
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
      (id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count, financial_account_id, transfer_source_financial_account_id, transfer_destination_financial_account_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
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
        tx.financialAccountId ?? null,
        tx.transferSourceFinancialAccountId ?? null,
        tx.transferDestinationFinancialAccountId ?? null,
      ]
    );
  }
};

const writeSqliteFinancialAccounts = async (accounts: FinancialAccount[]) => {
  const db = await getSqliteDb();
  if (!db) return;

  await db.execute('DELETE FROM keep_accounts_financial_accounts;');
  for (const account of accounts) {
    await db.run(
      `INSERT INTO keep_accounts_financial_accounts
      (id, name, type, opening_amount, is_archived, statement_closing_day, payment_due_day, opening_adjustments_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        account.id,
        account.name,
        account.type,
        account.openingAmount,
        0,
        account.statementClosingDay ?? null,
        account.paymentDueDay ?? null,
        JSON.stringify(account.openingAmountAdjustments ?? []),
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
    `SELECT id, description, amount, type, category, date, account_group_id, installment_id, installment_period, installment_count, financial_account_id, transfer_source_financial_account_id, transfer_destination_financial_account_id
     FROM keep_accounts_transactions
     ORDER BY date DESC`
  );
  const financialAccountResult = await db.query(
    `SELECT id, name, type, opening_amount, is_archived, statement_closing_day, payment_due_day, opening_adjustments_json
     FROM keep_accounts_financial_accounts`
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
    type: 'income' | 'expense' | 'transfer';
    category: string;
    date: string;
    account_group_id: string;
    installment_id: string | null;
    installment_period: number | null;
    installment_count: number | null;
    financial_account_id: string | null;
    transfer_source_financial_account_id: string | null;
    transfer_destination_financial_account_id: string | null;
  }>;
  const financialAccountRows = (financialAccountResult?.values ?? []) as Array<{
    id: string;
    name: string;
    type: FinancialAccount['type'];
    opening_amount: number;
    is_archived: number;
    statement_closing_day: number | null;
    payment_due_day: number | null;
    opening_adjustments_json: string;
  }>;

  if (groupRows.length === 0 && txRows.length === 0 && financialAccountRows.length === 0) {
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
    financialAccountId: row.financial_account_id ?? undefined,
    transferSourceFinancialAccountId: row.transfer_source_financial_account_id ?? undefined,
    transferDestinationFinancialAccountId:
      row.transfer_destination_financial_account_id ?? undefined,
  }));

  const financialAccounts: FinancialAccount[] = financialAccountRows.map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    openingAmount: Number(row.opening_amount),
    statementClosingDay: row.statement_closing_day ?? undefined,
    paymentDueDay: row.payment_due_day ?? undefined,
    openingAmountAdjustments: safeParseArray(row.opening_adjustments_json),
  }));

  return {
    accountGroups,
    transactions,
    financialAccounts,
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
  await writeSqliteFinancialAccounts(kvSnapshot.financialAccounts);
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

const writeSqliteSnapshot = async (snapshot: KeepAccountsSnapshotInput): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;

  const groupsValue = JSON.stringify(snapshot.accountGroups);
  const transactionsValue = JSON.stringify(snapshot.transactions);
  const financialAccountsValue = JSON.stringify(snapshot.financialAccounts ?? []);

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
  await db.run(
    `INSERT INTO keep_accounts_kv (key, value) VALUES (?, ?)
     ON CONFLICT(key) DO UPDATE SET value=excluded.value`,
    [FINANCIAL_ACCOUNTS_KEY, financialAccountsValue]
  );
  await writeSqliteGroups(snapshot.accountGroups);
  await writeSqliteTransactions(snapshot.transactions);
  await writeSqliteFinancialAccounts(snapshot.financialAccounts ?? []);
  localStorage.setItem(SQLITE_MIGRATION_MARKER, 'true');
  await syncNativeWidgetSummary();
  return true;
};

export const loadKeepAccountsSnapshot = async (): Promise<KeepAccountsSnapshot> => {
  try {
    const sqliteSnapshot = await readSqliteSnapshot();
    if (sqliteSnapshot) {
      await syncNativeWidgetSummary();
      return sqliteSnapshot;
    }
  } catch (error) {
    console.error('SQLite load failed, falling back to localStorage', error);
  }

  const localSnapshot = readLocalSnapshot();

  try {
    if (
      localSnapshot.accountGroups.length > 0 ||
      localSnapshot.transactions.length > 0 ||
      localSnapshot.financialAccounts.length > 0
    ) {
      await writeSqliteSnapshot(localSnapshot);
    }
  } catch (error) {
    console.error('SQLite migration write failed, keep localStorage as source', error);
  }

  await syncNativeWidgetSummary();
  return localSnapshot;
};

export const saveKeepAccountsSnapshot = async (
  snapshot: KeepAccountsSnapshotInput
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
    `SELECT ${TRANSACTION_SELECT_COLUMNS}
     FROM keep_accounts_transactions
     ${where}
     ORDER BY date DESC
     LIMIT ? OFFSET ?`,
    [...params, safePageSize, safeOffset]
  );
  const rows = (rowsResult?.values ?? []) as Array<any>;
  const items: Transaction[] = rows.map(mapTransactionRow);

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
  financialAccountId: row.financial_account_id ?? undefined,
  transferSourceFinancialAccountId: row.transfer_source_financial_account_id ?? undefined,
  transferDestinationFinancialAccountId:
    row.transfer_destination_financial_account_id ?? undefined,
});

export const queryNativeRecentTransactions = async (
  limit: number
): Promise<Transaction[] | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const safeLimit = Math.max(1, limit);
  const result = await db.query(
    `SELECT ${TRANSACTION_SELECT_COLUMNS}
     FROM keep_accounts_transactions
     ORDER BY date DESC
     LIMIT ?`,
    [safeLimit]
  );

  return ((result?.values ?? []) as Array<any>).map(mapTransactionRow);
};


export const queryNativeWidgetSummary = async (
  referenceDate: Date = new Date()
): Promise<KeepAccountsWidgetSummary | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const today = referenceDate.toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const result = await db.query(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income' AND substr(date, 1, 10) <= ? THEN amount ELSE 0 END), 0) AS total_income,
       COALESCE(SUM(CASE WHEN type = 'expense' AND substr(date, 1, 10) <= ? THEN amount ELSE 0 END), 0) AS total_expense,
       COALESCE(SUM(CASE WHEN type = 'income' AND substr(date, 1, 7) = ? THEN amount ELSE 0 END), 0) AS monthly_income,
       COALESCE(SUM(CASE WHEN type = 'expense' AND substr(date, 1, 7) = ? THEN amount ELSE 0 END), 0) AS monthly_expense
     FROM keep_accounts_transactions`,
    [today, today, currentMonth, currentMonth]
  );
  const row = (result?.values?.[0] ?? {}) as Record<string, unknown>;
  const totalIncome = Number(row.total_income ?? 0);
  const totalExpense = Number(row.total_expense ?? 0);

  return {
    totalBalance: totalIncome - totalExpense,
    monthlyIncome: Number(row.monthly_income ?? 0),
    monthlyExpense: Number(row.monthly_expense ?? 0),
    updatedAt: referenceDate.toISOString(),
  };
};

export const syncNativeWidgetSummary = async (): Promise<void> => {
  if (Capacitor.getPlatform() !== 'ios') return;

  try {
    const summary = await queryNativeWidgetSummary();
    if (summary) {
      await KeepAccountsWidget.updateSummary(summary);
    }
  } catch (error) {
    console.error('iOS Widget summary sync failed', error);
  }
};
export const saveNativeAccountGroups = async (
  groups: AccountGroup[]
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;
  await writeSqliteGroups(groups);
  return true;
};

export const queryNativeFinancialAccounts = async (): Promise<FinancialAccount[] | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    `SELECT id, name, type, opening_amount, is_archived, statement_closing_day, payment_due_day, opening_adjustments_json
     FROM keep_accounts_financial_accounts
     ORDER BY name ASC`
  );
  return ((result?.values ?? []) as Array<any>).map((row) => ({
    id: row.id,
    name: row.name,
    type: row.type,
    openingAmount: Number(row.opening_amount),
    statementClosingDay: row.statement_closing_day ?? undefined,
    paymentDueDay: row.payment_due_day ?? undefined,
    openingAmountAdjustments: safeParseArray(row.opening_adjustments_json),
  }));
};

export const saveNativeFinancialAccounts = async (
  accounts: FinancialAccount[]
): Promise<boolean> => {
  const db = await getSqliteDb();
  if (!db) return false;
  await writeSqliteFinancialAccounts(accounts);
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
      (${TRANSACTION_SELECT_COLUMNS})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        tx.financialAccountId ?? null,
        tx.transferSourceFinancialAccountId ?? null,
        tx.transferDestinationFinancialAccountId ?? null,
      ]
    );
  }

  await syncNativeWidgetSummary();
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
       installment_id = ?, installment_period = ?, installment_count = ?,
       financial_account_id = ?, transfer_source_financial_account_id = ?,
       transfer_destination_financial_account_id = ?
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
      tx.financialAccountId ?? null,
      tx.transferSourceFinancialAccountId ?? null,
      tx.transferDestinationFinancialAccountId ?? null,
      tx.id,
    ]
  );

  await syncNativeWidgetSummary();
  return true;
};

export const queryNativeTransactionById = async (
  id: string
): Promise<Transaction | null> => {
  const db = await getSqliteDb();
  if (!db) return null;

  const result = await db.query(
    `SELECT ${TRANSACTION_SELECT_COLUMNS}
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
    `SELECT ${TRANSACTION_SELECT_COLUMNS}
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
  await syncNativeWidgetSummary();
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
  await syncNativeWidgetSummary();
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
      (${TRANSACTION_SELECT_COLUMNS})
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        tx.financialAccountId ?? null,
        tx.transferSourceFinancialAccountId ?? null,
        tx.transferDestinationFinancialAccountId ?? null,
      ]
    );
  }

  await syncNativeWidgetSummary();
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
  await syncNativeWidgetSummary();
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
    `SELECT ${TRANSACTION_SELECT_COLUMNS}
     FROM keep_accounts_transactions
     ORDER BY date DESC`
  );

  return ((result?.values ?? []) as Array<any>).map(mapTransactionRow);
};

export const queryNativeFinancialAccountSummaries = async (
  financialAccounts: FinancialAccount[]
) => {
  const transactions = await loadAllNativeTransactions();
  if (!transactions) return null;
  return queryFinancialAccountSummaries({ financialAccounts, transactions });
};
