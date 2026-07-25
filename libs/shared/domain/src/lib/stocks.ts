import {
  GainDisposition,
  StockPosition,
  StockSide,
  StockTrade,
  Transaction,
  TransactionEffect,
} from './types';
import { roundCurrency } from './utils';

/** Category used for the cash-only settlement row of a buy or sell. */
export const STOCK_SETTLEMENT_CATEGORY = '股票';
/** Category used when a positive realized gain is retained in investment funds. */
export const STOCK_GAIN_RETAIN_CATEGORY = '投資收益';
/** Category used for the portion of a positive realized gain that enters the allocation base. */
export const STOCK_GAIN_ALLOCATE_CATEGORY = '投資收益配置';
/** Category used for a realized loss. */
export const STOCK_LOSS_CATEGORY = '投資損失';

export const GAIN_DISPOSITIONS: GainDisposition[] = ['retain', 'allocate', 'split'];

/** Normalize a user-entered symbol so lookups and comparisons are consistent. */
export const normalizeStockSymbol = (symbol: string): string => symbol.trim().toUpperCase();

/**
 * Sort trades deterministically for replay: by trade date, then by creation
 * time, then by id. This guarantees stable results when two trades share the
 * same `tradedAt` value.
 */
export const sortStockTrades = (trades: StockTrade[]): StockTrade[] =>
  [...trades].sort((a, b) => {
    const dateDiff = new Date(a.tradedAt).getTime() - new Date(b.tradedAt).getTime();
    if (dateDiff !== 0) return dateDiff;

    const createdDiff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    if (createdDiff !== 0) return createdDiff;

    return a.id.localeCompare(b.id);
  });

export interface StockTradeFieldInput {
  symbol: string;
  side: StockSide;
  shares: number;
  unitPrice: number;
  fee: number;
  tax: number;
  tradedAt: string;
  gainDisposition?: GainDisposition;
  allocationPercent?: number;
}

/**
 * Validate a single trade's fields in isolation (no knowledge of other
 * trades in the symbol timeline). Returns a human-readable error message, or
 * null when the fields are valid.
 */
export const validateStockTradeFields = (trade: StockTradeFieldInput): string | null => {
  if (!trade.symbol || !trade.symbol.trim()) {
    return '請輸入股票代號。';
  }
  if (trade.side !== 'buy' && trade.side !== 'sell') {
    return '交易類型必須為買進或賣出。';
  }
  if (!Number.isFinite(trade.shares) || !Number.isInteger(trade.shares) || trade.shares <= 0) {
    return '股數必須為正整數。';
  }
  if (!Number.isFinite(trade.unitPrice) || trade.unitPrice <= 0) {
    return '單價必須為正數。';
  }
  if (!Number.isFinite(trade.fee) || trade.fee < 0) {
    return '手續費不可為負數。';
  }
  if (!Number.isFinite(trade.tax) || trade.tax < 0) {
    return '交易稅不可為負數。';
  }
  if (Number.isNaN(new Date(trade.tradedAt).getTime())) {
    return '交易日期無效。';
  }

  if (trade.side === 'sell') {
    const netProceeds = trade.shares * trade.unitPrice - trade.fee - trade.tax;
    if (netProceeds < 0) {
      return '賣出淨收入不可為負數，請確認股數、單價、手續費與交易稅。';
    }

    const disposition = trade.gainDisposition ?? 'retain';
    if (!GAIN_DISPOSITIONS.includes(disposition)) {
      return '獲利處置方式無效。';
    }

    if (disposition === 'split') {
      if (
        typeof trade.allocationPercent !== 'number' ||
        !Number.isFinite(trade.allocationPercent) ||
        trade.allocationPercent < 0 ||
        trade.allocationPercent > 100
      ) {
        return '分配百分比必須介於 0 到 100 之間。';
      }
    }
  }

  return null;
};

export interface StockSaleOutcome {
  tradeId: string;
  netProceeds: number;
  removedCost: number;
  averageCostBeforeSale: number;
  realizedGain: number;
}

export interface StockReplaySuccess {
  ok: true;
  position: StockPosition;
  sales: StockSaleOutcome[];
}

export interface StockReplayFailure {
  ok: false;
  error: string;
}

export type StockReplayResult = StockReplaySuccess | StockReplayFailure;

/**
 * Replay a symbol's complete trade history in deterministic order to derive
 * its current position (shares, cost, average cost, cumulative realized
 * P&L). Buys add `shares * unitPrice + fee + tax` to cost. Sells remove the
 * pre-sale moving-average cost multiplied by sold shares and never change
 * the average cost of the remaining shares. Fails when any field is invalid
 * or a sell would take shares negative.
 */
