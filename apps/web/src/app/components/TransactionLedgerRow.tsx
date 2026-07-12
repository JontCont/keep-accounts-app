import React from 'react';
import { Transaction } from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface TransactionLedgerRowProps {
  tx: Transaction;
  getCategoryEmoji: (catName: string, groupId: string) => string;
  getGroupName: (groupId: string) => string;
  onEditTransaction?: (tx: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  dataTestId?: string;
}

export const TransactionLedgerRow: React.FC<TransactionLedgerRowProps> = ({
  tx,
  getCategoryEmoji,
  getGroupName,
  onEditTransaction,
  onDeleteTransaction,
  dataTestId,
}) => {
  const datePart = tx.date.substring(0, 10);
  const timePart = tx.date.includes('T') ? tx.date.substring(11, 16) : '';
  const isInstallment = !!tx.installmentId;

  return (
    <div
      className="glass-card"
      data-testid={dataTestId}
      style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: 'var(--border-radius-md)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
        <div
          style={{
            fontSize: '1.4rem',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
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
        <span
          style={{
            fontWeight: 600,
            fontSize: '0.95rem',
            color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
          }}
        >
          {tx.type === 'income' ? '+' : '-'}${tx.amount.toLocaleString('zh-TW')}
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
    </div>
  );
};
