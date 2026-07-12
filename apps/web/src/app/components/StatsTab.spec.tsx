import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';

import { StatsTab } from './StatsTab';

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
          'data-testid': 'stats-group-select',
          onChange: (e: any) => onIonChange?.({ detail: { value: e.target.value } }),
        },
        children
      ),
    IonSelectOption: ({ value, children }: any) =>
      React.createElement('option', { value }, children),
  };
});

vi.mock('recharts', async () => {
  const React = await import('react');
  const PassThrough = ({ children }: any) => React.createElement('div', null, children);
  return {
    ResponsiveContainer: PassThrough,
    PieChart: PassThrough,
    Pie: PassThrough,
    Cell: PassThrough,
    BarChart: PassThrough,
    Bar: PassThrough,
    XAxis: PassThrough,
    YAxis: PassThrough,
    Tooltip: PassThrough,
  };
});

const groups = [
  {
    id: '1',
    name: '日常開銷',
    emoji: 'credit-card',
    categories: [
      { name: '餐飲食品', emoji: 'coffee', color: '#f59e0b', type: 'expense' },
      { name: '交通通勤', emoji: 'car', color: '#3b82f6', type: 'expense' },
    ],
  },
  {
    id: '2',
    name: '投資理財',
    emoji: 'trending-up',
    categories: [{ name: '手續費', emoji: 'briefcase', color: '#10b981', type: 'expense' }],
  },
] as any;

const txs = [
  { id: 't1', description: '午餐', amount: 100, type: 'expense', category: '餐飲食品', date: '2026-01-01T10:00:00+08:00', accountGroupId: '1' },
  { id: 't2', description: '捷運', amount: 120, type: 'expense', category: '交通通勤', date: '2026-01-02T10:00:00+08:00', accountGroupId: '1' },
  { id: 't3', description: '停車', amount: 80, type: 'expense', category: '交通通勤', date: '2026-01-02T12:00:00+08:00', accountGroupId: '1' },
  { id: 't4', description: '收入', amount: 500, type: 'income', category: '薪資收入', date: '2026-01-03T10:00:00+08:00', accountGroupId: '1' },
] as any;

describe('StatsTab query-driven aggregates', () => {
  it('renders scoped totals and average from aggregated expense data', () => {
    const { getByText } = render(
      <StatsTab accountGroups={groups} transactions={txs} getCategoryEmoji={() => 'coffee'} />
    );

    expect(getByText('3 筆')).toBeTruthy();
    expect(getByText('$100 (33%)')).toBeTruthy();
    expect(getByText('$200 (67%)')).toBeTruthy();
  });

  it('shows empty-state aggregates when selected group has no expense rows', () => {
    const { getByTestId, getByText } = render(
      <StatsTab accountGroups={groups} transactions={txs} getCategoryEmoji={() => 'coffee'} />
    );

    fireEvent.change(getByTestId('stats-group-select'), { target: { value: '2' } });

    expect(getByText('0 筆')).toBeTruthy();
    expect(getByText('目前尚無支出資料可進行統計分析')).toBeTruthy();
  });
});
