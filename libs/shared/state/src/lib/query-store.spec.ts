import { describe, expect, it } from 'vitest';

import { queryHistoryPage, queryStatsAggregates } from './query-store';

const makeTransactions = (count: number) =>
  Array.from({ length: count }).map((_, idx) => ({
    id: `tx-${idx + 1}`,
    description: `TX-${String(count - idx).padStart(3, '0')}`,
    amount: idx + 1,
    type: idx % 5 === 0 ? 'income' : 'expense',
    category: idx % 2 === 0 ? '餐飲食品' : '交通通勤',
    date: new Date(Date.UTC(2026, 0, 31, 12, 0, 0) - idx * 60 * 1000).toISOString(),
    accountGroupId: idx % 3 === 0 ? '2' : '1',
  })) as any[];

describe('query-store', () => {
  it('returns deterministic paginated history pages for a 120-row dataset', () => {
    const txs = makeTransactions(120);

    const page1 = queryHistoryPage({
      transactions: txs as any,
      filterType: 'all',
      filterGroup: 'all',
      offset: 0,
      pageSize: 50,
    });
    expect(page1.items).toHaveLength(50);
    expect(page1.items[0].description).toBe('TX-120');
    expect(page1.items[49].description).toBe('TX-071');
    expect(page1.hasMore).toBe(true);

    const page2 = queryHistoryPage({
      transactions: txs as any,
      filterType: 'all',
      filterGroup: 'all',
      offset: page1.nextOffset,
      pageSize: 50,
    });
    expect(page2.items).toHaveLength(50);
    expect(page2.items[0].description).toBe('TX-070');
    expect(page2.items[49].description).toBe('TX-021');
    expect(page2.hasMore).toBe(true);

    const page3 = queryHistoryPage({
      transactions: txs as any,
      filterType: 'all',
      filterGroup: 'all',
      offset: page2.nextOffset,
      pageSize: 50,
    });
    expect(page3.items).toHaveLength(20);
    expect(page3.items[0].description).toBe('TX-020');
    expect(page3.items[19].description).toBe('TX-001');
    expect(page3.hasMore).toBe(false);
  });

  it('aggregates stats by scoped categories and sorted daily trend', () => {
    const accountGroups = [
      {
        id: '1',
        name: '日常開銷',
        categories: [
          { name: '餐飲食品', emoji: 'coffee', color: '#ff9900', type: 'expense' },
          { name: '交通通勤', emoji: 'car', color: '#3366ff', type: 'expense' },
        ],
      },
      {
        id: '2',
        name: '投資理財',
        categories: [{ name: '手續費', emoji: 'briefcase', color: '#00aa88', type: 'expense' }],
      },
    ] as any;
    const txs = [
      { id: '1', amount: 100, type: 'expense', category: '餐飲食品', date: '2026-01-01T10:00:00+08:00', accountGroupId: '1' },
      { id: '2', amount: 120, type: 'expense', category: '交通通勤', date: '2026-01-02T10:00:00+08:00', accountGroupId: '1' },
      { id: '3', amount: 60, type: 'expense', category: '交通通勤', date: '2026-01-02T12:00:00+08:00', accountGroupId: '1' },
      { id: '4', amount: 90, type: 'expense', category: '手續費', date: '2026-01-03T10:00:00+08:00', accountGroupId: '2' },
    ] as any;

    const scoped = queryStatsAggregates({
      transactions: txs,
      accountGroups,
      statsGroup: '1',
    });

    expect(scoped.totalCount).toBe(3);
    expect(scoped.totalExpense).toBe(280);
    expect(scoped.categories[0].name).toBe('交通通勤');
    expect(scoped.categories[0].amount).toBe(180);
    expect(scoped.trend.map((point) => point.date)).toEqual(['2026-01-01', '2026-01-02']);
  });

  it('returns zero totals and empty lists for empty scoped expenses', () => {
    const result = queryStatsAggregates({
      transactions: [],
      accountGroups: [],
      statsGroup: 'all',
    });

    expect(result.totalCount).toBe(0);
    expect(result.totalExpense).toBe(0);
    expect(result.categories).toEqual([]);
    expect(result.trend).toEqual([]);
  });
});
