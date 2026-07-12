import React, { useEffect, useState } from 'react';
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
import { Transaction, AccountGroup } from '@keep-accounts-app/domain';
import {
  isNativePersistenceEnabled,
  queryNativeStatsAggregates,
  queryStatsAggregates,
  StatsAggregationResult,
} from '@keep-accounts-app/state';
import { AppIcon } from './AppIcon';

interface StatsTabProps {
  accountGroups: AccountGroup[];
  transactions: Transaction[];
  getCategoryEmoji: (catName: string, groupId: string) => string;
  preferNativeQueries?: boolean;
}

export const StatsTab: React.FC<StatsTabProps> = ({
  accountGroups,
  transactions,
  getCategoryEmoji,
  preferNativeQueries = false,
}) => {
  const nativeMode = preferNativeQueries && isNativePersistenceEnabled();
  const [statsGroup, setStatsGroup] = useState<string>('all');
  const [statsSubTab, setStatsSubTab] = useState<'category' | 'trend'>('category');
  const [statsAggregates, setStatsAggregates] = useState<StatsAggregationResult>(() =>
    queryStatsAggregates({
      transactions,
      accountGroups,
      statsGroup: 'all',
    })
  );

  useEffect(() => {
    let cancelled = false;
    const loadAggregates = async () => {
      if (nativeMode) {
        const nativeAggregates = await queryNativeStatsAggregates({
          accountGroups,
          statsGroup,
        });
        if (!cancelled && nativeAggregates) {
          setStatsAggregates(nativeAggregates);
          return;
        }
      }

      if (!cancelled) {
        setStatsAggregates(
          queryStatsAggregates({
            transactions,
            accountGroups,
            statsGroup,
          })
        );
      }
    };

    void loadAggregates();
    return () => {
      cancelled = true;
    };
  }, [nativeMode, transactions, accountGroups, statsGroup]);

  const statsTotalExpense = statsAggregates.totalExpense;
  const sortedStats = statsAggregates.categories;
  const trendData = statsAggregates.trend;

  const pieData = sortedStats.filter((item) => item.amount > 0);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div
          className="glass-card"
          style={{
            padding: '8px 12px',
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
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
            border: '1px solid var(--card-border)',
            background: 'var(--card-bg)',
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
          <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{statsAggregates.totalCount} 筆</div>
        </div>
        <div style={{ borderLeft: '1px solid var(--card-border)' }}></div>
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
            {statsAggregates.totalCount > 0
              ? Math.round(statsTotalExpense / statsAggregates.totalCount).toLocaleString('zh-TW')
              : 0}
          </div>
        </div>
      </div>

      {statsTotalExpense > 0 && (
        <>
          {/* View Switcher Segmented Control */}
          <div className="segment-btn-group">
            <button
              type="button"
              onClick={() => setStatsSubTab('category')}
              className={`segment-btn ${statsSubTab === 'category' ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
              }}
            >
              類別佔比
            </button>
            <button
              type="button"
              onClick={() => setStatsSubTab('trend')}
              className={`segment-btn ${statsSubTab === 'trend' ? 'active' : ''}`}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: 600,
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
                      tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                      axisLine={{ stroke: 'var(--card-border)' }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'var(--text-secondary)', fontSize: 10 }}
                      axisLine={{ stroke: 'var(--card-border)' }}
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
                    background: 'var(--progress-track-bg)',
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
