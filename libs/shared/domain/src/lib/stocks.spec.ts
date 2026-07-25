import { describe, expect, it } from 'vitest';
import {
  applyStockMutation,
  buildStockLedgerEntries,
  buildSymbolLedgerPlan,
  isCashAffectingTransaction,
  isPnlAffectingTransaction,
  normalizeStockSymbol,
  replayStockTrades,
  sortStockTrades,
  validateStockTradeFields,
  STOCK_GAIN_ALLOCATE_CATEGORY,
  STOCK_GAIN_RETAIN_CATEGORY,
  STOCK_LOSS_CATEGORY,
  STOCK_SETTLEMENT_CATEGORY,
} from './stocks';
import { StockTrade } from './types';

const trade = (overrides: Partial<StockTrade> & Pick<StockTrade, 'id'>): StockTrade => ({
  symbol: '2330',
  side: 'buy',
  shares: 100,
  unitPrice: 10,
  fee: 0,
  tax: 0,
  tradedAt: '2026-01-01T09:00:00+08:00',
  gainDisposition: 'retain',
  createdAt: '2026-01-01T09:00:00+08:00',
  ...overrides,
});

describe('normalizeStockSymbol', () => {
  it('trims and uppercases symbols so lookups are consistent', () => {
    expect(normalizeStockSymbol('  2330 ')).toBe('2330');
    expect(normalizeStockSymbol('aapl')).toBe('AAPL');
  });
});

describe('sortStockTrades', () => {
  it('orders by tradedAt, then createdAt, then id for deterministic tie-breaking', () => {
    const t1 = trade({ id: 'b', tradedAt: '2026-01-01T00:00:00+08:00', createdAt: '2026-01-01T00:00:00+08:00' });
    const t2 = trade({ id: 'a', tradedAt: '2026-01-01T00:00:00+08:00', createdAt: '2026-01-01T00:00:00+08:00' });
    const t3 = trade({ id: 'c', tradedAt: '2025-01-01T00:00:00+08:00', createdAt: '2026-01-01T00:00:00+08:00' });

    const sorted = sortStockTrades([t1, t2, t3]);
    expect(sorted.map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('breaks a tradedAt tie using createdAt', () => {
    const earlierCreated = trade({
      id: 'later-id',
      tradedAt: '2026-01-01T00:00:00+08:00',
      createdAt: '2026-01-01T00:00:00+08:00',
    });
    const laterCreated = trade({
      id: 'earlier-id',
      tradedAt: '2026-01-01T00:00:00+08:00',
      createdAt: '2026-01-02T00:00:00+08:00',
    });

    const sorted = sortStockTrades([laterCreated, earlierCreated]);
    expect(sorted.map((t) => t.id)).toEqual(['later-id', 'earlier-id']);
  });
});

describe('validateStockTradeFields', () => {
  it('rejects an empty symbol', () => {
    expect(validateStockTradeFields({ ...trade({ id: '1' }), symbol: '  ' })).toMatch(/股票代號/);
  });

  it('rejects non-integer or non-positive share counts', () => {
    expect(validateStockTradeFields({ ...trade({ id: '1' }), shares: 0 })).toMatch(/股數/);
    expect(validateStockTradeFields({ ...trade({ id: '1' }), shares: 1.5 })).toMatch(/股數/);
  });

  it('rejects non-positive unit price and negative fee/tax', () => {
    expect(validateStockTradeFields({ ...trade({ id: '1' }), unitPrice: 0 })).toMatch(/單價/);
    expect(validateStockTradeFields({ ...trade({ id: '1' }), fee: -1 })).toMatch(/手續費/);
    expect(validateStockTradeFields({ ...trade({ id: '1' }), tax: -1 })).toMatch(/交易稅/);
  });

  it('rejects a sale whose net proceeds would be negative', () => {
    const sale = trade({
      id: '1',
      side: 'sell',
      shares: 10,
      unitPrice: 1,
      fee: 5,
      tax: 10,
    });
    expect(validateStockTradeFields(sale)).toMatch(/賣出淨收入/);
  });

  it('rejects an invalid split allocation percentage', () => {
    const sale = trade({
      id: '1',
      side: 'sell',
      gainDisposition: 'split',
      allocationPercent: 150,
    });
    expect(validateStockTradeFields(sale)).toMatch(/分配百分比/);
  });
});

describe('replayStockTrades: moving-average cost', () => {
  it('derives shares, cost, and average cost after multiple buys and a partial sale', () => {
    const trades: StockTrade[] = [
      trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 }),
      trade({ id: '2', side: 'buy', shares: 100, unitPrice: 14 }),
      trade({ id: '3', side: 'sell', shares: 100, unitPrice: 15 }),
    ];

    const result = replayStockTrades(trades);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    expect(result.position).toEqual({
      symbol: '2330',
      shares: 100,
      totalCost: 1200,
      averageCost: 12,
      realizedPnl: 300,
    });

    expect(result.sales).toHaveLength(1);
    expect(result.sales[0]).toMatchObject({
      tradeId: '3',
      averageCostBeforeSale: 12,
      removedCost: 1200,
      netProceeds: 1500,
      realizedGain: 300,
    });
  });

  it('matches the buy-100-at-10-then-sell-100-at-12 example (buy without settlement)', () => {
    const trades: StockTrade[] = [trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 })];
    const result = replayStockTrades(trades);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.position).toEqual({
      symbol: '2330',
      shares: 100,
      totalCost: 1000,
      averageCost: 10,
      realizedPnl: 0,
    });
  });

  it('applies fees and taxes to buy cost and to sale net proceeds', () => {
    const trades: StockTrade[] = [
      trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10, fee: 5, tax: 5 }),
      trade({ id: '2', side: 'sell', shares: 100, unitPrice: 12, fee: 10, tax: 20 }),
    ];
    const result = replayStockTrades(trades);
    expect(result.ok).toBe(true);
    if (!result.ok) return;

    // Cost basis: 100*10 + 5 + 5 = 1010. Sale: net proceeds = 1200-10-20=1170; gain = 1170-1010=160.
    expect(result.sales[0].netProceeds).toBe(1170);
    expect(result.sales[0].removedCost).toBe(1010);
    expect(result.sales[0].realizedGain).toBe(160);
  });

  it('records a realized loss when net proceeds are below removed cost', () => {
    const trades: StockTrade[] = [
      trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 }),
      trade({ id: '2', side: 'sell', shares: 100, unitPrice: 9 }),
    ];
    const result = replayStockTrades(trades);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.sales[0].realizedGain).toBe(-100);
    expect(result.position.realizedPnl).toBe(-100);
  });

  it('rejects a direct oversell and reports the error', () => {
    const trades: StockTrade[] = [
      trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 }),
      trade({ id: '2', side: 'sell', shares: 101, unitPrice: 10 }),
    ];
    const result = replayStockTrades(trades);
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.error).toMatch(/超過目前持有/);
  });
});

