import React, { useState } from 'react';
import { IonApp, IonContent, IonPage } from '@ionic/react';
import { Transaction, AccountGroup } from '@keep-accounts-app/domain';
import { useKeepAccounts } from '@keep-accounts-app/state';
import { DashboardTab } from './components/DashboardTab';
import { HistoryTab } from './components/HistoryTab';
import { StatsTab } from './components/StatsTab';
import { TransactionModal } from './components/TransactionModal';
import { GroupSettingsModal } from './components/GroupSettingsModal';

export function App() {
  const {
    accountGroups,
    transactions,
    saveTransaction,
    deleteTransaction,
    saveAccountGroups,
    addAccountGroup,
    deleteAccountGroup,
    addCategory,
    deleteCategory,
  } = useKeepAccounts();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats'>('dashboard');
  const [isEditingGroups, setIsEditingGroups] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  // Group Settings internal budget update callback
  const handleUpdateGroupBudget = (groupId: string, budget: number | undefined) => {
    const updated = accountGroups.map((g) => {
      if (g.id === groupId) {
        return { ...g, budget };
      }
      return g;
    });
    // This is managed locally in editingGroups, but we also update it on state to keep in sync.
    // However, saveAccountGroups is what actually writes it back to storage/state.
  };

  // Helpers
  const getCategoryEmoji = (catName: string, groupId: string) => {
    const matchGroup = accountGroups.find((g) => g.id === groupId);
    if (matchGroup) {
      const matchCat = matchGroup.categories.find((c) => c.name === catName);
      if (matchCat) return matchCat.emoji;
    }
    for (const group of accountGroups) {
      const matchCat = group.categories.find((c) => c.name === catName);
      if (matchCat) return matchCat.emoji;
    }
    return '🏷️';
  };

  const getGroupName = (groupId: string) => {
    const match = accountGroups.find((g) => g.id === groupId);
    return match ? `${match.emoji} ${match.name}` : '⚙️ 未知帳戶';
  };

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

  const handleSaveTransaction = (
    description: string,
    amount: string,
    type: 'income' | 'expense',
    category: string,
    date: string,
    accountGroupId: string
  ) => {
    const success = saveTransaction(
      description,
      amount,
      type,
      category,
      date,
      accountGroupId,
      editingTx ? editingTx.id : null
    );
    if (success) {
      setShowTxModal(false);
      setEditingTx(null);
      setActiveTab('dashboard');
    }
  };

  return (
    <IonApp>
      <IonPage>
        <IonContent fullscreen>
          <div className="app-container">
            {/* Header */}
            <header
              style={{
                marginBottom: '20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h1
                  style={{
                    fontSize: '1.6rem',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                  }}
                >
                  Keep Accounts
                </h1>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                  精緻微型記帳系統
                </p>
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                <div>{new Date().toLocaleDateString('zh-TW', { weekday: 'long' })}</div>
                <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {new Date().toLocaleDateString('zh-TW')}
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, paddingBottom: '80px' }}>
              {activeTab === 'dashboard' && (
                <DashboardTab
                  accountGroups={accountGroups}
                  transactions={transactions}
                  onAddTransactionClick={() => {
                    setEditingTx(null);
                    setShowTxModal(true);
                  }}
                  onEditTransactionClick={(tx) => {
                    setEditingTx(tx);
                    setShowTxModal(true);
                  }}
                  onDeleteTransaction={deleteTransaction}
                  isEditingGroups={isEditingGroups}
                  setIsEditingGroups={setIsEditingGroups}
                  getCategoryEmoji={getCategoryEmoji}
                  getGroupName={getGroupName}
                  getGroupKey={getGroupKey}
                  formatGroupHeader={formatGroupHeader}
                  getGroupTotals={getGroupTotals}
                  groupSettingsPanel={
                    <GroupSettingsModal
                      isOpen={isEditingGroups}
                      onClose={() => setIsEditingGroups(false)}
                      accountGroups={accountGroups}
                      onSaveGroups={saveAccountGroups}
                      onDeleteGroup={deleteAccountGroup}
                      onAddGroup={addAccountGroup}
                      onAddCategory={addCategory}
                      onDeleteCategory={deleteCategory}
                      onUpdateGroupBudget={handleUpdateGroupBudget}
                    />
                  }
                />
              )}

              {activeTab === 'history' && (
                <HistoryTab
                  accountGroups={accountGroups}
                  transactions={transactions}
                  onDeleteTransaction={deleteTransaction}
                  getCategoryEmoji={getCategoryEmoji}
                  getGroupName={getGroupName}
                />
              )}

              {activeTab === 'stats' && (
                <StatsTab
                  accountGroups={accountGroups}
                  transactions={transactions}
                  getCategoryEmoji={getCategoryEmoji}
                />
              )}
            </main>
          </div>
        </IonContent>

        {/* Bottom Tab Bar Navigation */}
        <nav
          className="bottom-nav"
          style={{
            width: 'calc(100% - 32px)',
            maxWidth: '448px',
            background: 'rgba(15, 15, 20, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 6px',
            boxShadow: '0 8px 30px rgba(0, 0, 0, 0.5)',
            zIndex: 1000,
            position: 'fixed',
            bottom: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          <button
            onClick={() => setActiveTab('dashboard')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              color: activeTab === 'dashboard' ? 'var(--primary-color)' : 'var(--text-tertiary)',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>🏠</span>
            <span>總覽</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              color: activeTab === 'history' ? 'var(--primary-color)' : 'var(--text-tertiary)',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📖</span>
            <span>明細</span>
          </button>

          <button
            onClick={() => setActiveTab('stats')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              color: activeTab === 'stats' ? 'var(--primary-color)' : 'var(--text-tertiary)',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <span style={{ fontSize: '1.2rem' }}>📊</span>
            <span>分析</span>
          </button>
        </nav>

        {/* TRANSACTION MODAL (Add/Edit) */}
        <TransactionModal
          isOpen={showTxModal}
          onClose={() => {
            setShowTxModal(false);
            setEditingTx(null);
          }}
          editingTx={editingTx}
          accountGroups={accountGroups}
          onSave={handleSaveTransaction}
        />
      </IonPage>
    </IonApp>
  );
}

export default App;
