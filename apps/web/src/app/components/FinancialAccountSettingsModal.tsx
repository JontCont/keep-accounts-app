import { useEffect, useState, type FC } from 'react';
import { IonModal, IonToggle } from '@ionic/react';
import {
  FinancialAccount,
  FinancialAccountSummary,
  FinancialAccountType,
  getFinancialAccountOpeningAmount,
  Transaction,
} from '@keep-accounts-app/domain';
import { queryNativeFinancialAccountTransactionsPage } from '@keep-accounts-app/state';
import { AppIcon } from './AppIcon';
import { SharedTableRow } from './SharedTableRow';

const ACCOUNT_DETAIL_PAGE_SIZE = 50;

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
  onConfirmCreditCardPayment?: (creditCardAccountId: string, amount: number) => boolean;
  showTransactionDetails?: boolean;
  preferNativeQueries?: boolean;
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
    paymentReminderEnabled?: boolean;
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
  paymentReminderEnabled: false,
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
  onConfirmCreditCardPayment,
  showTransactionDetails = false,
  preferNativeQueries = false,
  accounts,
  summaries,
  transactions = [],
  onClose,
  onSaveAccount,
  onDeleteAccount,
}) => {
  const [form, setForm] = useState(EMPTY_FORM);
  const [activeSectionType, setActiveSectionType] = useState<FinancialAccountType>(initialType);
  const [expandedAccountId, setExpandedAccountId] = useState<string | null>(null);
  const [visibleDetailCount, setVisibleDetailCount] = useState(ACCOUNT_DETAIL_PAGE_SIZE);
  const [nativeDetailTransactions, setNativeDetailTransactions] = useState<Transaction[]>([]);
  const [hasMoreNativeDetails, setHasMoreNativeDetails] = useState(false);
  const [isLoadingMoreDetails, setIsLoadingMoreDetails] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveSectionType(accountToEdit?.type ?? initialType);
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
              paymentReminderEnabled: accountToEdit.paymentReminderEnabled ?? false,
            }
          : { ...EMPTY_FORM, type: initialType }
      );
    }
  }, [accountToEdit, initialType, isOpen]);

  useEffect(() => {
    if (!preferNativeQueries || !expandedAccountId) {
      return;
    }

    let cancelled = false;
    setIsLoadingMoreDetails(true);
    void queryNativeFinancialAccountTransactionsPage({
      accountId: expandedAccountId,
      offset: 0,
      pageSize: ACCOUNT_DETAIL_PAGE_SIZE,
    }).then((page) => {
      if (cancelled || !page) {
        return;
      }
      setNativeDetailTransactions(page.items);
      setHasMoreNativeDetails(page.hasMore);
      setIsLoadingMoreDetails(false);
    });

    return () => {
      cancelled = true;
    };
  }, [expandedAccountId, preferNativeQueries]);

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
      paymentReminderEnabled: form.type === 'credit-card' ? form.paymentReminderEnabled : undefined,
    });
    if (saved) {
      setForm(EMPTY_FORM);
      if (presentation === 'modal') {
        onClose();
      }
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
      paymentReminderEnabled: account.paymentReminderEnabled ?? false,
    });
  };

  const content = (
      <div
        className={presentation === 'page' ? 'fade-in' : 'glass-card financial-account-modal-card'}
        style={{
          width: '100%',
          maxWidth: presentation === 'page' ? 'none' : '400px',
          minHeight: presentation === 'page' ? '100%' : undefined,
          maxHeight: presentation === 'page' ? undefined : 'calc(100dvh - 32px)',
          overflowY: presentation === 'page' ? undefined : 'hidden',
          padding: presentation === 'page' ? '24px' : '16px',
          color: 'var(--text-primary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: presentation === 'page' ? '80px' : '16px',
          margin: presentation === 'page' ? undefined : 'auto',
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

        {presentation === 'modal' ? (
          <div className="financial-account-modal-card__header">
            <div>
              <h3>{editingAccount ? '編輯金融帳戶' : '新增金融帳戶'}</h3>
              <p>設定帳戶的起始金額</p>
            </div>
            {showCloseButton && (
              <button type="button" onClick={onClose} title="關閉金融帳戶" aria-label="關閉金融帳戶">
                <AppIcon name="x" size={20} />
              </button>
            )}
          </div>
        ) : null}

        {allowEditing && <form
          className={`financial-account-form ${form.type === 'credit-card' ? 'financial-account-form--credit-card' : ''}`}
          onSubmit={handleSubmit}
        >
          <label className="financial-account-form__name">
            帳戶名稱
            <input
              aria-label="金融帳戶名稱"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="例如：國泰銀行"
            />
          </label>
          <fieldset className="financial-account-form__type" aria-label="金融帳戶類型">
            <legend>帳戶類型</legend>
            <div className="segment-btn-group financial-account-type-options" role="group" aria-label="金融帳戶類型">
              {ACCOUNT_SECTIONS.map((section) => (
                <button
                  key={section.type}
                  type="button"
                  className={`segment-btn financial-account-type-option${form.type === section.type ? ' active' : ''}`}
                  aria-pressed={form.type === section.type}
                  onClick={() => setForm((current) => ({ ...current, type: section.type }))}
                >
                  <AppIcon name={section.icon} size={18} />
                  {section.label}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="financial-account-form__opening">
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
              <label className="financial-account-form__closing">
                結帳日
                <input
                  aria-label="信用卡結帳日"
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={form.statementClosingDay}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, statementClosingDay: event.target.value }))
                  }
                  placeholder="例如 15"
                />
              </label>
              <label className="financial-account-form__due">
                繳款日
                <input
                  aria-label="信用卡繳款日"
                  type="number"
                  min="1"
                  max="31"
                  required
                  value={form.paymentDueDay}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, paymentDueDay: event.target.value }))
                  }
                  placeholder="例如 5"
                />
              </label>
              <div className="financial-account-form__reminder">
                <span>繳款日提醒</span>
                <IonToggle
                  aria-label="信用卡繳款提醒"
                  checked={form.paymentReminderEnabled}
                  onIonChange={(event) =>
                    setForm((current) => ({ ...current, paymentReminderEnabled: event.detail.checked }))
                  }
                />
              </div>
            </>
          )}
          <button className="financial-account-form__submit" type="submit" title={editingAccount ? '儲存金融帳戶' : '新增金融帳戶'}>
            <AppIcon name={editingAccount ? 'save' : 'plus'} size={18} />
            <span>{editingAccount ? '儲存' : '新增'}</span>
          </button>
        </form>}

        {presentation === 'page' && (() => {
          const activeSection = ACCOUNT_SECTIONS.find((section) => section.type === activeSectionType) ?? ACCOUNT_SECTIONS[0];
          const sectionAccounts = accounts.filter((account) => account.type === activeSection.type);
          return <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="segment-btn-group financial-account-page-tabs" role="tablist" aria-label="金融帳戶類型">
              {ACCOUNT_SECTIONS.map((section) => (
                <button
                  key={section.type}
                  type="button"
                  role="tab"
                  className={`segment-btn${activeSectionType === section.type ? ' active' : ''}`}
                  aria-selected={activeSectionType === section.type}
                  onClick={() => setActiveSectionType(section.type)}
                >
                  <AppIcon name={section.icon} size={17} />
                  {section.label}
                </button>
              ))}
            </div>
            <section aria-labelledby={`financial-account-${activeSection.type}`}>
              <div className="financial-account-section-header">
                <h3 id={`financial-account-${activeSection.type}`}>{activeSection.label}</h3>
                {(allowEditing || onOpenManager) && (
                  <button
                    type="button"
                    onClick={() => {
                      if (allowEditing) {
                        setForm({ ...EMPTY_FORM, type: activeSection.type });
                        return;
                      }
                      onOpenManager?.(activeSection.type);
                    }}
                    title={`新增${activeSection.label}`}
                    aria-label={`新增${activeSection.label}`}
                  >
                    <AppIcon name="plus" size={15} />
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
                      const detailTransactions =
                        preferNativeQueries && expandedAccountId === account.id
                          ? nativeDetailTransactions
                          : accountTransactions.slice(0, visibleDetailCount);
                      const transactionSections = [
                        {
                          key: 'income',
                          label: '收入',
                          color: 'var(--income-color)',
                          items: detailTransactions.filter((transaction) => transaction.type === 'income'),
                        },
                        {
                          key: 'expense',
                          label: '支出',
                          color: 'var(--expense-color)',
                          items: detailTransactions.filter((transaction) => transaction.type === 'expense'),
                        },
                        {
                          key: 'transfer',
                          label: '轉帳',
                          color: 'var(--primary-color)',
                          items: detailTransactions.filter((transaction) => transaction.type === 'transfer'),
                        },
                      ];
                      const amountLabel =
                        account.type === 'credit-card'
                          ? summary?.status === 'credit'
                            ? `溢繳 ${formatAmount(summary.amount)}`
                            : `未繳 ${formatAmount(summary?.amount ?? getFinancialAccountOpeningAmount(account))}`
                          : formatAmount(summary?.amount ?? getFinancialAccountOpeningAmount(account));
                      const outstandingAmount =
                        account.type === 'credit-card' && summary?.status !== 'credit'
                          ? summary?.amount ?? getFinancialAccountOpeningAmount(account)
                          : 0;
                      return (
                        <div key={account.id}>
                          <SharedTableRow className="financial-account-row">
                            <div className="financial-account-row__identity">
                              <div className="financial-account-row__icon">
                                <AppIcon name={activeSection.icon} size={20} />
                              </div>
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
                            </div>
                            <div className="financial-account-row__actions">
                              {onViewDetails && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (showTransactionDetails) {
                                      setExpandedAccountId((current) =>
                                        current === account.id ? null : account.id
                                      );
                                      setVisibleDetailCount(ACCOUNT_DETAIL_PAGE_SIZE);
                                      return;
                                    }
                                    onViewDetails(account);
                                  }}
                                  title={expandedAccountId === account.id ? '收合明細' : '查看明細'}
                                  aria-label={`${expandedAccountId === account.id ? '收合' : '查看'}${account.name}明細`}
                                  aria-expanded={expandedAccountId === account.id}
                                >
                                  <AppIcon name={expandedAccountId === account.id ? 'chevron-up' : 'book-open'} size={16} />
                                </button>
                              )}
                            {showAccountActions && (
                              <div className="financial-account-row__actions">
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
                                  aria-label={`編輯${account.name}`}
                                >
                                  <AppIcon name="edit" size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onDeleteAccount(account.id)}
                                  title="刪除金融帳戶"
                                  aria-label={`刪除${account.name}`}
                                >
                                  <AppIcon name="trash" size={16} />
                                </button>
                              </div>
                            )}
                            </div>
                            {account.type === 'credit-card' && outstandingAmount > 0 && onConfirmCreditCardPayment && (
                              <div className="financial-account-row__payment">
                                <button
                                  type="button"
                                  onClick={() =>
                                    onConfirmCreditCardPayment(account.id, outstandingAmount)
                                  }
                                >
                                  確認繳費
                                </button>
                              </div>
                            )}
                          </SharedTableRow>

                          {showTransactionDetails && expandedAccountId === account.id && (
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
                              {transactionSections.some((transactionSection) => transactionSection.items.length > 0) ? transactionSections.map((transactionSection) =>
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
                              ) : <p style={{ color: 'var(--text-tertiary)', fontSize: '0.82rem' }}>尚無記帳明細</p>}
                              {((preferNativeQueries && hasMoreNativeDetails) ||
                                (!preferNativeQueries && visibleDetailCount < accountTransactions.length)) && (
                                <button
                                  type="button"
                                  className="financial-account-details-more"
                                  disabled={isLoadingMoreDetails}
                                  onClick={() => {
                                    if (!preferNativeQueries) {
                                      setVisibleDetailCount((count) => count + ACCOUNT_DETAIL_PAGE_SIZE);
                                      return;
                                    }

                                    setIsLoadingMoreDetails(true);
                                    void queryNativeFinancialAccountTransactionsPage({
                                      accountId: account.id,
                                      offset: nativeDetailTransactions.length,
                                      pageSize: ACCOUNT_DETAIL_PAGE_SIZE,
                                    }).then((page) => {
                                      if (page) {
                                        setNativeDetailTransactions((current) => [...current, ...page.items]);
                                        setHasMoreNativeDetails(page.hasMore);
                                      }
                                      setIsLoadingMoreDetails(false);
                                    });
                                  }}
                                >
                                  {isLoadingMoreDetails ? '載入中' : '載入更多明細'}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
          </div>;
        })()}
      </div>
  );

  if (presentation === 'page') {
    return content;
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="modal-overlay"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'var(--modal-backdrop-bg)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1100,
        padding: '16px',
      }}
    >
      {content}
    </IonModal>
  );
};