describe('applyStockMutation: timeline validation before commit', () => {
  it('creates a new trade when the resulting timeline is valid', () => {
    const existing: StockTrade[] = [trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 })];
    const result = applyStockMutation(existing, {
      type: 'create',
      trade: trade({ id: '2', side: 'sell', shares: 50, unitPrice: 12 }),
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.trades).toHaveLength(2);
    expect(result.position.shares).toBe(50);
  });

  it('rejects an oversell and leaves the original trades untouched', () => {
    const existing: StockTrade[] = [trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 })];
    const existingSnapshot = JSON.parse(JSON.stringify(existing));

    const result = applyStockMutation(existing, {
      type: 'create',
      trade: trade({ id: '2', side: 'sell', shares: 101, unitPrice: 10 }),
    });

    expect(result.ok).toBe(false);
    // The caller-provided array must not have been mutated by the attempt.
    expect(existing).toEqual(existingSnapshot);
  });

  it('rejects an edit that invalidates a later sale, leaving the timeline unchanged', () => {
    const buy = trade({ id: 'buy-1', side: 'buy', shares: 100, unitPrice: 10 });
    const sell = trade({
      id: 'sell-1',
      side: 'sell',
      shares: 100,
      unitPrice: 12,
      tradedAt: '2026-01-02T09:00:00+08:00',
      createdAt: '2026-01-02T09:00:00+08:00',
    });
    const existing: StockTrade[] = [buy, sell];
    const existingSnapshot = JSON.parse(JSON.stringify(existing));

    const editedBuy: StockTrade = { ...buy, shares: 50 };
    const result = applyStockMutation(existing, { type: 'edit', trade: editedBuy });

    expect(result.ok).toBe(false);
    expect(existing).toEqual(existingSnapshot);
  });

  it('rejects a mutation with an empty symbol', () => {
    const result = applyStockMutation([], {
      type: 'create',
      trade: trade({ id: '1', symbol: '   ' }),
    });
    expect(result.ok).toBe(false);
  });

  it('deletes a trade and recalculates the remaining timeline', () => {
    const buy = trade({ id: 'buy-1', side: 'buy', shares: 100, unitPrice: 10 });
    const sell = trade({
      id: 'sell-1',
      side: 'sell',
      shares: 50,
      unitPrice: 12,
      tradedAt: '2026-01-02T09:00:00+08:00',
      createdAt: '2026-01-02T09:00:00+08:00',
    });
    const existing: StockTrade[] = [buy, sell];

    const result = applyStockMutation(existing, { type: 'delete', id: 'sell-1' });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.trades).toHaveLength(1);
    expect(result.position.shares).toBe(100);
  });
});

