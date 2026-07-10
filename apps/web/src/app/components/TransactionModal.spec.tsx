import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render } from '@testing-library/react';

import {
  TransactionModal,
  resolveDefaultTransactionGroupId,
  resolveTransactionCategory,
  shiftLocalIsoMonth,
} from './TransactionModal';

vi.mock('@ionic/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@ionic/react')>();
  const React = await import('react');
  return {
    ...original,
    IonModal: ({ children, isOpen }: any) => {
      if (!isOpen) return null;
      return React.createElement('div', { 'data-testid': 'ion-modal' }, children);
    },
  };
});

describe('TransactionModal', () => {
  it('defaults new transactions to a non-source group and prefers 日常開銷', () => {
    const groups = [
      { id: '0', name: '當月薪資', isSource: true },
      { id: '3', name: '儲蓄資金' },
      { id: '1', name: '日常開銷' },
    ];

    expect(resolveDefaultTransactionGroupId(groups as any)).toBe('1');
  });

  it('resolves installment submissions to the system category 分期', () => {
    expect(resolveTransactionCategory('購物消費', true)).toBe('分期');
    expect(resolveTransactionCategory('購物消費', false)).toBe('購物消費');
  });

  it('supports shifting installment start month', () => {
    const start = '2026-03-31T10:00:00+08:00';
    expect(shiftLocalIsoMonth(start, 1).startsWith('2026-04-30')).toBe(true);
    expect(shiftLocalIsoMonth(start, -1).startsWith('2026-02-28')).toBe(true);
    expect(shiftLocalIsoMonth(start, -3).startsWith('2025-12-31')).toBe(true);
  });

  it('shows installment start-month controls', () => {
    const accountGroups = [
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 100,
        categories: [
          { name: '購物消費', emoji: 'shopping-cart', color: '#10b981', type: 'expense' },
        ],
      },
    ];

    const { getByText } = render(
      <BrowserRouter>
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          editingTx={null}
          accountGroups={accountGroups as any}
          onSave={vi.fn()}
        />
      </BrowserRouter>
    );

    fireEvent.click(getByText('分期'));
    expect(getByText('開始扣款月份')).toBeTruthy();
    expect(getByText('下一期')).toBeTruthy();
    expect(getByText('前一個月')).toBeTruthy();
    expect(getByText('前三個月')).toBeTruthy();
  });
});