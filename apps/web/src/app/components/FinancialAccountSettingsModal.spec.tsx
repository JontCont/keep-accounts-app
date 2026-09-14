import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { FinancialAccountSettingsModal } from './FinancialAccountSettingsModal';

vi.mock('@ionic/react', () => ({
  IonModal: ({ children, isOpen }: { children: unknown; isOpen: boolean }) =>
    isOpen ? <div data-testid="ion-modal">{children}</div> : null,
  IonToggle: ({ checked, onIonChange, ...props }: any) => (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      {...props}
      onClick={() => onIonChange({ detail: { checked: !checked } })}
    />
  ),
}));

describe('FinancialAccountSettingsModal', () => {
  it('groups bank and credit-card accounts and shows derived amounts', () => {
    const { getAllByText, getByRole, getByText } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        presentation="page"
        allowEditing={false}
        showTransactionDetails={true}
        accounts={[
          {
            id: 'bank',
            name: '國泰銀行',
            type: 'bank',
            openingAmount: 20000,
            openingAmountAdjustments: [
              { id: 'adjustment-1', amount: 500, date: '2026-09-03T12:00:00+08:00' },
            ],
          },
          { id: 'card', name: '台新信用卡', type: 'credit-card', openingAmount: 0 },
        ]}
        summaries={[
          { accountId: 'bank', amount: 19500, status: 'balance' },
          { accountId: 'card', amount: 500, status: 'outstanding' },
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
        onViewDetails={vi.fn()}
      />
    );

    expect(getAllByText('銀行帳戶').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('信用卡').length).toBeGreaterThanOrEqual(1);
    expect(getByText('國泰銀行')).toBeTruthy();
    expect(getByText('$19,500')).toBeTruthy();

    fireEvent.click(getByRole('tab', { name: '信用卡' }));
    expect(getByText('未繳 $500')).toBeTruthy();

    fireEvent.click(getByRole('tab', { name: '銀行帳戶' }));
    fireEvent.click(getByRole('button', { name: '查看國泰銀行明細' }));
    expect(getByText('薪資')).toBeTruthy();
    expect(getByText('帳戶餘額調整')).toBeTruthy();
    expect(
      getByRole('button', { name: '收合國泰銀行明細' }).getAttribute('aria-expanded')
    ).toBe('true');
  });

  it('closes through the modal card header button', () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        accounts={[]}
        summaries={[]}
        onClose={onClose}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
      />
    );

    fireEvent.click(getByRole('button', { name: '關閉金融帳戶' }));
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('prefills an account editor with its current derived balance', () => {
    const { getByLabelText } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        accountToEdit={{
          id: 'bank',
          name: '國泰銀行',
          type: 'bank',
          openingAmount: 60000,
          openingAmountAdjustments: [{ id: 'adjustment', amount: 1000, date: '2026-09-14' }],
        }}
        accounts={[]}
        summaries={[{ accountId: 'bank', amount: 121900, status: 'balance' }]}
        onClose={vi.fn()}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
      />
    );

    expect(getByLabelText('金融帳戶初始金額').getAttribute('value')).toBe('121900');
  });

  it('loads account details in pages of 50 transactions', () => {
    const transactions = Array.from({ length: 51 }, (_, index) => ({
      id: `transaction-${index + 1}`,
      description: `交易 ${index + 1}`,
      amount: 100,
      type: 'expense' as const,
      category: '餐飲食品',
      date: `2026-09-${String(99 - index).padStart(2, '0')}T12:00:00+08:00`,
      accountGroupId: 'daily',
      financialAccountId: 'bank',
    }));
    const { getByRole, getByText, queryByText } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        presentation="page"
        allowEditing={false}
        showTransactionDetails={true}
        accounts={[{ id: 'bank', name: '國泰銀行', type: 'bank', openingAmount: 0 }]}
        summaries={[{ accountId: 'bank', amount: 0, status: 'balance' }]}
        transactions={transactions}
        onClose={vi.fn()}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
        onViewDetails={vi.fn()}
      />
    );

    fireEvent.click(getByRole('button', { name: '查看國泰銀行明細' }));
    expect(getByText('交易 50')).toBeTruthy();
    expect(queryByText('交易 51')).toBeNull();

    fireEvent.click(getByRole('button', { name: '載入更多明細' }));
    expect(getByText('交易 51')).toBeTruthy();
  });

  it('confirms credit-card payment as a transfer from the selected bank', () => {
    const onConfirmCreditCardPayment = vi.fn(() => true);
    const { getByLabelText, getByRole } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        presentation="page"
        allowEditing={false}
        accounts={[
          { id: 'bank', name: '國泰銀行', type: 'bank', openingAmount: 20000 },
          { id: 'card', name: '台新信用卡', type: 'credit-card', openingAmount: 0 },
        ]}
        summaries={[
          { accountId: 'bank', amount: 20000, status: 'balance' },
          { accountId: 'card', amount: 1500, status: 'outstanding' },
        ]}
        onClose={vi.fn()}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
        onConfirmCreditCardPayment={onConfirmCreditCardPayment}
      />
    );

    fireEvent.click(getByRole('tab', { name: '信用卡' }));
    fireEvent.click(getByRole('button', { name: '確認繳費' }));

    expect(onConfirmCreditCardPayment).toHaveBeenCalledWith('card', 1500);
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
    fireEvent.click(getByRole('button', { name: '信用卡' }));
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
      paymentReminderEnabled: false,
    });

    expect(onDeleteAccount).not.toHaveBeenCalled();
  });

  it('closes the modal after successfully saving an account', () => {
    const onClose = vi.fn();
    const { getByLabelText, getByTitle } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        accounts={[]}
        summaries={[]}
        onClose={onClose}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
      />
    );

    fireEvent.change(getByLabelText('金融帳戶名稱'), { target: { value: '國泰銀行' } });
    fireEvent.change(getByLabelText('金融帳戶初始金額'), { target: { value: '1000' } });
    fireEvent.click(getByTitle('新增金融帳戶'));

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('requires a statement closing day and payment due day for credit cards', () => {
    const { getByLabelText, getByRole } = render(
      <FinancialAccountSettingsModal
        isOpen={true}
        accounts={[]}
        summaries={[]}
        onClose={vi.fn()}
        onSaveAccount={vi.fn(() => true)}
        onDeleteAccount={vi.fn(() => true)}
      />
    );

    fireEvent.click(getByRole('button', { name: '信用卡' }));

    expect(getByLabelText('信用卡結帳日').getAttribute('required')).not.toBeNull();
    expect(getByLabelText('信用卡繳款日').getAttribute('required')).not.toBeNull();
  });
});
