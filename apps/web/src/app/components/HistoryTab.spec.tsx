import { describe, it, expect, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';

import { HistoryTab } from './HistoryTab';

vi.mock('@ionic/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@ionic/react')>();
  const React = await import('react');

  return {
    ...original,
    IonSelect: ({ value, onIonChange, children }: any) =>
      React.createElement(
        'select',
        {
          value,
          onChange: (e: any) => onIonChange?.({ detail: { value: e.target.value } }),
        },
        children
      ),
    IonSelectOption: ({ value, children }: any) =>
      React.createElement('option', { value }, children),
    IonInfiniteScroll: ({ children, onIonInfinite, disabled, ...props }: any) =>
      React.createElement(
        'div',
        props,
        children,
        React.createElement(
          'button',
          {
            type: 'button',
            'data-testid': 'history-infinite-trigger',
            disabled,
            onClick: () => onIonInfinite?.({ target: { complete: vi.fn() } }),
          },
          'trigger'
        )
      ),
    IonInfiniteScrollContent: () => React.createElement('div'),
    IonSkeletonText: ({ animated, ...props }: any) =>
      React.createElement('div', { ...props, 'data-testid': animated ? 'ion-skeleton-text' : 'ion-skeleton-static' }),
  };
});

const noop = () => undefined;

const createTransactions = (
  total: number,
  options?: {
    alternatingType?: boolean;
    twoMonthSplit?: boolean;
  }
) => {
  const now = Date.UTC(2026, 1, 28, 12, 0, 0);
  return Array.from({ length: total }).map((_, idx) => {
    const ts = now - idx * 60 * 1000;
    const descIndex = String(total - idx).padStart(3, '0');
    const isIncome = options?.alternatingType ? idx % 2 === 0 : false;
    const monthDate = options?.twoMonthSplit
      ? idx < total / 2
        ? `2026-02-${String((idx % 28) + 1).padStart(2, '0')}T12:00:00+08:00`
        : `2026-01-${String((idx % 28) + 1).padStart(2, '0')}T12:00:00+08:00`
      : new Date(ts).toISOString();

    const type = isIncome ? 'income' : 'expense';
    return {
      id: `tx-${idx + 1}`,
      description: `${isIncome ? 'INC' : 'EXP'}-${descIndex}`,
      amount: idx + 1,
      type,
      category: isIncome ? '薪資收入' : '餐飲食品',
      date: monthDate,
      accountGroupId: '1',
    };
  });
};

const renderHistoryTab = (transactions: any[]) =>
  render(
    <HistoryTab
      accountGroups={[
        { id: '1', name: '日常開銷', emoji: 'credit-card', color: '#6366f1', categories: [] } as any,
      ]}
      transactions={transactions as any}
      onDeleteTransaction={noop}
      onDeleteInstallmentGroup={noop}
      onSettleInstallmentGroup={noop}
      getCategoryEmoji={() => 'coffee'}
      getGroupName={() => '日常開銷'}
      onEditTransaction={noop}
      onAddTransaction={noop}
    />
  );

describe('HistoryTab pagination and loading', () => {
  it('renders first 50 rows, appends to 100, and keeps descending order', async () => {
    const txs = createTransactions(120);
    const { container } = renderHistoryTab(txs);

    expect(screen.getAllByTestId('history-flat-row')).toHaveLength(50);
    expect(screen.getByText('EXP-120')).toBeTruthy();
    expect(screen.queryByText('EXP-020')).toBeNull();

    const contentBefore = container.textContent || '';
    expect(contentBefore.indexOf('EXP-120')).toBeLessThan(contentBefore.indexOf('EXP-119'));

    await act(async () => {
      fireEvent.click(screen.getByTestId('history-infinite-trigger'));
      await new Promise((resolve) => setTimeout(resolve, 220));
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('history-flat-row')).toHaveLength(100);
    });

    expect(screen.getByText('EXP-021')).toBeTruthy();
    expect(screen.queryByText('EXP-020')).toBeNull();

    const contentAfter = container.textContent || '';
    expect(contentAfter.indexOf('EXP-120')).toBeLessThan(contentAfter.indexOf('EXP-119'));
    expect(contentAfter.indexOf('EXP-119')).toBeLessThan(contentAfter.indexOf('EXP-118'));
  });

  it('ignores repeated infinite-scroll triggers while one load is in-flight', async () => {
    const txs = createTransactions(120);
    renderHistoryTab(txs);

    const trigger = screen.getByTestId('history-infinite-trigger');
    await act(async () => {
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      fireEvent.click(trigger);
      await new Promise((resolve) => setTimeout(resolve, 220));
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('history-flat-row')).toHaveLength(100);
    });
    expect(screen.queryByText('EXP-001')).toBeNull();
  });

  it('keeps group headers correct on loaded subset before and after append', async () => {
    const txs = createTransactions(120, { twoMonthSplit: true });
    renderHistoryTab(txs);

    expect(screen.getByText('2026年2月')).toBeTruthy();
    expect(screen.queryByText('2026年1月')).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId('history-infinite-trigger'));
      await new Promise((resolve) => setTimeout(resolve, 220));
    });

    await waitFor(() => {
      expect(screen.getByText('2026年1月')).toBeTruthy();
    });
  });

  it('keeps filter semantics on loaded subset before and after append', async () => {
    const txs = createTransactions(140, { alternatingType: true });
    renderHistoryTab(txs);

    fireEvent.click(screen.getByText('收入'));
    expect(screen.getAllByTestId('history-flat-row')).toHaveLength(50);
    expect(screen.queryByText(/EXP-/)).toBeNull();

    await act(async () => {
      fireEvent.click(screen.getByTestId('history-infinite-trigger'));
      await new Promise((resolve) => setTimeout(resolve, 220));
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('history-flat-row')).toHaveLength(70);
    });
    expect(screen.queryByText(/EXP-/)).toBeNull();
  });

  it('shows skeleton cards only during loading and removes them after append', async () => {
    const txs = createTransactions(120);
    renderHistoryTab(txs);

    fireEvent.click(screen.getByTestId('history-infinite-trigger'));
    expect(screen.getAllByTestId('history-skeleton-card')).toHaveLength(3);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 220));
    });
    await waitFor(() => {
      expect(screen.queryByTestId('history-skeleton-card')).toBeNull();
    });
  });

  it('stops loading at the end and shows end-of-list state', async () => {
    const txs = createTransactions(55);
    renderHistoryTab(txs);

    await act(async () => {
      fireEvent.click(screen.getByTestId('history-infinite-trigger'));
      await new Promise((resolve) => setTimeout(resolve, 220));
    });

    await waitFor(() => {
      expect(screen.getAllByTestId('history-flat-row')).toHaveLength(55);
      expect(screen.getByTestId('history-end-of-list')).toBeTruthy();
    });

    const trigger = screen.getByTestId('history-infinite-trigger') as HTMLButtonElement;
    expect(trigger.disabled).toBe(true);

    fireEvent.click(trigger);
    expect(screen.queryByTestId('history-skeleton-card')).toBeNull();
  });
});
