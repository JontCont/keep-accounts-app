import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { render } from '@testing-library/react';
import { TransactionEntryPage } from './TransactionEntryPage';

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

describe('TransactionEntryPage', () => {
  const accountGroups = [
    {
      id: '1',
      name: '日常開銷',
      emoji: 'credit-card',
      color: '#6366f1',
      targetRatio: 100,
      categories: [
        { name: '餐飲食品', emoji: 'coffee', color: '#f59e0b', type: 'expense' },
      ],
    },
  ];

  it('renders create mode with empty defaults and no embedded title', () => {
    const { queryByText, container } = render(
      <BrowserRouter>
        <TransactionEntryPage
          isOpen={true}
          editingTx={null}
          accountGroups={accountGroups as any}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(queryByText('新增收支記帳')).toBeNull();

    const descInput = container.querySelector('ion-input[placeholder*="例如"]') as any;
    expect(descInput).toBeTruthy();
    expect(descInput.value ?? '').toBe('');

    const amountInput = container.querySelector('ion-input[placeholder*="輸入金額"]') as any;
    expect(amountInput).toBeTruthy();
    expect(amountInput.value ?? '').toBe('');
  });

  it('renders edit mode with prefilled values', () => {
    const editingTx = {
      id: 'tx-1',
      description: '既有交易',
      amount: 1234,
      type: 'expense',
      category: '餐飲食品',
      date: '2026-07-12T10:00:00+08:00',
      accountGroupId: '1',
    } as any;

    const { container } = render(
      <BrowserRouter>
        <TransactionEntryPage
          isOpen={true}
          editingTx={editingTx}
          accountGroups={accountGroups as any}
          onClose={vi.fn()}
          onSave={vi.fn()}
        />
      </BrowserRouter>
    );

    const descInput = container.querySelector('ion-input[placeholder*="例如"]') as any;
    expect(descInput).toBeTruthy();
    expect(descInput.value).toBe('既有交易');

    const amountInput = container.querySelector('ion-input[placeholder*="輸入金額"]') as any;
    expect(amountInput).toBeTruthy();
    expect(amountInput.value.toString()).toBe('1234');
  });
});
