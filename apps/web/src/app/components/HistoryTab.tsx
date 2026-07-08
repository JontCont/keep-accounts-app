import React, { useState } from 'react';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { Transaction, AccountGroup } from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface HistoryTabProps {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  getCategoryEmoji: (catName: string, groupId: string) => string;
  getGroupName: (groupId: string) => string;
  onEditTransaction: (tx: Transaction) => void;
  onAddTransaction: () => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  accountGroups,
  transactions,
  onDeleteTransaction,
  getCategoryEmoji,
  getGroupName,
  onEditTransaction,
  onAddTransaction,
}) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const filteredTxs = transactions
    .filter((tx) => filter === 'all' || tx.type === filter)
    .filter((tx) => filterGroup === 'all' || tx.accountGroupId === filterGroup)
    .sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px', position: 'relative' }}>

      {/* Filter Group Selector */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.85rem',
            color: 'var(--text-secondary)',
            whiteSpace: 'nowrap',
          }}
        >
          帳戶：
        </span>
        <IonSelect
          value={filterGroup}
          interface="action-sheet"
          onIonChange={(e) => setFilterGroup(e.detail.value!)}
          style={{
            padding: '8px 12px',
            fontSize: '0.85rem',
            borderRadius: 'var(--border-radius-sm)',
          }}
        >
          <IonSelectOption value="all">顯示全部帳戶</IonSelectOption>
          {accountGroups.map((g) => (
            <IonSelectOption key={g.id} value={g.id}>
              {g.emoji} {g.name}
            </IonSelectOption>
          ))}
        </IonSelect>
      </div>

      {/* Filter buttons for type */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(255,255,255,0.03)',
          padding: '4px',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        {(['all', 'income', 'expense'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
              background: filter === t ? 'rgba(255,255,255,0.08)' : 'transparent',
              color: filter === t ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {t === 'all' ? '全部' : t === 'income' ? '收入' : '支出'}
          </button>
        ))}
      </div>

      {/* History Ledger List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredTxs.map((tx) => {
          const datePart = tx.date.substring(0, 10);
          const timePart = tx.date.includes('T') ? tx.date.substring(11, 16) : '';
          return (
            <div
              key={tx.id}
              className="glass-card"
              style={{
                padding: '16px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderRadius: 'var(--border-radius-md)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                  }}
                >
                  <AppIcon name={getCategoryEmoji(tx.category, tx.accountGroupId)} size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{tx.description}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {tx.category} • {getGroupName(tx.accountGroupId)} • {datePart}
                    {timePart ? ` ${timePart}` : ''}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    fontWeight: 600,
                    color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)',
                  }}
                >
                  {tx.type === 'income' ? '+' : '-'}${tx.amount}
                </span>
                <button
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
                <button
                  onClick={() => {
                    if (confirm('確定要刪除此筆記帳嗎？')) {
                      onDeleteTransaction(tx.id);
                    }
                  }}
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
              </div>
            </div>
          );
        })}
        {filteredTxs.length === 0 && (
          <div
            style={{
              textAlign: 'center',
              padding: '60px 0',
              color: 'var(--text-tertiary)',
              fontSize: '0.9rem',
            }}
          >
            沒有找到符合條件的明細
          </div>
        )}
      </div>

      {/* Floating Action Button (FAB) */}
      <button
        onClick={onAddTransaction}
        style={{
          position: 'fixed',
          bottom: '96px',
          right: '24px',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(99, 102, 241, 0.75)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(99, 102, 241, 0.3)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 999,
          transition: 'transform 0.2s, background-color 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.05)';
          e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.9)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.75)';
        }}
        title="新增記帳"
      >
        <AppIcon name="plus" size={24} />
      </button>
    </div>
  );
};
