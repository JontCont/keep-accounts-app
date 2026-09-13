import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { FinancialAccountSettingsModal } from './FinancialAccountSettingsModal';

vi.mock('@ionic/react', () => ({
  IonModal: ({ children, isOpen }: { children: unknown; isOpen: boolean }) =>
    isOpen ? <div data-testid="ion-modal">{children}</div> : null,
}));

describe('FinancialAccountSettingsModal', () => {
  it('groups bank, credit-card, and cash accounts and shows derived amounts', () => {
    const { getAllByText, getByText } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        presentation="page"
        allowEditing={false}
        showTransactionDetails={true}
        accounts={[
          { id: 'bank', name: '國泰銀行', type: 'bank', openingAmount: 20000 },
          { id: 'card', name: '台新信用卡', type: 'credit-card', openingAmount: 0 },
          { id: 'cash', name: '現金', type: 'cash', openingAmount: 500 },
        ]}
        summaries={[
          { accountId: 'bank', amount: 19500, status: 'balance' },
          { accountId: 'card', amount: 500, status: 'outstanding' },
          { accountId: 'cash', amount: 500, status: 'balance' },
        ]}
        transactions={[
          {
            id: 'income-1',
            description: '薪資',
            amount: 30000,
            type: 'income',
            category: '薪資收入',
            date: '2026-09-01T09:00:00+08:00',
            accountGroupId: 'source',
            financialAccountId: 'bank',
          },
          {
            id: 'expense-1',
            description: '午餐',
            amount: 150,
            type: 'expense',
            category: '餐飲食品',
            date: '2026-09-02T12:00:00+08:00',
            accountGroupId: 'daily',
            financialAccountId: 'bank',
          },
        ] as any}
        onClose={vi.fn()}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
      />
    );

    expect(getAllByText('銀行帳戶').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('信用卡').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('現金').length).toBeGreaterThanOrEqual(1);
    expect(getByText('國泰銀行')).toBeTruthy();
    expect(getByText('未繳 $500')).toBeTruthy();
    expect(getByText('$19,500')).toBeTruthy();
    expect(getByText('收入')).toBeTruthy();
    expect(getByText('支出')).toBeTruthy();
    expect(getByText('薪資')).toBeTruthy();
    expect(getByText('午餐')).toBeTruthy();
  });

  it('submits a new account and supports delete actions', () => {
    const onSaveAccount = vi.fn(() => true);
    const onDeleteAccount = vi.fn(() => true);
    const { getByLabelText, getByRole, getByTitle } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        accounts={[{ id: 'bank', name: '國泰銀行', type: 'bank', openingAmount: 20000 }]}
        summaries={[{ accountId: 'bank', amount: 20000, status: 'balance' }]}
        onClose={vi.fn()}
        onSaveAccount={onSaveAccount}
        onDeleteAccount={onDeleteAccount}
      />
    );

    fireEvent.change(getByLabelText('金融帳戶名稱'), { target: { value: '台新信用卡' } });
    fireEvent.change(getByLabelText('金融帳戶類型'), { target: { value: 'credit-card' } });
    fireEvent.change(getByLabelText('金融帳戶初始金額'), { target: { value: '0' } });
    fireEvent.change(getByLabelText('信用卡結帳日'), { target: { value: '15' } });
    fireEvent.change(getByLabelText('信用卡繳款日'), { target: { value: '5' } });
    fireEvent.click(getByTitle('新增金融帳戶'));

    expect(onSaveAccount).toHaveBeenCalledWith({
      id: undefined,
      name: '台新信用卡',
      type: 'credit-card',
      openingAmount: 0,
      statementClosingDay: 15,
      paymentDueDay: 5,
    });

    expect(onDeleteAccount).not.toHaveBeenCalled();
  });
});