describe('buildStockLedgerEntries: cash vs P&L separation', () => {
  const options = { investmentAccountGroupId: 'inv', sourceAccountGroupId: 'src' };

  it('creates no ledger rows for a buy with no settlement account', () => {
    const buy = trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 });
    const entries = buildStockLedgerEntries(buy, null, options);
    expect(entries).toEqual([]);
  });

  it('creates a cash-only settlement expense for a buy with a settlement account', () => {
    const buy = trade({
      id: '1',
      side: 'buy',
      shares: 100,
      unitPrice: 10,
      settlementAccountGroupId: 'cash-acct',
    });
    const entries = buildStockLedgerEntries(buy, null, options);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      role: 'settlement-buy',
      type: 'expense',
      amount: 1000,
      effect: 'cash',
      accountGroupId: 'cash-acct',
      category: STOCK_SETTLEMENT_CATEGORY,
    });
  });

  it('creates cash settlement income plus a retained-gain P&L entry for a profitable sale with settlement', () => {
    const sell = trade({
      id: '1',
      side: 'sell',
      shares: 100,
      unitPrice: 12,
      settlementAccountGroupId: 'cash-acct',
      gainDisposition: 'retain',
    });
    const sale = {
      tradeId: '1',
      netProceeds: 1200,
      removedCost: 1000,
      averageCostBeforeSale: 10,
      realizedGain: 200,
    };
    const entries = buildStockLedgerEntries(sell, sale, options);

    expect(entries).toHaveLength(2);
    const settlement = entries.find((e) => e.role === 'settlement-sell');
    const gain = entries.find((e) => e.role === 'gain-retain');

    expect(settlement).toMatchObject({
      type: 'income',
      amount: 1200,
      effect: 'cash',
      accountGroupId: 'cash-acct',
    });
    // Principal is never counted twice: the gain entry is only the realized 200, not the 1200 proceeds.
    expect(gain).toMatchObject({
      type: 'income',
      amount: 200,
      effect: 'pnl',
      accountGroupId: 'inv',
      category: STOCK_GAIN_RETAIN_CATEGORY,
    });
  });

  it('creates an allocation P&L entry in the source group when disposition is allocate', () => {
    const sell = trade({ id: '1', side: 'sell', shares: 100, unitPrice: 12, gainDisposition: 'allocate' });
    const sale = {
      tradeId: '1',
      netProceeds: 1200,
      removedCost: 1000,
      averageCostBeforeSale: 10,
      realizedGain: 200,
    };
    const entries = buildStockLedgerEntries(sell, sale, options);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      role: 'gain-allocate',
      amount: 200,
      effect: 'pnl',
      accountGroupId: 'src',
      category: STOCK_GAIN_ALLOCATE_CATEGORY,
    });
  });

  it('splits the gain between allocation and retention, summing exactly to the gain', () => {
    const sell = trade({
      id: '1',
      side: 'sell',
      shares: 100,
      unitPrice: 12,
      gainDisposition: 'split',
      allocationPercent: 30,
    });
    const sale = {
      tradeId: '1',
      netProceeds: 1200,
      removedCost: 1000,
      averageCostBeforeSale: 10,
      realizedGain: 200,
    };
    const entries = buildStockLedgerEntries(sell, sale, options);
    const allocate = entries.find((e) => e.role === 'gain-allocate');
    const retain = entries.find((e) => e.role === 'gain-retain');

    expect(allocate?.amount).toBe(60);
    expect(retain?.amount).toBe(140);
    expect((allocate?.amount ?? 0) + (retain?.amount ?? 0)).toBe(200);
  });

  it('allocates 0 percent as fully retained and 100 percent as fully allocated', () => {
    const sale = {
      tradeId: '1',
      netProceeds: 1200,
      removedCost: 1000,
      averageCostBeforeSale: 10,
      realizedGain: 200,
    };

    const zeroPercent = buildStockLedgerEntries(
      trade({ id: '1', side: 'sell', gainDisposition: 'split', allocationPercent: 0 }),
      sale,
      options
    );
    expect(zeroPercent.find((e) => e.role === 'gain-allocate')).toBeUndefined();
    expect(zeroPercent.find((e) => e.role === 'gain-retain')?.amount).toBe(200);

    const fullPercent = buildStockLedgerEntries(
      trade({ id: '1', side: 'sell', gainDisposition: 'split', allocationPercent: 100 }),
      sale,
      options
    );
    expect(fullPercent.find((e) => e.role === 'gain-retain')).toBeUndefined();
    expect(fullPercent.find((e) => e.role === 'gain-allocate')?.amount).toBe(200);
  });

  it('assigns the currency-rounding remainder to the retained amount', () => {
    const sale = {
      tradeId: '1',
      netProceeds: 100,
      removedCost: 0,
      averageCostBeforeSale: 0,
      realizedGain: 100,
    };
    const entries = buildStockLedgerEntries(
      trade({ id: '1', side: 'sell', gainDisposition: 'split', allocationPercent: 33 }),
      sale,
      options
    );
    const allocate = entries.find((e) => e.role === 'gain-allocate');
    const retain = entries.find((e) => e.role === 'gain-retain');
    // 100 * 0.33 = 33 (rounds cleanly); remainder 67 goes to retain.
    expect(allocate?.amount).toBe(33);
    expect(retain?.amount).toBe(67);
    expect((allocate?.amount ?? 0) + (retain?.amount ?? 0)).toBe(100);
  });

  it('creates a single loss P&L entry and never offers allocation for a loss', () => {
    const sell = trade({ id: '1', side: 'sell', shares: 100, unitPrice: 9, gainDisposition: 'allocate' });
    const sale = {
      tradeId: '1',
      netProceeds: 900,
      removedCost: 1000,
      averageCostBeforeSale: 10,
      realizedGain: -100,
    };
    const entries = buildStockLedgerEntries(sell, sale, options);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toMatchObject({
      role: 'loss',
      type: 'expense',
      amount: 100,
      effect: 'pnl',
      accountGroupId: 'inv',
      category: STOCK_LOSS_CATEGORY,
    });
  });

  it('creates no P&L entry for a zero-gain sale', () => {
    const sell = trade({ id: '1', side: 'sell', shares: 100, unitPrice: 10 });
    const sale = {
      tradeId: '1',
      netProceeds: 1000,
      removedCost: 1000,
      averageCostBeforeSale: 10,
      realizedGain: 0,
    };
    const entries = buildStockLedgerEntries(sell, sale, options);
    expect(entries).toEqual([]);
  });
});

