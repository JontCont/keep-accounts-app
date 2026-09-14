import { useEffect, useMemo, useState, type FC } from 'react';
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
  getFinancialAccountOpeningAmount,
  Transaction,
} from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface FinancialAccountDetailsModalProps {
  isOpen: boolean;
  account: FinancialAccount | null;
  summary?: FinancialAccountSummary;
  accounts: FinancialAccount[];
  transactions: Transaction[];
  onClose: () => void;
  onAddTransaction?: (type: 'income' | 'expense') => void;
}

type GroupMode = 'day' | 'week' | 'month';

const PAGE_SIZE = 50;

const formatAmount = (amount: number) => `$${amount.toLocaleString('zh-TW')}`;

const getDateKey = (date: string) => date.substring(0, 10);

const getWeekStart = (date: string) => {
  const value = new Date(date);
  const day = value.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  value.setDate(value.getDate() + diff);
  return value.toISOString().substring(0, 10);
};

const getGroupKey = (date: string, mode: GroupMode) => {
  if (mode === 'day') return getDateKey(date);
  if (mode === 'week') return getWeekStart(date);
  return date.substring(0, 7);
};

const formatGroupLabel = (key: string, mode: GroupMode) => {
  const [year, month, day] = key.split('-').map(Number);
  if (mode === 'month') return `${year}年${month}月`;
  if (mode === 'week') return `週起始 ${year}年${month}月${day}日`;
  return `${year}年${month}月${day}日`;
};

const getAccountIcon = (account: FinancialAccount) => {
  if (account.type === 'bank') return 'landmark';
  if (account.type === 'credit-card') return 'credit-card';
  return 'wallet';
};

