import { useEffect, useState, type FC } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import {
  FinancialAccount,
  FinancialAccountSummary,
  FinancialAccountType,
  getFinancialAccountOpeningAmount,
  Transaction,
} from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface FinancialAccountSettingsModalProps {
  isOpen: boolean;
  presentation?: 'modal' | 'page';
  showCloseButton?: boolean;
  allowEditing?: boolean;
  initialType?: FinancialAccountType;
  onOpenManager?: (type?: FinancialAccountType) => void;
  accountToEdit?: FinancialAccount | null;
  showAccountActions?: boolean;
  onEditAccount?: (account: FinancialAccount) => void;
  onViewDetails?: (account: FinancialAccount) => void;
  showTransactionDetails?: boolean;
  accounts: FinancialAccount[];
  summaries: FinancialAccountSummary[];
  transactions?: Transaction[];
  onClose: () => void;
  onSaveAccount: (account: {
    id?: string;
    name: string;
    type: FinancialAccountType;
    openingAmount: number;
    statementClosingDay?: number;
    paymentDueDay?: number;
  }) => boolean;
  onDeleteAccount: (accountId: string) => boolean;
}

const ACCOUNT_SECTIONS: Array<{
  type: FinancialAccountType;
  label: string;
  icon: string;
}> = [
  { type: 'bank', label: '銀行帳戶', icon: 'landmark' },
  { type: 'credit-card', label: '信用卡', icon: 'credit-card' },
];

const EMPTY_FORM = {
  id: undefined as string | undefined,
  name: '',
  type: 'bank' as FinancialAccountType,
  openingAmount: '',
  statementClosingDay: '',
  paymentDueDay: '',
};

const formatAmount = (amount: number) => `$${amount.toLocaleString('zh-TW')}`;

