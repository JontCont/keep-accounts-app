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

  const totalIncome = transactions
    .filter((tx) => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

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
    const groupTxs = transactions.filter((tx) => tx.accountGroupId === groupId);
    const income = groupTxs
      .filter((tx) => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expense = groupTxs
      .filter((tx) => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return income - expense;
  };

  const totalPositive = accountGroups
    .map((g) => getGroupBalance(g.id))
    .filter((b) => b > 0)
    .reduce((sum, b) => sum + b, 0);

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
          background:
            'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
          border: '1px solid rgba(255, 255, 255, 0.12)',
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
          <div
            style={{
              display: 'flex',
              gap: '4px',
              background: 'rgba(255,255,255,0.03)',
              padding: '2px',
              borderRadius: 'var(--border-radius-sm)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <button
              type="button"
              onClick={() => setPeriod('today')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: period === 'today' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: period === 'today' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              今日
            </button>
            <button
              type="button"
              onClick={() => setPeriod('month')}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                background: period === 'month' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: period === 'month' ? '#fff' : 'var(--text-secondary)',
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
            color: totalBalance >= 0 ? '#fff' : 'var(--expense-color)',
          }}
        >
          ${totalBalance.toLocaleString('zh-TW')}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
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
              borderTop: '1px dashed rgba(255,255,255,0.1)',
              fontSize: '0.85rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>當日可消費 (累計昨天)</span>
              <span style={{ fontWeight: 600, color: '#fff' }}>
                ${allowedToday.toLocaleString('zh-TW')}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ color: 'var(--text-secondary)' }}>當日消費: </span>
                <span style={{ fontWeight: 600, color: '#fff' }}>
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
                background: 'rgba(255,255,255,0.06)',
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

        {/* Stacked Progress Bar for Asset Allocation at the top */}
        {!isEditingGroups && totalPositive > 0 && (
          <div
            style={{
              width: '100%',
              height: '12px',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '6px',
              display: 'flex',
              overflow: 'hidden',
              marginBottom: '16px',
            }}
          >
            {accountGroups.map((group) => {
              const bal = getGroupBalance(group.id);
              if (bal <= 0) return null;
              const pct = (bal / totalPositive) * 100;
              return (
                <div
                  key={group.id}
                  style={{
                    width: `${pct}%`,
                    height: '100%',
                    backgroundColor: group.color || '#6366f1',
                    transition: 'width 0.5s ease-in-out',
                  }}
                  title={`${group.name}: ${Math.round(pct)}%`}
                />
              );
            })}
          </div>
        )}

        {/* Accounts scroll container */}
        {!isEditingGroups && (
          <div
            style={{
              display: 'flex',
              gap: '12px',
              overflowX: 'auto',
              paddingBottom: '8px',
              scrollbarWidth: 'none',
            }}
          >
            {accountGroups.map((group) => {
              const bal = getGroupBalance(group.id);
              const actualPct =
                totalPositive > 0 ? Math.round((Math.max(0, bal) / totalPositive) * 100) : 0;
              const targetRatio = group.targetRatio || 0;
              const comparisonRatio = targetRatio > 0 ? Math.round((actualPct / targetRatio) * 100) : 0;

              return (
                <div
                  key={group.id}
                  className="glass-card"
                  style={{
                    flexShrink: 0,
                    width: '150px',
                    padding: '16px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'rgba(255, 255, 255, 0.03)',
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
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '70%',
                      }}
                    >
                      <AppIcon name={group.emoji} size={18} />
                      <span>{group.name}</span>
                    </span>
                    <span
                      style={{
                        fontSize: '0.7rem',
                        padding: '2px 5px',
                        borderRadius: '8px',
                        background: 'rgba(255,255,255,0.06)',
                        color: 'var(--text-secondary)',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {actualPct}%
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      marginTop: '12px',
                      color: bal >= 0 ? '#fff' : 'var(--expense-color)',
                    }}
                  >
                    ${bal.toLocaleString('zh-TW')}
                  </div>

                  {/* Target Progress Bar */}
                  <div
                    style={{
                      marginTop: '12px',
                      borderTop: '1px solid rgba(255,255,255,0.06)',
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
                      <span>目標 {targetRatio}%</span>
                      <span>達標 {comparisonRatio}%</span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '5px',
                        background: 'rgba(255,255,255,0.06)',
                        borderRadius: '2.5px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.min(100, comparisonRatio)}%`,
                          height: '100%',
                          backgroundColor: group.color,
                          borderRadius: '2.5px',
                          transition: 'width 0.3s ease-in-out',
                        }}
                      />
                    </div>
                  </div>

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
                            borderTop: '1px solid rgba(255,255,255,0.06)',
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
                              background: 'rgba(255,255,255,0.06)',
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
            const { income, expense } = getGroupTotals(groupTxs);
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
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                    {income > 0 && (
                      <span style={{ color: 'var(--income-color)', marginRight: '8px' }}>
                        +{income}
                      </span>
                    )}
                    {expense > 0 && <span style={{ color: 'var(--expense-color)' }}>-{expense}</span>}
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
                        <div style={{ display: 'flex', gap: '4px' }}>
                          <button
                            type="button"
                            onClick={() => onEditTransactionClick(tx)}
                            style={{
                              background: 'transparent',
                              color: 'var(--text-tertiary)',
                              fontSize: '0.85rem',
                              padding: '4px',
                              opacity: 0.7,
                            }}
                            title="編輯"
                          >
                            ✏️
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTransaction(tx.id)}
                            style={{
                              background: 'transparent',
                              color: 'var(--text-tertiary)',
                              fontSize: '0.85rem',
                              padding: '4px',
                              opacity: 0.7,
                            }}
                            title="刪除"
                          >
                            🗑️
                          </button>
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