export const FinancialAccountDetailsModal: FC<FinancialAccountDetailsModalProps> = ({
  isOpen,
  account,
  summary,
  accounts,
  transactions,
  onClose,
  onAddTransaction,
}) => {
  const [mode, setMode] = useState<GroupMode>('month');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    if (isOpen) {
      setMode('month');
      setVisibleCount(PAGE_SIZE);
    }
  }, [account?.id, isOpen]);

  const accountNameById = useMemo(
    () => new Map(accounts.map((item) => [item.id, item.name])),
    [accounts]
  );

  const accountTransactions = useMemo(() => {
    if (!account) return [];
    return transactions
      .filter(
        (transaction) =>
          transaction.financialAccountId === account.id ||
          transaction.transferSourceFinancialAccountId === account.id ||
          transaction.transferDestinationFinancialAccountId === account.id
      )
      .sort((left, right) => right.date.localeCompare(left.date));
  }, [account, transactions]);

  const visibleTransactions = accountTransactions.slice(0, visibleCount);
  const groupedTransactions = visibleTransactions.reduce<Record<string, Transaction[]>>(
    (groups, transaction) => {
      const key = getGroupKey(transaction.date, mode);
      groups[key] = groups[key] ?? [];
      groups[key].push(transaction);
      return groups;
    },
    {}
  );

  const amountLabel = account?.type === 'credit-card'
    ? summary?.status === 'credit'
      ? `溢繳 ${formatAmount(summary.amount)}`
      : `未繳 ${formatAmount(summary?.amount ?? account.openingAmount)}`
    : formatAmount(summary?.amount ?? (account ? getFinancialAccountOpeningAmount(account) : 0));

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="financial-account-details-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{account?.name ?? '帳戶明細'}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => onClose()} title="關閉帳戶明細" aria-label="關閉帳戶明細">
              <AppIcon name="x" size={20} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
      <div className="fade-in" style={{ minHeight: '100%', padding: '24px', background: 'var(--bg-color)', color: 'var(--text-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {account && <AppIcon name={getAccountIcon(account)} size={20} style={{ color: 'var(--primary-color)' }} />}
              <h2 style={{ margin: 0, fontSize: '1.15rem' }}>{account?.name ?? '帳戶明細'}</h2>
            </div>
            <div style={{ marginTop: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              {amountLabel}
            </div>
          </div>
        </div>

        <div
          className="segment-btn-group"
          role="tablist"
          aria-label="帳戶明細分組"
          style={{ marginTop: '18px', padding: '4px' }}
        >
          {([
            ['day', '日'],
            ['week', '週'],
            ['month', '月'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              className={`segment-btn ${mode === value ? 'active' : ''}`}
              onClick={() => {
                setMode(value);
                setVisibleCount(PAGE_SIZE);
              }}
              style={{ flex: 1, padding: '8px 12px', borderRadius: '6px', fontWeight: 600 }}
            >
              {label}
            </button>
          ))}
        </div>

        {account && onAddTransaction && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
            <button
              type="button"
              onClick={() => onAddTransaction('income')}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'var(--income-bg)',
                color: 'var(--income-color)',
                border: '1px solid var(--income-color)',
                fontWeight: 600,
              }}
            >
              <AppIcon name="plus" size={15} /> 新增收入
            </button>
            <button
              type="button"
              onClick={() => onAddTransaction('expense')}
              style={{
                flex: 1,
                padding: '10px 12px',
                borderRadius: 'var(--border-radius-sm)',
                background: 'var(--expense-bg)',
                color: 'var(--expense-color)',
                border: '1px solid var(--expense-color)',
                fontWeight: 600,
              }}
            >
              <AppIcon name="plus" size={15} /> 新增支出
            </button>
          </div>
        )}

        {account && (account.openingAmountAdjustments ?? []).length > 0 && (
          <section style={{ marginTop: '18px' }} aria-label="資產調整明細">
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--sub-card-bg)',
                border: '1px solid var(--sub-card-border)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              資產調整
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {[...(account.openingAmountAdjustments ?? [])]
                .sort((left, right) => right.date.localeCompare(left.date))
                .map((adjustment) => (
                  <div key={adjustment.id} className="glass-card" style={{ padding: '12px 14px', borderRadius: 'var(--border-radius-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                      <div>
                        <div style={{ fontWeight: 600 }}>初始金額調整</div>
                        <div style={{ marginTop: '4px', color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
                          {adjustment.date.substring(0, 10)}
                        </div>
                      </div>
                      <strong style={{ color: adjustment.amount >= 0 ? 'var(--income-color)' : 'var(--expense-color)' }}>
                        {adjustment.amount >= 0 ? '+' : '-'}${Math.abs(adjustment.amount).toLocaleString('zh-TW')}
                      </strong>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        )}

        {account && (
          <section style={{ marginTop: '18px' }} aria-label="初始餘額">
            <div
              style={{
                padding: '8px 12px',
                background: 'var(--sub-card-bg)',
                border: '1px solid var(--sub-card-border)',
                borderRadius: 'var(--border-radius-sm)',
                color: 'var(--text-secondary)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              初始餘額
            </div>
            <div className="glass-card" style={{ marginTop: '8px', padding: '12px 14px', borderRadius: 'var(--border-radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                <div style={{ fontWeight: 600 }}>帳戶建立金額</div>
                <strong style={{ color: 'var(--text-secondary)' }}>
                  {formatAmount(getFinancialAccountOpeningAmount(account))}
                </strong>
              </div>
            </div>
          </section>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '18px' }}>
          {Object.keys(groupedTransactions).length === 0 ? (
            <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              尚無帳戶明細
            </div>
          ) : (
            Object.entries(groupedTransactions).map(([key, group]) => (
              <section key={key}>
                <div
                  style={{
                    padding: '8px 12px',
                    background: 'var(--sub-card-bg)',
                    border: '1px solid var(--sub-card-border)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                  }}
                >
                  {formatGroupLabel(key, mode)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                  {group.map((transaction) => {
                    const isIncome = transaction.type === 'income';
                    const isTransfer = transaction.type === 'transfer';
                    const isInboundTransfer = transaction.transferDestinationFinancialAccountId === account?.id;
                    const description = isTransfer
                      ? `${accountNameById.get(transaction.transferSourceFinancialAccountId ?? '') ?? '未指定帳戶'} → ${accountNameById.get(transaction.transferDestinationFinancialAccountId ?? '') ?? '未指定帳戶'}`
                      : transaction.description;
                    const amountPrefix = isIncome ? '+' : isTransfer ? '±' : '-';
                    const amountColor = isIncome
                      ? 'var(--income-color)'
                      : isTransfer
                        ? 'var(--primary-color)'
                        : 'var(--expense-color)';
                    const typeLabel = isTransfer ? (isInboundTransfer ? '轉入' : '轉出') : isIncome ? '收入' : '支出';

                    return (
                      <div key={transaction.id} className="glass-card" style={{ padding: '12px 14px', borderRadius: 'var(--border-radius-md)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {description}
                            </div>
                            <div style={{ marginTop: '4px', color: 'var(--text-tertiary)', fontSize: '0.72rem' }}>
                              {typeLabel} · {transaction.date.substring(0, 10)}
                            </div>
                          </div>
                          <strong style={{ color: amountColor, whiteSpace: 'nowrap' }}>
                            {amountPrefix}${transaction.amount.toLocaleString('zh-TW')}
                          </strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ))
          )}
        </div>

        {visibleCount < accountTransactions.length && (
          <button
            type="button"
            onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '10px 12px',
              borderRadius: 'var(--border-radius-sm)',
              background: 'var(--input-bg)',
              border: '1px solid var(--input-border)',
              color: 'var(--primary-color)',
              fontWeight: 600,
            }}
          >
            載入更多明細
          </button>
        )}
      </div>
      </IonContent>
    </IonModal>
  );
};