describe('buildSymbolLedgerPlan', () => {
  it('projects every trade in a symbol timeline into ledger rows in one pass', () => {
    const trades: StockTrade[] = [
      trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10, settlementAccountGroupId: 'cash-acct' }),
      trade({
        id: '2',
        side: 'sell',
        shares: 100,
        unitPrice: 12,
        settlementAccountGroupId: 'cash-acct',
        gainDisposition: 'retain',
        tradedAt: '2026-01-02T09:00:00+08:00',
        createdAt: '2026-01-02T09:00:00+08:00',
      }),
    ];

    const plan = buildSymbolLedgerPlan(trades, {
      investmentAccountGroupId: 'inv',
      sourceAccountGroupId: 'src',
    });
    expect(plan.ok).toBe(true);
    if (!plan.ok) return;

    expect(plan.position).toEqual({
      symbol: '2330',
      shares: 0,
      totalCost: 0,
      averageCost: 0,
      realizedPnl: 200,
    });
    expect(plan.entries).toHaveLength(3); // settlement-buy, settlement-sell, gain-retain
  });

  it('propagates a replay failure instead of producing partial ledger rows', () => {
    const trades: StockTrade[] = [
      trade({ id: '1', side: 'buy', shares: 100, unitPrice: 10 }),
      trade({ id: '2', side: 'sell', shares: 200, unitPrice: 10 }),
    ];
    const plan = buildSymbolLedgerPlan(trades, { investmentAccountGroupId: 'inv' });
    expect(plan.ok).toBe(false);
  });
});

describe('centralized cash/P&L effect predicates', () => {
  it('treats a missing effect as both cash- and P&L-affecting for legacy rows', () => {
    expect(isCashAffectingTransaction({ effect: undefined })).toBe(true);
    expect(isPnlAffectingTransaction({ effect: undefined })).toBe(true);
  });

  it('excludes pnl-only rows from cash and cash-only rows from P&L', () => {
    expect(isCashAffectingTransaction({ effect: 'pnl' })).toBe(false);
    expect(isPnlAffectingTransaction({ effect: 'pnl' })).toBe(true);

    expect(isCashAffectingTransaction({ effect: 'cash' })).toBe(true);
    expect(isPnlAffectingTransaction({ effect: 'cash' })).toBe(false);
  });

  it('includes both-affecting rows in both cash and P&L', () => {
    expect(isCashAffectingTransaction({ effect: 'both' })).toBe(true);
    expect(isPnlAffectingTransaction({ effect: 'both' })).toBe(true);
  });
});
