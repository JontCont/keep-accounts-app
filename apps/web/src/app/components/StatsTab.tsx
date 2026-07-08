import React, { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { IonSelect, IonSelectOption } from '@ionic/react';
import { Transaction, AccountGroup, ACCOUNT_COLORS } from '@keep-accounts-app/domain';
import { AppIcon } from './AppIcon';

interface StatsTabProps {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  getCategoryEmoji: (catName: string, groupId: string) => string;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  accountGroups,
  transactions,
  getCategoryEmoji,
}) => {
  const [statsGroup, setStatsGroup] = useState<string>('all');
  const [statsSubTab, setStatsSubTab] = useState<'category' | 'trend'>('category');

  const statsTxs = transactions.filter(
    (tx) => tx.type === 'expense' && (statsGroup === 'all' || tx.accountGroupId === statsGroup)
  );
  const statsTotalExpense = statsTxs.reduce((sum, tx) => sum + tx.amount, 0);

  let sortedStats: { name: string; emoji: string; color: string; amount: number }[] = [];

  if (statsGroup === 'all') {
    const activeExpenseByCategory = statsTxs.reduce(
      (acc: { [key: string]: { amount: number; emoji: string; color: string } }, tx) => {
        if (!acc[tx.category]) {
          let emoji = '🏷️';
          let color = '#6b7280';
          const group = accountGroups.find((g) => g.id === tx.accountGroupId);
          if (group) {
            const cat = group.categories.find((c) => c.name === tx.category);
            if (cat) {
              emoji = cat.emoji;
              color = cat.color;
            }
          }
          acc[tx.category] = { amount: 0, emoji, color };
        }
        acc[tx.category].amount += tx.amount;
        return acc;
      },
      {}
    );

    sortedStats = Object.entries(activeExpenseByCategory)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.amount - a.amount);
  } else {
    const selectedGroupObj = accountGroups.find((g) => g.id === statsGroup);
    const groupCategories = selectedGroupObj?.categories.filter((c) => c.type === 'expense') || [];

    const groupExpenseMap = statsTxs.reduce((acc: { [key: string]: number }, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

    sortedStats = groupCategories
      .map((cat) => ({
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        amount: groupExpenseMap[cat.name] || 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  const dailyMap = statsTxs.reduce((acc: { [key: string]: number }, tx) => {
    const dateKey = tx.date.substring(0, 10);
    acc[dateKey] = (acc[dateKey] || 0) + tx.amount;
    return acc;
  }, {});

  const trendData = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  const pieData = sortedStats.filter((item) => item.amount > 0);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="glass-card"
          style={{
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(20, 20, 25, 0.95)',
            fontSize: '0.8rem',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AppIcon name={data.emoji} size={16} /> {data.name}
          </p>
          <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>
            金額: ${data.amount.toLocaleString('zh-TW')}
          </p>
          <p style={{ margin: '2px 0 0 0', color: 'var(--primary-color)', fontWeight: 500 }}>
            佔比: {statsTotalExpense > 0 ? Math.round((data.amount / statsTotalExpense) * 100) : 0}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomBarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="glass-card"
          style={{
            padding: '8px 12px',
            border: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(20, 20, 25, 0.95)',
            fontSize: '0.8rem',
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>📅 {data.date}</p>
          <p style={{ margin: '4px 0 0 0', color: 'var(--expense-color)', fontWeight: 600 }}>
            支出: ${data.amount.toLocaleString('zh-TW')}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Account Group Selector for Stats */}
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
          value={statsGroup}
          interface="action-sheet"
          onIonChange={(e) => setStatsGroup(e.detail.value!)}
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

      {/* Overview stats */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          textAlign: 'center',
          padding: '16px',
        }}
      >
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>總記帳筆數</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{statsTxs.length} 筆</div>
        </div>
        <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}></div>
        <div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>平均支出 / 筆</div>
          <div
            style={{
              fontSize: '1.2rem',
              fontWeight: 700,
              color: 'var(--expense-color)',
            }}
          >
            $
            {statsTxs.length > 0
              ? Math.round(statsTotalExpense / statsTxs.length).toLocaleString('zh-TW')
              : 0}
          </div>
        </div>
      </div>

      {statsTotalExpense > 0 && (
        <>
          {/* View Switcher Segmented Control */}
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
            <button
              type="button"
              onClick={() => setStatsSubTab('category')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: statsSubTab === 'category' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: statsSubTab === 'category' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              類別佔比
            </button>
            <button
              type="button"
              onClick={() => setStatsSubTab('trend')}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
                background: statsSubTab === 'trend' ? 'rgba(255,255,255,0.08)' : 'transparent',
                color: statsSubTab === 'trend' ? '#fff' : 'var(--text-secondary)',
              }}
            >
              趨勢分析
            </button>
          </div>

          {/* Active Chart Card */}
          <div
            className="glass-card"
            style={{
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            <h4
              style={{
                fontSize: '0.95rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                margin: 0,
              }}
            >
              {statsSubTab === 'category' ? '支出類別佔比圖' : '支出金額趨勢圖'}
            </h4>

            {statsSubTab === 'category' ? (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '220px',
                }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="amount"
                    >
                      {pieData.map((entry, idx) => (
                        <Cell key={`cell-${idx}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomPieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: '220px',
                }}
              >
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={trendData}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <XAxis
                      dataKey="date"
                      tick={{ fill: '#8f93a7', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: '#8f93a7', fontSize: 10 }}
                      axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                      tickLine={false}
                    />
                    <Tooltip content={<CustomBarTooltip />} />
                    <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* Category Bars */}
      <div
        className="glass-card"
        style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}
      >
        <h4
          style={{
            fontSize: '0.95rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            margin: 0,
          }}
        >
          各類別支出佔比
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sortedStats.map((cat) => {
            const pct = statsTotalExpense > 0 ? Math.round((cat.amount / statsTotalExpense) * 100) : 0;
            return (
              <div key={cat.name}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '0.85rem',
                    marginBottom: '6px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AppIcon name={cat.emoji} size={16} />
                    <span style={{ fontWeight: 500 }}>{cat.name}</span>
                  </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    ${cat.amount.toLocaleString('zh-TW')} ({pct}%)
                  </span>
                </div>

                {/* Progress Track */}
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: '4px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: cat.color,
                      borderRadius: '4px',
                      transition: 'width 0.8s ease-out',
                    }}
                  />
                </div>
              </div>
            );
          })}
          {statsTotalExpense === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '20px 0',
                color: 'var(--text-tertiary)',
                fontSize: '0.85rem',
              }}
            >
              目前尚無支出資料可進行統計分析
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