export const replayStockTrades = (trades: StockTrade[]): StockReplayResult => {
  if (trades.length === 0) {
    return {
      ok: true,
      position: { symbol: '', shares: 0, totalCost: 0, averageCost: 0, realizedPnl: 0 },
      sales: [],
    };
  }

  const symbol = normalizeStockSymbol(trades[0].symbol);
  const sorted = sortStockTrades(trades);

  let shares = 0;
  let cost = 0;
  let realizedPnl = 0;
  const sales: StockSaleOutcome[] = [];

  for (const trade of sorted) {
    const fieldError = validateStockTradeFields(trade);
    if (fieldError) {
      return { ok: false, error: fieldError };
    }

    if (trade.side === 'buy') {
      shares += trade.shares;
      cost += trade.shares * trade.unitPrice + trade.fee + trade.tax;
      continue;
    }

    if (trade.shares > shares) {
      return {
        ok: false,
        error: `賣出股數 ${trade.shares} 超過目前持有的 ${shares} 股，交易遭拒絕。`,
      };
    }

    const averageCostBeforeSale = shares > 0 ? cost / shares : 0;
    const removedCost = averageCostBeforeSale * trade.shares;
    const netProceeds = trade.shares * trade.unitPrice - trade.fee - trade.tax;
    const realizedGain = netProceeds - removedCost;

    shares -= trade.shares;
    cost -= removedCost;
    realizedPnl += realizedGain;

    sales.push({
      tradeId: trade.id,
      netProceeds,
      removedCost,
      averageCostBeforeSale,
      realizedGain,
    });
  }

  return {
    ok: true,
    position: {
      symbol,
      shares,
      totalCost: roundCurrency(cost),
      averageCost: shares > 0 ? roundCurrency(cost / shares) : 0,
      realizedPnl: roundCurrency(realizedPnl),
    },
    sales,
  };
};

export type StockMutation =
  | { type: 'create'; trade: StockTrade }
  | { type: 'edit'; trade: StockTrade }
  | { type: 'delete'; id: string };

export interface StockMutationSuccess {
  ok: true;
  trades: StockTrade[];
  position: StockPosition;
  sales: StockSaleOutcome[];
}

export interface StockMutationFailure {
  ok: false;
  error: string;
}

export type StockMutationResult = StockMutationSuccess | StockMutationFailure;

/**
 * Validate the complete symbol timeline before committing a mutation.
 * `existingSymbolTrades` MUST already be scoped to the mutated trade's
 * normalized symbol. Applies the create/edit/delete, then replays the
 * resulting timeline; rejects when any resulting state is invalid (empty
 * symbol, invalid fields, negative net proceeds, or an oversell caused
 * directly or by a historical edit/delete). On rejection, the caller MUST
 * leave existing trades and linked ledger entries untouched.
 */
export const applyStockMutation = (
  existingSymbolTrades: StockTrade[],
  mutation: StockMutation
): StockMutationResult => {
  let nextTrades: StockTrade[];

  if (mutation.type === 'create') {
    nextTrades = [...existingSymbolTrades, mutation.trade];
  } else if (mutation.type === 'edit') {
    const exists = existingSymbolTrades.some((trade) => trade.id === mutation.trade.id);
    if (!exists) {
      return { ok: false, error: '找不到要編輯的股票交易紀錄。' };
    }
    nextTrades = existingSymbolTrades.map((trade) =>
      trade.id === mutation.trade.id ? mutation.trade : trade
    );
  } else {
    nextTrades = existingSymbolTrades.filter((trade) => trade.id !== mutation.id);
  }

  const replay = replayStockTrades(nextTrades);
  if (!replay.ok) {
    return replay;
  }

  return { ok: true, trades: nextTrades, position: replay.position, sales: replay.sales };
};

export interface StockLedgerEntry {
  role: 'settlement-buy' | 'settlement-sell' | 'gain-retain' | 'gain-allocate' | 'loss';
  type: 'income' | 'expense';
  amount: number;
  effect: TransactionEffect;
  accountGroupId: string;
  category: string;
  date: string;
  stockTradeId: string;
}

export interface StockLedgerOptions {
  investmentAccountGroupId: string;
  sourceAccountGroupId?: string;
}

/**
 * Project a single trade (and its sale outcome, when it is a sell) into the
 * cash-only and P&L-only ledger rows it generates. A buy/sell settlement row
 * is created only when a settlement account was selected. A sale's realized
 * result becomes a separate P&L-only row (or two, for a split gain) so
 * principal is never counted as income and gains never move cash a second
 * time.
 */
