import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { ActivityTab } from './ActivityTab';

vi.mock('./HistoryTab', () => ({
  HistoryTab: () => <div data-testid="activity-history">交易明細內容</div>,
}));

vi.mock('./StatsTab', () => ({
  StatsTab: () => <div data-testid="activity-stats">支出分析內容</div>,
}));

describe('ActivityTab', () => {
  const props = {
    accountGroups: [],
    financialAccounts: [],
    transactions: [],
    preferNativeQueries: false,
    onDeleteTransaction: vi.fn(),
    onDeleteInstallmentGroup: vi.fn(),
    onSettleInstallmentGroup: vi.fn(),
    getCategoryEmoji: vi.fn(),
    getGroupName: vi.fn(),
    onEditTransaction: vi.fn(),
    onAddTransaction: vi.fn(),
    showFab: true,
  };

  it('switches between transaction history and spending analysis', () => {
    const { getByRole, getByTestId, queryByTestId } = render(<ActivityTab {...props} />);

    expect(getByTestId('activity-history')).toBeTruthy();
    expect(queryByTestId('activity-stats')).toBeNull();
    expect(getByRole('tab', { name: '交易明細' }).getAttribute('aria-selected')).toBe('true');

    fireEvent.click(getByRole('tab', { name: '支出分析' }));

    expect(queryByTestId('activity-history')).toBeNull();
    expect(getByTestId('activity-stats')).toBeTruthy();
    expect(getByRole('tab', { name: '支出分析' }).getAttribute('aria-selected')).toBe('true');
  });
});
