import { describe, expect, it } from 'vitest';

import { createWidgetSummary } from '@keep-accounts-app/state';

describe('createWidgetSummary', () => {
  it('excludes future transactions from total balance but includes them in monthly totals', () => {
    const summary = createWidgetSummary(
      [
        {
          id: 'income-previous',
          description: 'Previous income',
          amount: 2000,
          type: 'income',
          category: 'income',
          date: '2026-08-20T09:00:00+08:00',
          accountGroupId: '1',
        },
        {
          id: 'income-current',
          description: 'Current income',
          amount: 5000,
          type: 'income',
          category: 'income',
          date: '2026-09-01T09:00:00+08:00',
          accountGroupId: '1',
        },
        {
          id: 'expense-realized',
          description: 'Realized expense',
          amount: 1200,
          type: 'expense',
          category: 'expense',
          date: '2026-09-06T09:00:00+08:00',
          accountGroupId: '1',
        },
        {
          id: 'expense-future',
          description: 'Future expense',
          amount: 500,
          type: 'expense',
          category: 'expense',
          date: '2026-09-20T09:00:00+08:00',
          accountGroupId: '1',
        },
      ],
      new Date('2026-09-06T12:00:00.000Z')
    );

    expect(summary).toEqual({
      totalBalance: 5800,
      monthlyIncome: 5000,
      monthlyExpense: 1700,
      updatedAt: '2026-09-06T12:00:00.000Z',
    });
  });
});