import React, { useState, useEffect, useRef } from 'react';
import { IonApp, IonContent, IonPage } from '@ionic/react';
import { Transaction, AccountGroup } from '@keep-accounts-app/domain';
import { useKeepAccounts } from '@keep-accounts-app/state';
import { DashboardTab } from './components/DashboardTab';
import { HistoryTab } from './components/HistoryTab';
import { StatsTab } from './components/StatsTab';
import { TransactionModal } from './components/TransactionModal';
import { GroupSettingsModal } from './components/GroupSettingsModal';
import { AppIcon } from './components/AppIcon';
import {
  isNativePlatform,
  getImportHistory,
  logImport,
  exportBackupNative,
  autoBackupNative,
  restoreFromAutoBackupNative,
  hasAutoBackupNativeFile,
  compressBackup,
  decompressBackup
} from './services/backup';

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
    setAccountGroups,
    setTransactions
  } = useKeepAccounts();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats' | 'settings'>('dashboard');
  const [isEditingGroups, setIsEditingGroups] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [showTxModal, setShowTxModal] = useState(false);

  // FAB scroll behavior state
  const [showFab, setShowFab] = useState(true);
  const lastScrollY = useRef(0);

  const handleScroll = (e: CustomEvent<any>) => {
    const currentScrollY = e.detail.scrollTop;
    if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
      setShowFab(false);
    } else if (currentScrollY < lastScrollY.current) {
      setShowFab(true);
    }
    lastScrollY.current = currentScrollY;
  };

  useEffect(() => {
    setShowFab(true);
    lastScrollY.current = 0;
  }, [activeTab]);

  // Theme state and runtime application
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(() => {
    return (localStorage.getItem('keep_accounts_theme') as any) || 'system';
  });

  useEffect(() => {
    const root = document.documentElement;
    
    const applyTheme = (t: 'system' | 'light' | 'dark') => {
      root.removeAttribute('data-theme');
      if (t === 'light') {
        root.setAttribute('data-theme', 'light');
      } else if (t === 'dark') {
        root.setAttribute('data-theme', 'dark');
      } else {
        // system
        const systemPrefersDark = window.matchMedia 
          ? window.matchMedia('(prefers-color-scheme: dark)').matches 
          : false;
        root.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');
      }
    };

    applyTheme(theme);
    localStorage.setItem('keep_accounts_theme', theme);

    if (theme === 'system' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e: MediaQueryListEvent) => {
        root.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [theme]);

  // Settings & Backup States
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(() => {
    return localStorage.getItem('keep_accounts_auto_backup') === 'true';
  });
  const [importHistory, setImportHistory] = useState(() => getImportHistory());
  const [hasNativeAutoBackup, setHasNativeAutoBackup] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isNative = isNativePlatform();

  // Check if native auto-backup file exists
  useEffect(() => {
    if (isNative) {
      hasAutoBackupNativeFile().then(exists => setHasNativeAutoBackup(exists));
    }
  }, [isNative, accountGroups, transactions]);

  const handleToggleAutoBackup = (enabled: boolean) => {
    setAutoBackupEnabled(enabled);
    localStorage.setItem('keep_accounts_auto_backup', enabled ? 'true' : 'false');
    if (enabled) {
      autoBackupNative({
        keep_accounts_groups: accountGroups,
        keep_accounts_transactions: transactions
      }).catch(err => {
        console.error('Initial auto-backup failed', err);
      });
    }
  };

  const handleExportBackup = async () => {
    try {
      const data = {
        keep_accounts_groups: accountGroups,
        keep_accounts_transactions: transactions
      };
      
      if (isNative) {
        await exportBackupNative(data);
      } else {
        const zipped = compressBackup(data);
        const blob = new Blob([zipped], { type: 'application/zip' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
        a.href = url;
        a.download = `backup_${dateStr}.zip`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (err: any) {
      alert('匯出備份失敗：' + err.message);
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('無法讀取檔案內容');
        }
        
        const zipBytes = new Uint8Array(arrayBuffer);
        const decompressed = decompressBackup(zipBytes);
        
        if (!Array.isArray(decompressed.keep_accounts_groups) || !Array.isArray(decompressed.keep_accounts_transactions)) {
          throw new Error('備份檔案格式不正確');
        }
        
        setAccountGroups(decompressed.keep_accounts_groups);
        setTransactions(decompressed.keep_accounts_transactions);
        
        const groupsCount = decompressed.keep_accounts_groups.length;
        const transactionsCount = decompressed.keep_accounts_transactions.length;
        
        alert(`成功匯入 ${groupsCount} 個帳戶群組與 ${transactionsCount} 筆交易明細！頁面即將重新整理。`);
        
        logImport(file.name, file.size, groupsCount, transactionsCount, 'success');
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      } catch (err: any) {
        const errorMsg = err.message || '未知錯誤';
        alert('匯入失敗：' + errorMsg);
        
        logImport(file.name, file.size, 0, 0, 'failed', errorMsg);
        setImportHistory(getImportHistory());
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  const handleRestoreFromAutoBackup = async () => {
    if (!window.confirm('確定要從本機自動備份檔還原嗎？這將覆蓋您目前的所有資料！')) {
      return;
    }
    
    try {
      const decompressed = await restoreFromAutoBackupNative();
      
      setAccountGroups(decompressed.keep_accounts_groups);
      setTransactions(decompressed.keep_accounts_transactions);
      
      const groupsCount = decompressed.keep_accounts_groups.length;
      const transactionsCount = decompressed.keep_accounts_transactions.length;
      
      alert(`成功還原 ${groupsCount} 個帳戶群組與 ${transactionsCount} 筆交易！`);
      
      logImport('keep_accounts_backup.zip', 0, groupsCount, transactionsCount, 'success');
      
      setTimeout(() => {
        window.location.reload();
      }, 500);
    } catch (err: any) {
      const errorMsg = err.message || '未知錯誤';
      alert('自動備份檔還原失敗：' + errorMsg);
      
      logImport('keep_accounts_backup.zip', 0, 0, 0, 'failed', errorMsg);
      setImportHistory(getImportHistory());
    }
  };

  // Automatic backup trigger on change
  useEffect(() => {
    const isAutoBackupEnabled = localStorage.getItem('keep_accounts_auto_backup') === 'true';
    if (isAutoBackupEnabled && isNativePlatform()) {
      autoBackupNative({
        keep_accounts_groups: accountGroups,
        keep_accounts_transactions: transactions
      }).catch(err => {
        console.error('Auto backup failed', err);
      });
    }
  }, [accountGroups, transactions]);

  // Group Settings internal budget update callback
  const handleUpdateGroupBudget = (groupId: string, budget: number | undefined) => {
    // Left for potential state extension, handled by saveAccountGroups at hook level
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
        <IonContent fullscreen scrollEvents={true} onIonScroll={handleScroll}>
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
                    fontSize: activeTab === 'dashboard' ? '1.6rem' : '1.3rem',
                    fontWeight: 700,
                    background: 'linear-gradient(90deg, #6366f1, #a855f7)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    margin: 0,
                    transition: 'font-size 0.2s ease',
                  }}
                >
                  {activeTab === 'dashboard' && 'Keep Accounts'}
                  {activeTab === 'history' && '歷史交易明細'}
                  {activeTab === 'stats' && '支出統計分析'}
                  {activeTab === 'settings' && '系統設定'}
                </h1>
                {activeTab === 'dashboard' && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0 }}>
                    精緻微型記帳系統
                  </p>
                )}
              </div>
              {activeTab === 'dashboard' && (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
                  <div>{new Date().toLocaleDateString('zh-TW', { weekday: 'long' })}</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {new Date().toLocaleDateString('zh-TW')}
                  </div>
                </div>
              )}
              {activeTab === 'history' && (
                <button
                  onClick={() => setShowTxModal(true)}
                  style={{
                    background: 'var(--input-bg)',
                    border: '1px solid var(--input-border)',
                    borderRadius: '50%',
                    width: '36px',
                    height: '36px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--primary-color)',
                    cursor: 'pointer',
                    boxShadow: 'var(--nav-shadow)',
                  }}
                  title="新增記帳"
                >
                  <AppIcon name="plus" size={18} />
                </button>
              )}
            </header>

            {/* Main Content Area */}
            <main style={{ flex: 1, paddingBottom: '120px' }}>
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
                  onEditTransaction={(tx) => {
                    setEditingTx(tx);
                    setShowTxModal(true);
                  }}
                  onAddTransaction={() => {
                    setEditingTx(null);
                    setShowTxModal(true);
                  }}
                  showFab={showFab}
                />
              )}

              {activeTab === 'stats' && (
                <StatsTab
                  accountGroups={accountGroups}
                  transactions={transactions}
                  getCategoryEmoji={getCategoryEmoji}
                />
              )}

              {/* TAB 4: SETTINGS (BACKUP & RESTORE) */}
              {activeTab === 'settings' && (
                <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div className="glass-card" style={{ padding: '20px' }}>
                    
                    {/* Theme selector option */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>介面主題設定</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>設定應用程式主題顏色</div>
                      </div>
                      <select
                        value={theme}
                        onChange={(e) => setTheme(e.target.value as any)}
                        style={{
                          width: 'auto',
                          minWidth: '120px',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--input-bg)',
                          border: '1px solid var(--input-border)',
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                        }}
                      >
                        <option value="system" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>跟隨系統</option>
                        <option value="light" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>淺色模式</option>
                        <option value="dark" style={{ background: 'var(--bg-color)', color: 'var(--text-primary)' }}>深色模式</option>
                      </select>
                    </div>

                    {/* Native automatic backup toggle */}
                    {isNative && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid var(--card-border)', marginBottom: '16px' }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 500 }}>自動背景備份</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>每次記帳時自動備份至系統 Documents 目錄</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={autoBackupEnabled}
                          onChange={(e) => handleToggleAutoBackup(e.target.checked)}
                          style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                        />
                      </div>
                    )}
                    
                    {/* Manual Backup and Restore buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <button
                        onClick={handleExportBackup}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '8px',
                          backgroundColor: 'var(--primary-color)',
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <AppIcon name="upload" size={18} /> 匯出資料備份 (.zip)
                      </button>
                      
                      <div style={{ position: 'relative' }}>
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--input-bg)',
                            color: 'var(--text-primary)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            border: '1px solid var(--input-border)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <AppIcon name="download" size={18} /> 匯入資料還原 (.zip)
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleImportBackup}
                          accept=".zip"
                          style={{ display: 'none' }}
                        />
                      </div>

                      {isNative && hasNativeAutoBackup && (
                        <button
                          onClick={handleRestoreFromAutoBackup}
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--income-bg)',
                            color: 'var(--income-color)',
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            border: '1px solid rgba(16, 185, 129, 0.2)',
                            cursor: 'pointer',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <AppIcon name="refresh" size={18} /> 從本機自動備份檔還原
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Import history logs */}
                  <div className="glass-card" style={{ padding: '20px' }}>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>
                      <AppIcon name="book-open" size={18} style={{ marginRight: '6px' }} /> 歷史匯入紀錄
                    </h3>
                    {importHistory.length === 0 ? (
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'center', padding: '16px 0' }}>
                        尚無匯入紀錄
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '300px', overflowY: 'auto' }}>
                        {importHistory.map((record) => (
                          <div
                            key={record.id}
                            style={{
                              padding: '10px',
                              borderRadius: '6px',
                              background: 'var(--sub-card-bg)',
                              border: '1px solid var(--sub-card-border)',
                              fontSize: '0.8rem',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '4px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', wordBreak: 'break-all' }}>{record.fileName}</span>
                              <span
                                style={{
                                  padding: '2px 6px',
                                  borderRadius: '4px',
                                  fontSize: '0.7rem',
                                  fontWeight: 600,
                                  backgroundColor: record.status === 'success' ? 'var(--income-bg)' : 'var(--expense-bg)',
                                  color: record.status === 'success' ? 'var(--income-color)' : 'var(--expense-color)'
                                }}
                              >
                                {record.status === 'success' ? '成功' : '失敗'}
                              </span>
                            </div>
                            <div style={{ color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
                              <span>時間: {new Date(record.timestamp).toLocaleString('zh-TW')}</span>
                              <span>大小: {(record.fileSize / 1024).toFixed(1)} KB</span>
                            </div>
                            {record.status === 'success' ? (
                              <div style={{ color: 'var(--text-tertiary)' }}>
                                匯入群組: {record.groupsCount} | 匯入交易: {record.transactionsCount}
                              </div>
                            ) : (
                              <div style={{ color: 'var(--expense-color)', fontStyle: 'italic' }}>
                                錯誤: {record.errorMessage}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
            background: 'var(--nav-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid var(--nav-border)',
            borderRadius: '24px',
            display: 'flex',
            justifyContent: 'space-around',
            padding: '8px 6px',
            boxShadow: 'var(--nav-shadow)',
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
            <AppIcon name="home" size={20} />
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
            <AppIcon name="book-open" size={20} />
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
            <AppIcon name="bar-chart" size={20} />
            <span>分析</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: 'transparent',
              color: activeTab === 'settings' ? 'var(--primary-color)' : 'var(--text-tertiary)',
              padding: '6px 12px',
              fontSize: '0.75rem',
              fontWeight: 500,
              gap: '4px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <AppIcon name="settings" size={20} />
            <span>設定</span>
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
