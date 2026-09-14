import { describe, expect, it } from 'vitest';
import {
  calculateFinancialAccountSummaries,
  validateFinancialAccount,
  validateFinancialAccountTransaction,
} from './financial-accounts';
import { FinancialAccount, Transaction } from './types';

const bank: FinancialAccount = {
  id: 'bank',
  name: 'Cathay Checking',
  type: 'bank',
  openingAmount: 20000,
};
const card: FinancialAccount = {
  id: 'card',
  name: 'Taishin Card',
  type: 'credit-card',
  openingAmount: 0,
};

const baseTransaction = (overrides: Partial<Transaction>): Transaction => ({
  id: 'transaction',
  description: 'Test transaction',
  amount: 500,
  type: 'expense',
  category: 'Food',
  date: '2026-01-01T09:00:00+08:00',
  accountGroupId: 'daily',
  ...overrides,
});

describe('financial account calculations', () => {
  it('keeps card purchases as expenses and applies card payments as transfers', () => {
    const transactions = [
      baseTransaction({ id: 'expense', financialAccountId: 'card' }),
      baseTransaction({
        id: 'payment',
        type: 'transfer',
        category: '不計損益',
        amount: 500,
        date: '2026-01-02T09:00:00+08:00',
        transferSourceFinancialAccountId: 'bank',
        transferDestinationFinancialAccountId: 'card',
      }),
    ];

    expect(calculateFinancialAccountSummaries([bank, card], transactions)).toEqual([
      { accountId: 'bank', amount: 19500, status: 'balance' },
      { accountId: 'card', amount: 0, status: 'outstanding' },
    ]);
  });

  it('applies income and expenses to bank, cash, and card accounts', () => {
    const cash: FinancialAccount = {
      id: 'cash',
      name: 'Cash',
      type: 'cash',
      openingAmount: 1000,
    };
    const transactions = [
      baseTransaction({ id: 'income', type: 'income', amount: 300, financialAccountId: 'bank' }),
      baseTransaction({ id: 'cash-expense', amount: 100, financialAccountId: 'cash' }),
      baseTransaction({ id: 'card-refund', type: 'income', amount: 50, financialAccountId: 'card' }),
    ];

    expect(calculateFinancialAccountSummaries([bank, card, cash], transactions)).toEqual([
      { accountId: 'bank', amount: 20300, status: 'balance' },
      { accountId: 'card', amount: 50, status: 'credit' },
      { accountId: 'cash', amount: 900, status: 'balance' },
    ]);
  });

  it('reports credit-card overpayment as a credit balance', () => {
    const transactions = [
      baseTransaction({
        id: 'refund',
        type: 'income',
        amount: 200,
        financialAccountId: 'card',
      }),
    ];

    expect(calculateFinancialAccountSummaries([card], transactions)).toEqual([
      { accountId: 'card', amount: 200, status: 'credit' },
    ]);
  });

  it('includes opening amount adjustments in the derived total', () => {
    const adjustedBank: FinancialAccount = {
      ...bank,
      openingAmount: 3000,
      openingAmountAdjustments: [
        { id: 'adjustment-1', amount: 1000, date: '2026-09-14T10:00:00+08:00' },
      ],
    };

    expect(calculateFinancialAccountSummaries([adjustedBank], [])).toEqual([
      { accountId: 'bank', amount: 4000, status: 'balance' },
    ]);
  });

  it('ignores legacy and unresolved account references', () => {
    const transactions = [
      baseTransaction({ id: 'legacy' }),
      baseTransaction({ id: 'unknown', financialAccountId: 'missing' }),
    ];

    expect(calculateFinancialAccountSummaries([bank], transactions)).toEqual([
      { accountId: 'bank', amount: 20000, status: 'balance' },
    ]);
  });
});

describe('financial account validation', () => {
  it('rejects invalid account values', () => {
    expect(validateFinancialAccount({ ...bank, name: ' ' })).toBe('請輸入金融帳戶名稱。');
    expect(validateFinancialAccount({ ...bank, type: 'invalid' as FinancialAccount['type'] })).toBe(
      '金融帳戶類型無效。'
    );
    expect(validateFinancialAccount({ ...bank, openingAmount: Number.NaN })).toBe(
      '初始金額必須是有效數字。'
    );
  });

  it('requires active and different accounts for transfers', () => {
    expect(
      validateFinancialAccountTransaction(
        baseTransaction({
          type: 'transfer',
          transferSourceFinancialAccountId: 'bank',
          transferDestinationFinancialAccountId: 'bank',
        }),
        [bank, card]
      )
    ).toBe('來源與目的金融帳戶必須不同。');

    expect(
      validateFinancialAccountTransaction(
        baseTransaction({
          type: 'transfer',
          transferSourceFinancialAccountId: 'bank',
          transferDestinationFinancialAccountId: 'missing',
        }),
        [bank, card]
      )
      ).toBe('轉帳指定的金融帳戶無效。');
  });

  it('allows income and expense transactions without a financial account', () => {
    expect(validateFinancialAccountTransaction(baseTransaction({}), [bank, card])).toBe(null);
    expect(validateFinancialAccountTransaction(baseTransaction({ financialAccountId: 'card' }), [card])).toBe(
      null
    );
  });
});
