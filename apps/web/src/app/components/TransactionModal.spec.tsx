import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { fireEvent, render } from '@testing-library/react';

import {
  computeStockAmount,
  filterAccountGroupsByTransactionType,
  TransactionModal,
  filterTransactionCategoriesByType,
  resolveDefaultTransactionGroupId,
  resolveTransactionCategory,
  shiftLocalIsoMonth,
} from './TransactionModal';

vi.mock('@ionic/react', async (importOriginal) => {
  const original = await importOriginal<typeof import('@ionic/react')>();
  const React = await import('react');
  return {
    ...original,
    IonModal: ({ children, isOpen, keepContentsMounted }: any) => {
      if (!isOpen && !keepContentsMounted) return null;
      return React.createElement('div', { 'data-testid': 'ion-modal' }, children);
    },
    IonDatetimeButton: ({ datetime }: any) =>
      React.createElement('button', {
        'data-testid': 'datetime-button',
        'data-datetime': datetime,
      }),
    IonDatetime: ({ id }: any) =>
      React.createElement('div', {
        'data-testid': 'datetime',
        'data-datetime-id': id,
      }),
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

  it('only shows salary-like categories for income', () => {
    const categories = [
      { name: '薪資收入', emoji: 'briefcase', color: '#22c55e', type: 'income' },
      { name: '薪資收入', emoji: 'briefcase', color: '#22c55e', type: 'expense' },
      { name: '一般支出', emoji: 'shopping-cart', color: '#10b981', type: 'expense' },
      { name: 'Salary Bonus', emoji: 'briefcase', color: '#22c55e', type: 'expense' },
    ] as any;

    const expenseCategories = filterTransactionCategoriesByType(categories, 'expense');
    const incomeCategories = filterTransactionCategoriesByType(categories, 'income');

    expect(expenseCategories.map((c: any) => c.name)).toEqual(['一般支出']);
    expect(incomeCategories.map((c: any) => c.name)).toEqual(['薪資收入']);
  });

  it('only shows account groups that contain categories for current transaction type', () => {
    const groups = [
      {
        id: '0',
        name: '當月薪資',
        isSource: true,
        categories: [{ name: '薪資收入', emoji: 'briefcase', color: '#22c55e', type: 'income' }],
      },
      {
        id: '1',
        name: '日常開銷',
        categories: [{ name: '餐飲', emoji: 'coffee', color: '#6366f1', type: 'expense' }],
      },
    ] as any;

    const expenseGroups = filterAccountGroupsByTransactionType(groups, 'expense');
    const incomeGroups = filterAccountGroupsByTransactionType(groups, 'income');

    expect(expenseGroups.map((g: any) => g.name)).toEqual(['日常開銷']);
    expect(incomeGroups.map((g: any) => g.name)).toEqual(['當月薪資']);
  });

  it('computes stock amount with shares multiplied by unit price', () => {
    expect(computeStockAmount('10', '58.4')).toBe('584');
    expect(computeStockAmount('3.5', '100.25')).toBe('350.88');
    expect(computeStockAmount('', '58.4')).toBe('');
    expect(computeStockAmount('10', '0')).toBe('');
  });

  it('shows installment start-month controls after combined setup', () => {
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

    expect(getByText('選擇資金帳戶大項')).toBeTruthy();
    fireEvent.click(getByText('分期'));
    expect(getByText('下一步')).toBeTruthy();
    fireEvent.click(getByText('下一步'));
    expect(getByText('詳細資料')).toBeTruthy();
    expect(getByText('開始扣款月份')).toBeTruthy();
    expect(getByText('下一期')).toBeTruthy();
    expect(getByText('前一個月')).toBeTruthy();
    expect(getByText('前三個月')).toBeTruthy();
  });

  it('shows basic details only after combined setup without saving', () => {
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
    const onSave = vi.fn();

    const { getByRole, getByText, queryByPlaceholderText } = render(
      <BrowserRouter>
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          editingTx={null}
          accountGroups={accountGroups as any}
          onSave={onSave}
        />
      </BrowserRouter>
    );

    expect(getByRole('list', { name: '新增記帳步驟' })).toBeTruthy();
    expect(getByText('交易設定')).toBeTruthy();
    expect(getByText('交易類型')).toBeTruthy();
    expect(getByText('選擇資金帳戶大項')).toBeTruthy();
    expect(getByText('選擇分類')).toBeTruthy();
    expect(getByText('交易日期與時間')).toBeTruthy();
    expect(queryByPlaceholderText('例如: 買咖啡、午餐、薪水')).toBeNull();

    fireEvent.click(getByRole('button', { name: '下一步' }));

    expect(getByText('詳細資料')).toBeTruthy();
    expect(queryByPlaceholderText('例如: 買咖啡、午餐、薪水')).toBeTruthy();
    expect(onSave).not.toHaveBeenCalled();
  });

  it('replaces the setup next button instead of reusing it as submit', () => {
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

    const { getByRole } = render(
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

    const nextButton = getByRole('button', { name: '下一步' });
    expect(nextButton.getAttribute('type')).toBe('button');

    fireEvent.click(nextButton);

    const saveButton = getByRole('button', { name: '儲存' });
    expect(saveButton.getAttribute('type')).toBe('submit');
    expect(saveButton).not.toBe(nextButton);
  });

  it('separates labeled transaction type and payment mode controls in setup', () => {
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
      {
        id: '2',
        name: '當月收入',
        emoji: 'wallet',
        color: '#10b981',
        targetRatio: 100,
        categories: [
          { name: '薪資', emoji: 'briefcase', color: '#10b981', type: 'income' },
        ],
      },
    ];

    const { container, getByRole, getByText, queryByText } = render(
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

    expect(getByText('交易類型')).toBeTruthy();
    expect(getByText('付款方式')).toBeTruthy();
    expect(container.querySelectorAll('.transaction-entry-type-option')).toHaveLength(3);
    expect(getByRole('button', { name: '支出' }).getAttribute('aria-pressed')).toBe('true');
    expect(container.querySelector('.transaction-entry-card')?.className).not.toContain(
      'transaction-entry-card--content-fit'
    );

    fireEvent.click(getByRole('button', { name: '收入' }));

    expect(getByRole('button', { name: '收入' }).getAttribute('aria-pressed')).toBe('true');
    expect(queryByText('付款方式')).toBeNull();
    expect(container.querySelector('.transaction-entry-card')?.className).toContain(
      'transaction-entry-card--content-fit'
    );
  });

  it('keeps new installment details when returning to setup', () => {
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
    const onSave = vi.fn();

    const { getByText, getByPlaceholderText, queryByPlaceholderText } = render(
      <BrowserRouter>
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          editingTx={null}
          accountGroups={accountGroups as any}
          onSave={onSave}
        />
      </BrowserRouter>
    );

    fireEvent.click(getByText('分期'));
    expect(getByText('選擇資金帳戶大項')).toBeTruthy();
    expect(getByText('選擇分類')).toBeTruthy();
    expect(queryByPlaceholderText('例如: 手機分期、家電分期')).toBeNull();

    fireEvent.click(getByText('下一步'));
    const nameInput = getByPlaceholderText('例如: 手機分期、家電分期');
    fireEvent(
      nameInput,
      new CustomEvent('ionInput', { bubbles: true, detail: { value: '手機分期' } })
    );

    fireEvent.click(getByText('上一步'));
    expect(onSave).not.toHaveBeenCalled();
    expect(queryByPlaceholderText('例如: 手機分期、家電分期')).toBeNull();

    fireEvent.click(getByText('下一步'));
    expect((getByPlaceholderText('例如: 手機分期、家電分期') as any).value).toBe('手機分期');
  });

  it('associates the date trigger with the datetime and uses a scrollable page form layout', () => {
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

    const { container, getByRole } = render(
      <BrowserRouter>
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          editingTx={null}
          accountGroups={accountGroups as any}
          presentation="page"
          onSave={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(container.querySelector('[data-testid="datetime-button"]')?.getAttribute('data-datetime')).toBe('tx-datetime');
    expect(container.querySelector('[data-testid="datetime"]')?.getAttribute('data-datetime-id')).toBe('tx-datetime');
    expect(container.querySelector('.transaction-entry-card--page')).toBeTruthy();
    expect(container.querySelector('.transaction-entry-form')).toBeTruthy();
    expect(container.querySelector('.transaction-entry-fields')).toBeTruthy();
    expect(container.querySelector('.transaction-entry-actions')).toBeTruthy();
  });

  it('constrains installment period edit mode to amount and date updates', () => {
    const accountGroups = [
      {
        id: '1',
        name: '日常開銷',
        emoji: 'credit-card',
        color: '#6366f1',
        targetRatio: 100,
        categories: [
          { name: '分期', emoji: 'credit-card', color: '#6366f1', type: 'expense' },
        ],
      },
    ];

    const editingTx = {
      id: 'inst-2',
      description: '家電分期',
      amount: 2003,
      type: 'expense',
      category: '分期',
      date: '2026-09-10T12:47:00+08:00',
      accountGroupId: '1',
      installmentId: 'inst',
      installmentPeriod: 2,
      installmentCount: 5,
    } as any;

    const { getByText, container } = render(
      <BrowserRouter>
        <TransactionModal
          isOpen={true}
          onClose={vi.fn()}
          editingTx={editingTx}
          accountGroups={accountGroups as any}
          onSave={vi.fn()}
        />
      </BrowserRouter>
    );

    expect(getByText(/可修改金額與日期/)).toBeTruthy();

    const descInput = container.querySelector('ion-input[placeholder*="例如"]') as any;
    expect(descInput).toBeTruthy();
    expect(descInput.readonly).toBe(true);

    const amountInput = container.querySelector('ion-input[placeholder*="輸入金額"]') as any;
    expect(amountInput).toBeTruthy();
    expect(amountInput.readonly).toBe(false);
  });
});