export const buildStockLedgerEntries = (
  trade: StockTrade,
  sale: StockSaleOutcome | null,
  options: StockLedgerOptions
): StockLedgerEntry[] => {
  const entries: StockLedgerEntry[] = [];

  if (trade.settlementAccountGroupId) {
    if (trade.side === 'buy') {
      entries.push({
        role: 'settlement-buy',
        type: 'expense',
        amount: roundCurrency(trade.shares * trade.unitPrice + trade.fee + trade.tax),
        effect: 'cash',
        accountGroupId: trade.settlementAccountGroupId,
        category: STOCK_SETTLEMENT_CATEGORY,
        date: trade.tradedAt,
        stockTradeId: trade.id,
      });
    } else if (sale) {
      entries.push({
        role: 'settlement-sell',
        type: 'income',
        amount: roundCurrency(sale.netProceeds),
        effect: 'cash',
        accountGroupId: trade.settlementAccountGroupId,
        category: STOCK_SETTLEMENT_CATEGORY,
        date: trade.tradedAt,
        stockTradeId: trade.id,
      });
    }
  }

  if (trade.side === 'sell' && sale) {
    const gain = roundCurrency(sale.realizedGain);

    if (gain < 0) {
      entries.push({
        role: 'loss',
        type: 'expense',
        amount: Math.abs(gain),
        effect: 'pnl',
        accountGroupId: options.investmentAccountGroupId,
        category: STOCK_LOSS_CATEGORY,
        date: trade.tradedAt,
        stockTradeId: trade.id,
      });
    } else if (gain > 0) {
      const disposition = trade.gainDisposition ?? 'retain';
      const canAllocate = !!options.sourceAccountGroupId;

      if (disposition === 'allocate' && canAllocate) {
        entries.push({
          role: 'gain-allocate',
          type: 'income',
          amount: gain,
          effect: 'pnl',
          accountGroupId: options.sourceAccountGroupId as string,
          category: STOCK_GAIN_ALLOCATE_CATEGORY,
          date: trade.tradedAt,
          stockTradeId: trade.id,
        });
      } else if (disposition === 'split' && canAllocate) {
        const percent = trade.allocationPercent ?? 0;
        const allocatedAmount = roundCurrency(gain * (percent / 100));
        const retainedAmount = gain - allocatedAmount;

        if (allocatedAmount > 0) {
          entries.push({
            role: 'gain-allocate',
            type: 'income',
            amount: allocatedAmount,
            effect: 'pnl',
            accountGroupId: options.sourceAccountGroupId as string,
            category: STOCK_GAIN_ALLOCATE_CATEGORY,
            date: trade.tradedAt,
            stockTradeId: trade.id,
          });
        }
        if (retainedAmount > 0) {
          entries.push({
            role: 'gain-retain',
            type: 'income',
            amount: retainedAmount,
            effect: 'pnl',
            accountGroupId: options.investmentAccountGroupId,
            category: STOCK_GAIN_RETAIN_CATEGORY,
            date: trade.tradedAt,
            stockTradeId: trade.id,
          });
        }
      } else {
        // retain, or allocate/split requested with no source group available.
        entries.push({
          role: 'gain-retain',
          type: 'income',
          amount: gain,
          effect: 'pnl',
          accountGroupId: options.investmentAccountGroupId,
          category: STOCK_GAIN_RETAIN_CATEGORY,
          date: trade.tradedAt,
          stockTradeId: trade.id,
        });
      }
    }
    // gain === 0: no P&L entry is created.
  }

  return entries;
};

export interface StockSymbolLedgerPlanSuccess {
  ok: true;
  position: StockPosition;
  entries: StockLedgerEntry[];
}

export type StockSymbolLedgerPlanResult = StockSymbolLedgerPlanSuccess | StockReplayFailure;

/**
 * Replay a symbol's full trade list and project every trade's ledger rows in
 * one pass, for use when atomically rebuilding all `stockTradeId`-linked
 * transactions after a create, edit, or delete.
 */
export const buildSymbolLedgerPlan = (
  trades: StockTrade[],
  options: StockLedgerOptions
): StockSymbolLedgerPlanResult => {
  const replay = replayStockTrades(trades);
  if (!replay.ok) {
    return replay;
  }

  const salesByTradeId = new Map(replay.sales.map((sale) => [sale.tradeId, sale]));
  const entries: StockLedgerEntry[] = [];
  for (const trade of trades) {
    entries.push(...buildStockLedgerEntries(trade, salesByTradeId.get(trade.id) ?? null, options));
  }

  return { ok: true, position: replay.position, entries };
};

/**
 * Centralized predicate for whether a transaction affects account-group cash
 * balances. Missing `effect` (legacy rows) is treated as `both`, which
 * affects cash. Only rows explicitly marked `pnl` are excluded.
 */
export const isCashAffectingTransaction = (tx: Pick<Transaction, 'effect'>): boolean =>
  tx.effect !== 'pnl';

/**
 * Centralized predicate for whether a transaction affects P&L-facing
 * reporting: income/expense totals, budgets, statistics, and allocation
 * totals. Missing `effect` (legacy rows) is treated as `both`, which affects
 * P&L. Only rows explicitly marked `cash` are excluded.
 */
export const isPnlAffectingTransaction = (tx: Pick<Transaction, 'effect'>): boolean =>
  tx.effect !== 'cash';
