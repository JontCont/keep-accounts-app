import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { FinancialAccountDetailsModal } from './FinancialAccountDetailsModal';

vi.mock('@ionic/react', () => ({
  IonModal: ({ children, isOpen }: { children: unknown; isOpen: boolean }) =>
    isOpen ? <div data-testid="ion-modal">{children}</div> : null,
  IonButton: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
  IonButtons: ({ children }: { children: unknown }) => <div>{children}</div>,
  IonContent: ({ children }: { children: unknown }) => <div>{children}</div>,
  IonHeader: ({ children }: { children: unknown }) => <div>{children}</div>,
  IonTitle: ({ children }: { children: unknown }) => <div>{children}</div>,
  IonToolbar: ({ children }: { children: unknown }) => <div>{children}</div>,
}));

describe('FinancialAccountDetailsModal', () => {
  it('groups selected account transactions by day, week, or month', () => {
    const { getByRole, getByText } = render(
      <FinancialAccountDetailsModal
        isOpen={true}
        account={{ id: 'bank', name: '國泰', type: 'bank', openingAmount: 30000 }}
        summary={{ accountId: 'bank', amount: 30000, status: 'balance' }}
        accounts={[
          { id: 'bank', name: '國泰', type: 'bank', openingAmount: 30000 },
          { id: 'card', name: '台新卡', type: 'credit-card', openingAmount: 0 },
        ]}
        transactions={[
          {
            id: 'income',
            description: '薪資',
            amount: 20000,
            type: 'income',
            category: '薪資收入',
            date: '2026-07-25T09:00:00+08:00',
            accountGroupId: 'source',
            financialAccountId: 'bank',
          },
          {
            id: 'expense',
            description: '午餐',
            amount: 150,
            type: 'expense',
            category: '餐飲食品',
            date: '2026-07-25T12:00:00+08:00',
            accountGroupId: 'daily',
            financialAccountId: 'bank',
          },
        ] as any}
        onClose={vi.fn()}
      />
    );

    expect(getByText('2026年7月')).toBeTruthy();
    expect(getByText('薪資')).toBeTruthy();
    expect(getByText('午餐')).toBeTruthy();
    expect(getByText('初始餘額')).toBeTruthy();
    expect(getByText('帳戶建立金額')).toBeTruthy();

    fireEvent.click(getByRole('tab', { name: '日' }));
    expect(getByText('2026年7月25日')).toBeTruthy();

    fireEvent.click(getByRole('tab', { name: '週' }));
    expect(getByText(/週起始/)).toBeTruthy();
  });

  it('closes through the Ionic header button', () => {
    const onClose = vi.fn();
    const { getByRole } = render(
      <FinancialAccountDetailsModal
        isOpen={true}
        account={{ id: 'bank', name: '國泰', type: 'bank', openingAmount: 30000 }}
        accounts={[]}
        transactions={[]}
        onClose={onClose}
      />
    );

    fireEvent.click(getByRole('button', { name: '關閉帳戶明細' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
