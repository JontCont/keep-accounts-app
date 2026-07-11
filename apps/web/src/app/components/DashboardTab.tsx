import React, { useState } from 'react';
import {
  Transaction,
  AccountGroup,
  getCurrentMonthExpenseForGroup,
} from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface DashboardTabProps {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  onAddTransactionClick: () => void;
  onEditTransactionClick: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  isEditingGroups: boolean;
  setIsEditingGroups: (val: boolean) => void;
  getCategoryEmoji: (catName: string, groupId: string) => string;
  getGroupName: (groupId: string) => string;
  getGroupKey: (dateStr: string, mode: 'day' | 'month' | 'year') => string;
  formatGroupHeader: (key: string, mode: 'day' | 'month' | 'year') => string;
  getGroupTotals: (groupTxs: Transaction[]) => { income: number; expense: number };
  groupSettingsPanel: React.ReactNode;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  accountGroups,
  transactions,
  onAddTransactionClick,
  onEditTransactionClick,
  onDeleteTransaction,
  isEditingGroups,
  setIsEditingGroups,
  getCategoryEmoji,
  getGroupName,
  getGroupKey,
  formatGroupHeader,
  getGroupTotals,
  groupSettingsPanel,
}) => {
  const [period, setPeriod] = useState<'today' | 'month'>('month');

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  // Realized transactions only: future-dated entries (e.g. not-yet-due
  // installment periods) are excluded from lifetime balance totals but still
  // appear in the History tab as upcoming entries.
  const realizedTxs = transactions.filter(
    (tx) => tx.date.substring(0, 10) <= todayStr
  );

  const totalIncome = realizedTxs
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = realizedTxs
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const displayIncome = transactions
    .filter((tx) => tx.type === 'income')
    .filter((tx) =>
      period === 'today'
        ? tx.date.substring(0, 10) === todayStr
        : tx.date.startsWith(currentMonthStr)
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const displayExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .filter((tx) =>
      period === 'today'
        ? tx.date.substring(0, 10) === todayStr
        : tx.date.startsWith(currentMonthStr)
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Daily allowed consumption calculations for "日常開銷" (Group '1')
  const dailyExpenseGroup = accountGroups.find((g) => g.id === '1');
  const group1Budget = dailyExpenseGroup?.budget || 30000;
  const todayDay = new Date().getDate();
  const dailyAllowance = Math.round(group1Budget / 30);

  const cumulativeExpenseUpToYesterday = transactions
    .filter(
      (tx) =>
        tx.accountGroupId === '1' &&
        tx.type === 'expense' &&
        tx.date.startsWith(currentMonthStr) &&
        tx.date.substring(0, 10) < todayStr
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const allowedToday = todayDay * dailyAllowance - cumulativeExpenseUpToYesterday;

  const todayExpenseForDailyGroup = transactions
    .filter(
      (tx) =>
        tx.accountGroupId === '1' &&
        tx.type === 'expense' &&
        tx.date.substring(0, 10) === todayStr
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingToday = allowedToday - todayExpenseForDailyGroup;

  const getGroupBalance = (groupId: string) => {
    const groupTxs = realizedTxs.filter((tx) => tx.accountGroupId === groupId);
    const income = groupTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = groupTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return income - expense;
  };

  const sourceGroup = accountGroups.find((g) => g.isSource);

  const getGroupMonthlyIncome = (groupId: string) =>
    transactions
      .filter(
        (tx) =>
          tx.accountGroupId === groupId &&
          tx.type === 'income' &&
          tx.date.startsWith(currentMonthStr)
      )
      .reduce((sum, tx) => sum + tx.amount, 0);

  const sourcePool = sourceGroup ? getGroupMonthlyIncome(sourceGroup.id) : 0;

  const getGroupAllocated = (targetRatio: number) =>
    Math.round(sourcePool * (targetRatio / 100));

  const dashboardTxs = transactions
    .filter((tx) => tx.date.substring(0, 10) === todayStr)
    .sort((a, b) => b.date.localeCompare(a.date));

  const dashboardGrouped = dashboardTxs.reduce(
    (acc: { [key: string]: Transaction[] }, tx) => {
      const key = getGroupKey(tx.date, 'day');
      if (!acc[key]) acc[key] = [];
      acc[key].push(tx);
      return acc;
    },
    {}
  );
  const sortedDashboardKeys = Object.keys(dashboardGrouped).sort((a, b) =>
    b.localeCompare(a)
  );

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Balance Card */}
      <div
        className="glass-card"
        style={{
          background: 'var(--balance-card-bg)',
          border: '1px solid var(--card-border)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontSize: '0.9rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '1px',
            }}
          >
            目前總餘額
          </div>
          <div className="segment-btn-group">
            <button
              type="button"
              onClick={() => setPeriod('today')}
              className={`segment-btn ${period === 'today' ? 'active' : ''}`}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              今日
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              className={`segment-btn ${period === 'month' ? 'active' : ''}`}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              本月
            </button>
          </div>
        </div>
        <div
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            margin: '8px 0',
            color: totalBalance >= 0 ? 'var(--text-primary)' : 'var(--expense-color)',
          }}
        >
          ${totalBalance.toLocaleString('zh-TW')}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            borderTop: '1px solid var(--card-border)',
            paddingTop: '16px',
          }}
        >
          <div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {period === 'today' ? '今日收入' : '本月收入'}
            </div>
            <div style={{ color: 'var(--income-color)', fontWeight: 600, fontSize: '1.1rem' }}>
              +${displayIncome.toLocaleString('zh-TW')}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              {period === 'today' ? '今日支出' : '本月支出'}
            </div>
            <div style={{ color: 'var(--expense-color)', fontWeight: 600, fontSize: '1.1rem' }}>
              -${displayExpense.toLocaleString('zh-TW')}
            </div>
          </div>
        </div>

        {period === 'today' && dailyExpenseGroup ? (
          <div
            style={{
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px dashed var(--card-border)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>當日可消費 (累計昨天)</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                ${allowedToday.toLocaleString('zh-TW')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>當日消費: </span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  ${todayExpenseForDailyGroup.toLocaleString('zh-TW')}
                </span>
              </div>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>當日剩餘: </span>
                <span
                  style={{
                    fontWeight: 600,
                    color: remainingToday >= 0 ? 'var(--income-color)' : 'var(--expense-color)',
                  }}
                >
                  {remainingToday >= 0
                    ? `$${remainingToday.toLocaleString('zh-TW')}`
                    : `超支 $${Math.abs(remainingToday).toLocaleString('zh-TW')}`}
                </span>
              </div>
            </div>
            <div
              style={{
                width: '100%',
                height: '4px',
                background: 'var(--progress-track-bg)',
                borderRadius: '2px',
                overflow: 'hidden',
                marginTop: '2px',
              }}
            >
              <div
                style={{
                  width: `${Math.min(
                    100,
                    Math.max(
                      0,
                      allowedToday > 0 ? (todayExpenseForDailyGroup / allowedToday) * 100 : 100
                    )
                  )}%`,
                  height: '100%',
                  backgroundColor:
                    todayExpenseForDailyGroup > allowedToday
                      ? 'var(--expense-color)'
                      : 'var(--income-color)',
                  borderRadius: '2px',
                  transition: 'width 0.3s ease-in-out',
                }}
              />
            </div>
          </div>
        ) : null}
      </div>

      {/* Account Groups List */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '12px',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>資金大項帳戶</h3>
          <button
            onClick={() => setIsEditingGroups(!isEditingGroups)}
            style={{
              background: 'transparent',
              color: 'var(--primary-color)',
              fontSize: '0.85rem',
              fontWeight: 500,
            }}
          >
            {isEditingGroups ? '取消編輯' : '⚙️ 編輯帳戶'}
          </button>
        </div>

        {/* Total Bound Income to Allocate Block */}
        {/* Accounts scroll container */}
        {!isEditingGroups && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: '12px',
              paddingBottom: '8px',
            }}
          >
            {accountGroups.map((group) => {
              const bal = getGroupBalance(group.id);
              const isSrc = !!group.isSource;
              const targetRatio = group.targetRatio || 0;
              const allocated = getGroupAllocated(targetRatio);
              const monthlyExpense = getCurrentMonthExpenseForGroup(
                group.id,
                transactions
              );
              const remaining = allocated - monthlyExpense;
              const usedPct =
                allocated > 0
                  ? Math.round((monthlyExpense / allocated) * 100)
                  : 0;

              return (
                <div
                  key={group.id}
                  className="glass-card"
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 'var(--border-radius-md)',
                    background: isSrc
                      ? 'rgba(34, 197, 94, 0.08)'
                      : 'var(--sub-card-bg)',
                    border: isSrc
                      ? '1.5px solid rgba(34, 197, 94, 0.35)'
                      : '1px solid var(--sub-card-border)',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.9rem',
                      fontWeight: 500,
                      display: 'flex',
                      gap: '6px',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span
                      style={{
                        display: 'flex',
                        gap: '4px',
                        alignItems: 'center',
                        overflow: 'hidden',
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <AppIcon name={group.emoji} size={18} />
                      <span
                        style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {group.name}
                      </span>
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 5px',
                        borderRadius: '8px',
                        background: isSrc
                          ? 'rgba(34, 197, 94, 0.18)'
                          : 'var(--input-bg)',
                        color: isSrc
                          ? 'var(--income-color)'
                          : 'var(--text-secondary)',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {isSrc ? '來源' : `${targetRatio}%`}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      marginTop: '12px',
                      color: isSrc
                        ? 'var(--income-color)'
                        : bal >= 0
                        ? 'var(--text-primary)'
                        : 'var(--expense-color)',
                    }}
                  >
                    {isSrc
                      ? `+$${sourcePool.toLocaleString('zh-TW')}`
                      : `$${bal.toLocaleString('zh-TW')}`}
                  </div>

                  {isSrc ? (
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '0.72rem',
                        color: 'var(--text-secondary)',
                      }}
                    >
                      本月待分配總額
                    </div>
                  ) : (
                    <div
                      style={{
                        marginTop: '12px',
                        borderTop: '1px solid var(--card-border)',
                        paddingTop: '8px',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          fontSize: '0.7rem',
                          color: 'var(--text-tertiary)',
                          marginBottom: '6px',
                        }}
                      >
                        <span style={{ whiteSpace: 'nowrap' }}>
                          分配額 {targetRatio}% (${allocated.toLocaleString('zh-TW')})
                        </span>
                        <span style={{ whiteSpace: 'nowrap' }}>
                          已用 ${monthlyExpense.toLocaleString('zh-TW')}／餘 $
                          {remaining.toLocaleString('zh-TW')}
                        </span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '5px',
                          background: 'var(--progress-track-bg)',
                          borderRadius: '2.5px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, usedPct)}%`,
                            height: '100%',
                            backgroundColor:
                              usedPct >= 100
                                ? 'var(--expense-color)'
                                : group.color,
                            borderRadius: '2.5px',
                            transition: 'width 0.3s ease-in-out',
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {group.budget && group.budget > 0 ? (
                    (() => {
                      const monthlyExpense = getCurrentMonthExpenseForGroup(
                        group.id,
                        transactions
                      );
                      const pct = Math.round((monthlyExpense / group.budget!) * 100);
                      let barColor = '#10b981'; // Green
                      if (pct >= 80 && pct < 100) {
                        barColor = '#f59e0b'; // Yellow/Orange
                      } else if (pct >= 100) {
                        barColor = '#ef4444'; // Red
                      }
                      const barWidth = Math.min(100, pct);
                      return (
                        <div
                          style={{
                            marginTop: '12px',
                            borderTop: '1px solid var(--card-border)',
                            paddingTop: '8px',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              fontSize: '0.7rem',
                              color: 'var(--text-tertiary)',
                              marginBottom: '4px',
                            }}
                          >
                            <span>預算 ${group.budget!.toLocaleString('zh-TW')}</span>
                            <span
                              style={{
                                color:
                                  pct >= 100
                                    ? '#ef4444'
                                    : pct >= 80
                                    ? '#f59e0b'
                                    : 'var(--text-secondary)',
                                fontWeight: 600,
                              }}
                            >
                              {pct}%
                            </span>
                          </div>
                          <div
                            style={{
                              width: '100%',
                              height: '5px',
                              background: 'var(--progress-track-bg)',
                              borderRadius: '2.5px',
                              overflow: 'hidden',
                            }}
                          >
                            <div
                              style={{
                                width: `${barWidth}%`,
                                height: '100%',
                                backgroundColor: barColor,
                                borderRadius: '2.5px',
                                transition: 'width 0.3s ease-in-out',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })()
                  ) : null}
                </div>
              );
            })}
          </div>
        )}

        {/* Child settings panel */}
        {isEditingGroups && groupSettingsPanel}
      </div>

      {/* Quick Actions */}
      <button
        onClick={onAddTransactionClick}
        style={{
          background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
          color: '#fff',
          padding: '16px',
          borderRadius: 'var(--border-radius-md)',
          fontSize: '1.05rem',
          fontWeight: 600,
          boxShadow: '0 4px 15px var(--primary-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
        }}
      >
        <span>＋</span> 新增記帳明細
      </button>

      {/* Grouped Transaction Ledger */}
      <div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, margin: 0 }}>今日記帳明細</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedDashboardKeys.map((groupKey) => {
            const groupTxs = dashboardGrouped[groupKey];
            return (
              <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {/* Group Header */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0 4px',
                    fontSize: '0.85rem',
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    📅 {formatGroupHeader(groupKey, 'day')}
                  </span>
                </div>

                {/* Group Items */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {groupTxs.map((tx) => (
                    <div
                      key={tx.id}
                      className="glass-card"
                      style={{
                        padding: '12px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        borderRadius: 'var(--border-radius-md)',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            fontSize: '1.3rem',
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <AppIcon name={getCategoryEmoji(tx.category, tx.accountGroupId)} size={20} />
                        </div>
                        <div style={{ overflow: 'hidden' }}>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: '0.9rem',
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
                          {tx.type === 'income' ? '+' : '-'}${tx.amount}
                        </span>

                        {/* Edit & Delete Action Buttons */}
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                          {tx.installmentId ? (
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
                              分期{tx.installmentPeriod && tx.installmentCount ? ` ${tx.installmentPeriod}/${tx.installmentCount}` : ''}
                            </span>
                          ) : (
                            <>
                          <button
                            type="button"
                            onClick={() => onEditTransactionClick(tx)}
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
                            type="button"
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
                            <AppIcon name="trash-2" size={16} />
                          </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
          {dashboardTxs.length === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 0',
                color: 'var(--text-tertiary)',
                fontSize: '0.9rem',
              }}
            >
              今日尚無交易紀錄
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
