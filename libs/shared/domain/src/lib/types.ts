export interface Category {
  name: string;
  emoji: string;
  color: string;
  type: 'income' | 'expense';
}

export interface AccountGroup {
  id: string;
  name: string;
  emoji: string;
  color: string;
  categories: Category[];
  description?: string;
  budget?: number;
  targetRatio?: number;
  isSource?: boolean;
}

/**
 * Marks which reporting surfaces a transaction row is allowed to affect.
 * - `cash`: account-group cash balance only (e.g. stock settlement principal).
 * - `pnl`: income/expense/budget/statistics/allocation totals only (e.g. realized
 *   stock gain or loss), never account-group cash balance.
 * - `both`: affects cash balance and P&L reporting (ordinary transactions).
 * Missing `effect` on a persisted row MUST be treated as `both` for backward
 * compatibility with data saved before this field existed.
 */
export type TransactionEffect = 'cash' | 'pnl' | 'both';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
  accountGroupId: string; // Associated account group
  installmentId?: string; // Shared id linking all periods of one installment
  installmentPeriod?: number; // 1-based period number within the installment
  installmentCount?: number; // Total number of periods in the installment
  effect?: TransactionEffect; // Missing means 'both' (backward compatible)
  stockTradeId?: string; // Links this row to the StockTrade that generated it
}

export type StockSide = 'buy' | 'sell';

/**
 * How a positive realized gain from a sale participates in the current
 * month's allocation base. Only meaningful for sells with a positive result;
 * losses always post to investment P&L regardless of this field.
 */
export type GainDisposition = 'retain' | 'allocate' | 'split';

/**
 * An immutable fact describing a single stock buy or sell. Holdings and
 * realized profit/loss are never persisted directly — they are always
 * derived by replaying a symbol's trades in deterministic order.
 */
export interface StockTrade {
  id: string;
  symbol: string; // Normalized (trimmed, uppercased) ticker/symbol
  side: StockSide;
  shares: number; // Positive integer
  unitPrice: number; // Positive
  fee: number; // Non-negative
  tax: number; // Non-negative
  tradedAt: string; // Local ISO datetime string of the trade date
  settlementAccountGroupId?: string; // Optional funding/settlement account
  gainDisposition: GainDisposition; // Default 'retain'; only applies to sells
  allocationPercent?: number; // 0-100, required when gainDisposition is 'split'
  createdAt: string; // Local ISO datetime string; used for tie-breaking replay order
}

/**
 * A derived (never persisted) snapshot of a symbol's holdings after
 * replaying all of its trades in order.
 */
export interface StockPosition {
  symbol: string;
  shares: number;
  totalCost: number;
  averageCost: number; // 0 when shares is 0
  realizedPnl: number; // Cumulative realized gain/loss across all sells
}

export interface InstallmentReminderConfig {
  remindOnDueDate: boolean;
  notificationTitle: string;
  notificationBody: string;
}
