import type { FC } from 'react';
import { FinancialAccount, Transaction } from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';
import { SharedTableRow } from './SharedTableRow';

interface TransactionLedgerRowProps {
  tx: Transaction;
  getCategoryEmoji: (catName: string, groupId: string) => string;
  getGroupName: (groupId: string) => string;
  financialAccounts?: FinancialAccount[];
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  dataTestId?: string;
}

export const TransactionLedgerRow: FC<TransactionLedgerRowProps> = ({
  tx,
  getCategoryEmoji,
  getGroupName,
  financialAccounts = [],
  onEditTransaction,
  onDeleteTransaction,
  dataTestId,
}) => {
  const datePart = tx.date.substring(0, 10);
  const timePart = tx.date.includes('T') ? tx.date.substring(11, 16) : '';
  const isInstallment = !!tx.installmentId;
  const amountPrefix = tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '±';
  const accountNameById = new Map(financialAccounts.map((account) => [account.id, account.name]));
  const accountLabel =
    tx.type === 'transfer'
      ? `${accountNameById.get(tx.transferSourceFinancialAccountId ?? '') ?? '未指定帳戶'} → ${
          accountNameById.get(tx.transferDestinationFinancialAccountId ?? '') ?? '未指定帳戶'
        }`
      : accountNameById.get(tx.financialAccountId ?? '') ?? '未指定帳戶';

  return (
    <SharedTableRow className="glass-card" dataTestId={dataTestId}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
        <div className="tx-ledger-badge" data-tx-type={tx.type}>
          <AppIcon name={getCategoryEmoji(tx.category, tx.accountGroupId)} size={22} />
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontWeight: 500,
              fontSize: '0.95rem',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tx.description}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {tx.category} • {getGroupName(tx.accountGroupId)}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            金融帳戶：{accountLabel}
          </div>
          <div
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-tertiary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {datePart}
            {timePart ? ` ${timePart}` : ''}
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        <span className="tx-ledger-amount" data-tx-type={tx.type}>
          {amountPrefix}${tx.amount.toLocaleString('zh-TW')}
        </span>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {isInstallment ? (
            <span
              style={{
                fontSize: '0.7rem',
                color: 'var(--primary-color)',
                background: 'rgba(99, 102, 241, 0.08)',
                borderRadius: 'var(--border-radius-sm)',
                padding: '2px 6px',
                whiteSpace: 'nowrap',
              }}
            >
              分期
              {tx.installmentPeriod && tx.installmentCount ? ` ${tx.installmentPeriod}/${tx.installmentCount}` : ''}
            </span>
          ) : (
            <>
              {onEditTransaction && (
                <button
                  type="button"
                  onClick={() => onEditTransaction(tx)}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.9rem',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="編輯"
                >
                  <AppIcon name="edit" size={16} />
                </button>
              )}
              {onDeleteTransaction && (
                <button
                  type="button"
                  onClick={() => onDeleteTransaction(tx.id)}
                  style={{
                    background: 'transparent',
                    color: 'var(--text-tertiary)',
                    fontSize: '0.9rem',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                  title="刪除"
                >
                  <AppIcon name="trash" size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </SharedTableRow>
  );
};
