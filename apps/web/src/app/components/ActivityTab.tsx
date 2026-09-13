import { useState, type FC } from 'react';
import { AccountGroup, FinancialAccount, Transaction } from '@keep-accounts-app/domain';
import { HistoryTab } from './HistoryTab';
import { StatsTab } from './StatsTab';

interface ActivityTabProps {
  accountGroups: AccountGroup[];
  financialAccounts: FinancialAccount[];
  transactions: Transaction[];
  preferNativeQueries: boolean;
  onDeleteTransaction: (id: string) => void;
  onDeleteInstallmentGroup: (installmentId: string) => void;
  onSettleInstallmentGroup: (installmentId: string) => void;
  getCategoryEmoji: (catName: string, groupId: string) => string;
  getGroupName: (groupId: string) => string;
  onEditTransaction: (tx: Transaction) => void;
  onAddTransaction: () => void;
  showFab: boolean;
}

type ActivityView = 'history' | 'stats';

export const ActivityTab: FC<ActivityTabProps> = ({
  accountGroups,
  financialAccounts,
  transactions,
  preferNativeQueries,
  onDeleteTransaction,
  onDeleteInstallmentGroup,
  onSettleInstallmentGroup,
  getCategoryEmoji,
  getGroupName,
  onEditTransaction,
  onAddTransaction,
  showFab,
}) => {
  const [view, setView] = useState<ActivityView>('history');

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div
        className="segment-btn-group"
        role="tablist"
        aria-label="明細分析檢視"
        style={{ width: '100%', padding: '4px' }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={view === 'history'}
          className={`segment-btn ${view === 'history' ? 'active' : ''}`}
          onClick={() => setView('history')}
          style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', fontWeight: 600 }}
        >
          交易明細
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={view === 'stats'}
          className={`segment-btn ${view === 'stats' ? 'active' : ''}`}
          onClick={() => setView('stats')}
          style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', fontWeight: 600 }}
        >
          支出分析
        </button>
      </div>

      {view === 'history' ? (
        <HistoryTab
          accountGroups={accountGroups}
          financialAccounts={financialAccounts}
          transactions={transactions}
          preferNativeQueries={preferNativeQueries}
          onDeleteTransaction={onDeleteTransaction}
          onDeleteInstallmentGroup={onDeleteInstallmentGroup}
          onSettleInstallmentGroup={onSettleInstallmentGroup}
          getCategoryEmoji={getCategoryEmoji}
          getGroupName={getGroupName}
          onEditTransaction={onEditTransaction}
          onAddTransaction={onAddTransaction}
          showFab={showFab}
        />
      ) : (
        <StatsTab
          accountGroups={accountGroups}
          transactions={transactions}
          preferNativeQueries={preferNativeQueries}
          getCategoryEmoji={getCategoryEmoji}
        />
      )}
    </div>
  );
};
