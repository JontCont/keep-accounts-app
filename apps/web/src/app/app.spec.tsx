import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

import App, { getCurrentMonthExpenseForGroup, Transaction } from './app';

describe('App', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(baseElement).toBeTruthy();
  });

  it('should have Keep Accounts as the title', () => {
    const { getAllByText } = render(<BrowserRouter><App /></BrowserRouter>);
    expect(getAllByText(new RegExp('Keep Accounts', 'gi')).length > 0).toBeTruthy();
  });
});

describe('getCurrentMonthExpenseForGroup', () => {
  it('should sum expenses for the correct group and month', () => {
    const mockTxs: Transaction[] = [
      { id: '1', description: 'lunch', amount: 150, type: 'expense', category: 'food', date: '2026-07-06', accountGroupId: '1' },
      { id: '2', description: 'dinner', amount: 250, type: 'expense', category: 'food', date: '2026-07-10', accountGroupId: '1' },
      { id: '3', description: 'salary', amount: 45000, type: 'income', category: 'salary', date: '2026-07-05', accountGroupId: '1' },
      { id: '4', description: 'other group', amount: 500, type: 'expense', category: 'other', date: '2026-07-06', accountGroupId: '2' },
      { id: '5', description: 'next month', amount: 300, type: 'expense', category: 'food', date: '2026-08-01', accountGroupId: '1' },
    ];
    const refDate = new Date('2026-07-15');
    const total = getCurrentMonthExpenseForGroup('1', mockTxs, refDate);
    expect(total).toBe(400); // 150 + 250
  });

  it('should return 0 when there are no matching transactions', () => {
    const total = getCurrentMonthExpenseForGroup('1', [], new Date('2026-07-15'));
    expect(total).toBe(0);
  });
});