export const FinancialAccountSettingsModal: FC<FinancialAccountSettingsModalProps> = ({
  isOpen,
  presentation = 'modal',
  showCloseButton = true,
  allowEditing = true,
  initialType = 'bank',
  onOpenManager,
  accountToEdit = null,
  showAccountActions = allowEditing,
  onEditAccount,
  onViewDetails,
  showTransactionDetails = false,
  accounts,
  summaries,
  transactions = [],
  onClose,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (isOpen) {
      setForm(
        accountToEdit
          ? {
              id: accountToEdit.id,
              name: accountToEdit.name,
              type: accountToEdit.type,
              openingAmount: String(accountToEdit.openingAmount),
              statementClosingDay: accountToEdit.statementClosingDay
                ? String(accountToEdit.statementClosingDay)
                : '',
              paymentDueDay: accountToEdit.paymentDueDay
                ? String(accountToEdit.paymentDueDay)
                : '',
            }
          : { ...EMPTY_FORM, type: initialType }
      );
    }
  }, [accountToEdit, initialType, isOpen]);

  const summaryByAccountId = new Map(summaries.map((summary) => [summary.accountId, summary]));
  const accountNameById = new Map(accounts.map((account) => [account.id, account.name]));
  const editingAccount = accountToEdit ?? (form.id ? accounts.find((account) => account.id === form.id) : undefined);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const saved = onSaveAccount({
      id: form.id,
      name: form.name,
      type: form.type,
      openingAmount: Number(form.openingAmount),
      statementClosingDay:
        form.type === 'credit-card' ? Number(form.statementClosingDay) : undefined,
      paymentDueDay: form.type === 'credit-card' ? Number(form.paymentDueDay) : undefined,
    });
    if (saved) {
      setForm(EMPTY_FORM);
    }
  };

  const beginEdit = (account: FinancialAccount) => {
    setForm({
      id: account.id,
      name: account.name,
      type: account.type,
      openingAmount: String(getFinancialAccountOpeningAmount(account)),
      statementClosingDay: account.statementClosingDay
        ? String(account.statementClosingDay)
        : '',
      paymentDueDay: account.paymentDueDay ? String(account.paymentDueDay) : '',
    });
  };

  const content = (
      <div
        className={presentation === 'page' ? 'fade-in' : undefined}
        style={{
          minHeight: '100%',
          padding: '24px',
          background: 'var(--bg-color)',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: presentation === 'page' ? '80px' : '24px',
        }}
      >
        {presentation === 'page' ? (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 600 }}>金融帳戶</h2>
            <p style={{ margin: '6px 0 0', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              管理銀行帳戶與信用卡餘額
            </p>
          </div>
        </div>
        ) : null}

        {allowEditing && <form
          className={`glass-card financial-account-form ${form.type === 'credit-card' ? 'financial-account-form--credit-card' : ''}`}
          onSubmit={handleSubmit}
          style={{
            padding: '16px',
            borderRadius: 'var(--border-radius-md)',
          }}
        >
          <label className="financial-account-form__name" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            名稱
            <input
              aria-label="金融帳戶名稱"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="例如：國泰銀行"
            />
          </label>
          <label className="financial-account-form__type" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            類型
            <select
              aria-label="金融帳戶類型"
              value={form.type}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  type: event.target.value as FinancialAccountType,
                }))
              }
            >
              {ACCOUNT_SECTIONS.map((section) => (
                <option key={section.type} value={section.type}>
                  {section.label}
                </option>
              ))}
            </select>
          </label>
          <label className="financial-account-form__opening" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
            {form.type === 'credit-card' ? '初始未繳' : '初始餘額'}
            <input
              aria-label="金融帳戶初始金額"
              type="number"
              value={form.openingAmount}
              onChange={(event) =>
                setForm((current) => ({ ...current, openingAmount: event.target.value }))
              }
              placeholder="0"
            />
          </label>
          {form.type === 'credit-card' && (
            <>
              <label className="financial-account-form__closing" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                結帳日
                <input
                  aria-label="信用卡結帳日"
                  type="number"
                  min="1"
                  max="31"
                  value={form.statementClosingDay}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, statementClosingDay: event.target.value }))
                  }
                  placeholder="例如 15"
                />
              </label>
              <label className="financial-account-form__due" style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.78rem' }}>
                繳款日
                <input
                  aria-label="信用卡繳款日"
                  type="number"
                  min="1"
                  max="31"
                  value={form.paymentDueDay}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, paymentDueDay: event.target.value }))
                  }
                  placeholder="例如 5"
                />
              </label>
            </>
          )}
          <button className="financial-account-form__submit" type="submit" title={editingAccount ? '儲存金融帳戶' : '新增金融帳戶'}>
            <AppIcon name={editingAccount ? 'save' : 'plus'} size={18} />
            <span>{editingAccount ? '儲存' : '新增'}</span>
          </button>
        </form>}

        {presentation === 'page' && <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {ACCOUNT_SECTIONS.map((section) => {
            const sectionAccounts = accounts.filter((account) => account.type === section.type);
            return (
              <section key={section.type} aria-labelledby={`financial-account-${section.type}`}>
                <div
                    className="financial-account-section-header"
                    style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                      padding: '8px 12px',
                      background: 'var(--sub-card-bg)',
                      border: '1px solid var(--sub-card-border)',
                      borderRadius: 'var(--border-radius-sm)',
                  }}
                >
                  <AppIcon name={section.icon} size={18} style={{ color: 'var(--primary-color)' }} />
                  <h3 id={`financial-account-${section.type}`} style={{ margin: 0, fontSize: '0.95rem' }}>
                    {section.label}
                  </h3>
                  {(allowEditing || onOpenManager) && (
                    <button
                      type="button"
                      onClick={() => {
                        if (allowEditing) {
                          setForm({ ...EMPTY_FORM, type: section.type });
                          return;
                        }
                        onOpenManager?.(section.type);
                      }}
                      title={`新增${section.label}`}
                      aria-label={`新增${section.label}`}
                      style={{
                        marginLeft: 'auto',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 8px',
                        borderRadius: 'var(--border-radius-sm)',
                        background: 'var(--input-bg)',
                        color: 'var(--primary-color)',
                        border: '1px solid var(--input-border)',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                      }}
                    >
                      <AppIcon name="plus" size={14} />
                      <span>新增</span>
                    </button>
                  )}
                </div>
                {sectionAccounts.length === 0 ? (
                  <p style={{ margin: '12px 0 0', color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>
                    尚未建立
                  </p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
                    {sectionAccounts.map((account) => {
                      const summary = summaryByAccountId.get(account.id);
                      const accountTransactions = transactions
                        .filter(
                          (transaction) =>
                            transaction.financialAccountId === account.id ||
                            transaction.transferSourceFinancialAccountId === account.id ||
                            transaction.transferDestinationFinancialAccountId === account.id
                        )
                        .sort((left, right) => right.date.localeCompare(left.date));
                      const transactionSections = [
                        {
                          key: 'income',
                          label: '收入',
                          color: 'var(--income-color)',
                          items: accountTransactions.filter((transaction) => transaction.type === 'income'),
                        },
                        {
                          key: 'expense',
                          label: '支出',
                          color: 'var(--expense-color)',
                          items: accountTransactions.filter((transaction) => transaction.type === 'expense'),
                        },
                        {
                          key: 'transfer',
                          label: '轉帳',
                          color: 'var(--primary-color)',
                          items: accountTransactions.filter((transaction) => transaction.type === 'transfer'),
                        },
                      ];
                      const amountLabel =
                        account.type === 'credit-card'
                          ? summary?.status === 'credit'
                            ? `溢繳 ${formatAmount(summary.amount)}`
                            : `未繳 ${formatAmount(summary?.amount ?? getFinancialAccountOpeningAmount(account))}`
                          : formatAmount(summary?.amount ?? getFinancialAccountOpeningAmount(account));
                      return (
                        <div key={account.id}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '12px',
                              padding: '12px',
                              borderRadius: 'var(--border-radius-md)',
                              opacity: 1,
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {account.name}
                              </div>
                              <div style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: '4px' }}>
                                {amountLabel}
                              </div>
                              {account.type === 'credit-card' && (
                                <div style={{ color: 'var(--text-tertiary)', fontSize: '0.7rem', marginTop: '3px' }}>
                                  結帳日 {account.statementClosingDay ?? '-'} 日・繳款日{' '}
                                  {account.paymentDueDay ?? '-'} 日
                                </div>
                              )}
                            </div>
                            <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                              {onViewDetails && (
                                <button type="button" onClick={() => onViewDetails(account)} title="查看明細">
                                  <AppIcon name="book-open" size={16} />
                                </button>
                              )}
                            {showAccountActions && (
                              <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (allowEditing) {
                                      beginEdit(account);
                                    } else {
                                      onEditAccount?.(account);
                                    }
                                  }}
                                  title="編輯金融帳戶"
                                >
                                  <AppIcon name="edit" size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteAccount(account.id)}
                                  title="刪除金融帳戶"
                                >
                                  <AppIcon name="trash" size={16} />
                                </button>
                              </div>
                            )}
                            </div>
                          </div>

                          {showTransactionDetails && transactionSections.some((transactionSection) => transactionSection.items.length > 0) && (
                            <div
                              aria-label={`${account.name} 收支明細`}
                              style={{
                                margin: '8px 4px 0',
                                padding: '10px 12px',
                                background: 'var(--sub-card-bg)',
                                borderLeft: '2px solid var(--card-border)',
                                maxHeight: '240px',
                                overflowY: 'auto',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '10px',
                              }}
                            >
                              {transactionSections.map((transactionSection) =>
                                transactionSection.items.length > 0 ? (
                                  <div key={transactionSection.key}>
                                    <div
                                      style={{
                                        color: transactionSection.color,
                                        fontSize: '0.75rem',
                                        fontWeight: 700,
                                        marginBottom: '5px',
                                      }}
                                    >
                                      {transactionSection.label}
                                    </div>
                                    {transactionSection.items.map((transaction) => {
                                      const isIncome = transaction.type === 'income';
                                      const isTransfer = transaction.type === 'transfer';
                                      const transferLabel = isTransfer
                                        ? `${accountNameById.get(transaction.transferSourceFinancialAccountId ?? '') ?? '未指定帳戶'} → ${accountNameById.get(transaction.transferDestinationFinancialAccountId ?? '') ?? '未指定帳戶'}`
                                        : transaction.description;
                                      const amountPrefix = isIncome ? '+' : isTransfer ? '±' : '-';

                                      return (
                                        <div
                                          key={transaction.id}
                                          style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            gap: '10px',
                                            padding: '5px 0',
                                            fontSize: '0.76rem',
                                            borderTop: '1px solid var(--card-border)',
                                          }}
                                        >
                                          <div style={{ minWidth: 0 }}>
                                            <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                              {transferLabel}
                                            </div>
                                            <div style={{ color: 'var(--text-tertiary)', fontSize: '0.68rem' }}>
                                              {transaction.date.substring(0, 10)}
                                            </div>
                                          </div>
                                          <strong style={{ color: transactionSection.color, whiteSpace: 'nowrap' }}>
                                            {amountPrefix}{formatAmount(transaction.amount)}
                                          </strong>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : null
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>}
      </div>
  );

  if (presentation === 'page') {
    return content;
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>金融帳戶</IonTitle>
          {showCloseButton && (
            <IonButtons slot="end">
              <IonButton onClick={() => onClose()} title="關閉金融帳戶" aria-label="關閉金融帳戶">
                <AppIcon name="x" size={20} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {content}
      </IonContent>
    </IonModal>
  );
};
