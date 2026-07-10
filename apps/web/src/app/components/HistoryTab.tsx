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
  showFab?: boolean;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({
  accountGroups,
  transactions,
  onDeleteTransaction,
  getCategoryEmoji,
  getGroupName,
  onEditTransaction,
  onAddTransaction,
  showFab = true,
}) => {
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  const filteredTxs = transactions
    .filter((tx) => filter === 'all' || tx.type === filter)
    .filter((tx) => filterGroup === 'all' || tx.accountGroupId === filterGroup)
    .sort((a, b) => b.date.localeCompare(a.date));

  const [groupBy, setGroupBy] = useState<'year' | 'month' | 'day'>('month');
  const [isHovered, setIsHovered] = useState(false);

  const getGroupKey = (dateStr: string, mode: 'day' | 'month' | 'year') => {
    const datePart = dateStr.substring(0, 10);
    if (mode === 'day') return datePart;
    if (mode === 'month') return datePart.substring(0, 7);
    return datePart.substring(0, 4);
  };

  const formatGroupHeader = (key: string, mode: 'day' | 'month' | 'year') => {
    if (mode === 'day') {
      const parts = key.split('-');
      if (parts.length === 3) {
        return `${parts[0]}年${parseInt(parts[1])}月${parseInt(parts[2])}日`;
      }
      return key;
    }
    if (mode === 'month') {
      const parts = key.split('-');
      if (parts.length === 2) {
        return `${parts[0]}年${parseInt(parts[1])}月`;
      }
      return key;
    }
    return `${key}年`;
  };

  const getGroupTotals = (groupTxs: Transaction[]) => {
    const income = groupTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = groupTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense };
  };

  // Group transactions by date key
  const groupedTxs: Record<string, Transaction[]> = {};
  filteredTxs.forEach((tx) => {
    const key = getGroupKey(tx.date, groupBy);
    if (!groupedTxs[key]) {
      groupedTxs[key] = [];
    }
    groupedTxs[key].push(tx);
  });

  // Sort keys descending
  const sortedGroupKeys = Object.keys(groupedTxs).sort((a, b) => b.localeCompare(a));

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px', position: 'relative' }}>

      {/* Filter controls row */}
      <div style={{ display: 'flex', gap: '16px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
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
              fontSize: '0.85rem',
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

        {/* Group By Selector */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              whiteSpace: 'nowrap',
            }}
          >
            分組：
          </span>
          <div className="segment-btn-group" style={{ padding: '3px' }}>
            {(['year', 'month', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setGroupBy(mode)}
                className={`segment-btn ${groupBy === mode ? 'active' : ''}`}
                style={{
                  padding: '4px 12px',
                  borderRadius: '4px',
                  fontSize: '0.78rem',
                  fontWeight: 500,
                }}
              >
                {mode === 'year' ? '年' : mode === 'month' ? '月' : '日'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Filter buttons for type */}
      <div className="segment-btn-group">
        {(['all', 'income', 'expense'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`segment-btn ${filter === t ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '8px',
              borderRadius: '6px',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {t === 'all' ? '全部' : t === 'income' ? '收入' : '支出'}
          </button>
        ))}
      </div>

      {/* History Ledger List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {sortedGroupKeys.map((groupKey) => {
          const groupTransactions = groupedTxs[groupKey];
          const { income, expense } = getGroupTotals(groupTransactions);
          return (
            <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {/* Group Header */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'var(--sub-card-bg)',
                  border: '1px solid var(--sub-card-border)',
                  fontSize: '0.85rem',
                  color: 'var(--text-secondary)',
                  marginTop: '8px',
                }}
              >
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {formatGroupHeader(groupKey, groupBy)}
                </span>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', fontWeight: 500 }}>
                  {income > 0 && <span style={{ color: 'var(--income-color)' }}>收入: +${income}</span>}
                  {expense > 0 && <span style={{ color: 'var(--expense-color)' }}>支出: -${expense}</span>}
                </div>
              </div>

              {/* Transactions list in group */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {groupTransactions.map((tx) => {
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
                            if (window.confirm('確定要刪除此筆記帳嗎？')) {
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
    </div>
  );
};
