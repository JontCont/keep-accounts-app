import React, { useState, useEffect } from 'react';

interface AccountGroup {
  id: string;
  name: string;
  emoji: string;
}

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountGroupId: string; // Associated account group
}

const CATEGORIES = {
  expense: [
    { name: '餐飲食品', emoji: '🍔', color: '#f59e0b' },
    { name: '交通出行', emoji: '🚗', color: '#3b82f6' },
    { name: '休閒娛樂', emoji: '🎬', color: '#ec4899' },
    { name: '購物消費', emoji: '🛍️', color: '#10b981' },
    { name: '居住房租', emoji: '🏠', color: '#8b5cf6' },
    { name: '日常雜項', emoji: '🏷️', color: '#6b7280' }
  ],
  income: [
    { name: '薪資收入', emoji: '💰', color: '#10b981' },
    { name: '投資理財', emoji: '📈', color: '#3b82f6' },
    { name: '獎金紅包', emoji: '🎁', color: '#ef4444' },
    { name: '其他收入', emoji: '🏷️', color: '#6b7280' }
  ]
};

const DEFAULT_ACCOUNT_GROUPS: AccountGroup[] = [
  { id: '1', name: '主資金', emoji: '💳' },
  { id: '2', name: '投資資金', emoji: '📈' },
  { id: '3', name: '存款資金', emoji: '🐷' }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: '午餐牛肉麵', amount: 150, type: 'expense', category: '餐飲食品', date: new Date().toISOString().split('T')[0], accountGroupId: '1' },
  { id: '2', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: new Date().toISOString().split('T')[0], accountGroupId: '1' },
  { id: '3', description: '悠遊卡加值', amount: 200, type: 'expense', category: '交通出行', date: new Date().toISOString().split('T')[0], accountGroupId: '1' },
  { id: '4', description: '購買美股 ETF', amount: 5000, type: 'expense', category: '投資理財', date: new Date().toISOString().split('T')[0], accountGroupId: '2' },
  { id: '5', description: '定期存款存入', amount: 10000, type: 'income', category: '其他收入', date: new Date().toISOString().split('T')[0], accountGroupId: '3' }
];

const ACCOUNT_EMOJIS = ['💳', '📈', '🐷', '💰', '💼', '🏠', '🚗', '✈️', '🎁', '🛒'];

export function App() {
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>(() => {
    const saved = localStorage.getItem('keep_accounts_groups');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return DEFAULT_ACCOUNT_GROUPS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('keep_accounts_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_TRANSACTIONS;
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'add' | 'stats'>('dashboard');
  const [isEditingGroups, setIsEditingGroups] = useState(false);

  // Form State for Transactions
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('餐飲食品');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountGroupId, setAccountGroupId] = useState('1');

  // Form State for Adding Account Group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('💳');

  // History Filter
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');

  useEffect(() => {
    localStorage.setItem('keep_accounts_groups', JSON.stringify(accountGroups));
  }, [accountGroups]);

  useEffect(() => {
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Ensure default account selection is valid when groups change
  useEffect(() => {
    if (accountGroups.length > 0 && !accountGroups.some(g => g.id === accountGroupId)) {
      setAccountGroupId(accountGroups[0].id);
    }
  }, [accountGroups, accountGroupId]);

  // Automatically reset category when type changes
  useEffect(() => {
    setCategory(CATEGORIES[type][0].name);
  }, [type]);

  const handleAddTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;

    const newTx: Transaction = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date,
      accountGroupId
    };

    setTransactions([newTx, ...transactions]);
    
    // Reset Form
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    
    // Redirect to Dashboard
    setActiveTab('dashboard');
  };

  const handleDeleteTransaction = (id: string) => {
    if (confirm('確定要刪除此筆記帳嗎？')) {
      setTransactions(transactions.filter(tx => tx.id !== id));
    }
  };

  // Manage Account Groups
  const handleAddAccountGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;

    const newGroup: AccountGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      emoji: newGroupEmoji
    };

    setAccountGroups([...accountGroups, newGroup]);
    setNewGroupName('');
  };

  const handleDeleteAccountGroup = (groupId: string) => {
    if (accountGroups.length <= 1) {
      alert('必須保留至少一個資金帳戶！');
      return;
    }

    if (confirm('確定要刪除此資金帳戶嗎？\n該帳戶下的所有交易明細將會被自動重新歸類到第一個剩餘帳戶中。')) {
      const remainingGroups = accountGroups.filter(g => g.id !== groupId);
      const targetGroupId = remainingGroups[0].id;

      // Re-link transactions to the first remaining group
      const updatedTxs = transactions.map(tx => {
        if (tx.accountGroupId === groupId) {
          return { ...tx, accountGroupId: targetGroupId };
        }
        return tx;
      });

      setTransactions(updatedTxs);
      setAccountGroups(remainingGroups);
    }
  };

  // Calculations
  const totalIncome = transactions
    .filter(tx => tx.type === 'income')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  // Group Balances
  const getGroupBalance = (groupId: string) => {
    const groupTxs = transactions.filter(tx => tx.accountGroupId === groupId);
    const income = groupTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = groupTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return income - expense;
  };

  // Category stats for Expense
  const expenseByCategory = transactions
    .filter(tx => tx.type === 'expense')
    .reduce((acc: { [key: string]: number }, tx) => {
      acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
      return acc;
    }, {});

  const getCategoryEmoji = (catName: string) => {
    const list = [...CATEGORIES.expense, ...CATEGORIES.income];
    const match = list.find(item => item.name === catName);
    return match ? match.emoji : '🏷️';
  };

  const getGroupName = (groupId: string) => {
    const match = accountGroups.find(g => g.id === groupId);
    return match ? `${match.emoji} ${match.name}` : '⚙️ 未知帳戶';
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, background: 'linear-gradient(90deg, #6366f1, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Keep Accounts
          </h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>精緻微型記帳系統</p>
        </div>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-tertiary)', textAlign: 'right' }}>
          <div>{new Date().toLocaleDateString('zh-TW', { weekday: 'long' })}</div>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>{new Date().toLocaleDateString('zh-TW')}</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Balance Card */}
            <div className="glass-card" style={{ 
              background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.1) 100%)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>目前總餘額</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0', color: totalBalance >= 0 ? '#fff' : 'var(--expense-color)' }}>
                ${totalBalance.toLocaleString('zh-TW')}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>總收入</div>
                  <div style={{ color: 'var(--income-color)', fontWeight: 600, fontSize: '1.1rem' }}>+${totalIncome.toLocaleString('zh-TW')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>總支出</div>
                  <div style={{ color: 'var(--expense-color)', fontWeight: 600, fontSize: '1.1rem' }}>-${totalExpense.toLocaleString('zh-TW')}</div>
                </div>
              </div>
            </div>

            {/* Account Groups List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>資金大項帳戶</h3>
                <button 
                  onClick={() => setIsEditingGroups(!isEditingGroups)} 
                  style={{ background: 'transparent', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 500 }}
                >
                  {isEditingGroups ? '完成編輯' : '⚙️ 編輯帳戶'}
                </button>
              </div>

              {/* Accounts scroll container */}
              <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                {accountGroups.map(group => {
                  const bal = getGroupBalance(group.id);
                  return (
                    <div 
                      key={group.id} 
                      className="glass-card" 
                      style={{ 
                        flexShrink: 0, 
                        width: '140px', 
                        padding: '16px', 
                        borderRadius: 'var(--border-radius-md)', 
                        background: 'rgba(255, 255, 255, 0.03)',
                        position: 'relative'
                      }}
                    >
                      <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', gap: '6px', alignItems: 'center' }}>
                        <span>{group.emoji}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{group.name}</span>
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '12px', color: bal >= 0 ? '#fff' : 'var(--expense-color)' }}>
                        ${bal.toLocaleString('zh-TW')}
                      </div>
                      
                      {isEditingGroups && (
                        <button 
                          onClick={() => handleDeleteAccountGroup(group.id)}
                          style={{
                            position: 'absolute',
                            top: '4px',
                            right: '4px',
                            background: '#f43f5e',
                            color: '#fff',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem'
                          }}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Inline Account group editor panel */}
              {isEditingGroups && (
                <div className="glass-card fade-in" style={{ padding: '16px', marginTop: '12px', borderStyle: 'dashed' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>新增資金大項</h4>
                  <form onSubmit={handleAddAccountGroup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select 
                        value={newGroupEmoji} 
                        onChange={(e) => setNewGroupEmoji(e.target.value)}
                        style={{ width: '70px', padding: '8px' }}
                      >
                        {ACCOUNT_EMOJIS.map(e => <option key={e} value={e}>{e}</option>)}
                      </select>
                      <input 
                        type="text" 
                        placeholder="帳戶大項名稱" 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        style={{ flex: 1, padding: '8px' }}
                        required
                      />
                    </div>
                    <button 
                      type="submit"
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.9rem',
                        fontWeight: 600
                      }}
                    >
                      確認加入
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <button 
              onClick={() => setActiveTab('add')}
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
                gap: '8px'
              }}
            >
              <span>＋</span> 新增記帳明細
            </button>

            {/* Recent Transactions */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>最近明細</h3>
                <button onClick={() => setActiveTab('history')} style={{ background: 'transparent', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 500 }}>查看全部</button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {transactions.slice(0, 4).map(tx => (
                  <div key={tx.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--border-radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        fontSize: '1.4rem', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {getCategoryEmoji(tx.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{tx.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {tx.category} • {getGroupName(tx.accountGroupId)} • {tx.date}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount}
                      </span>
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '0.9rem', padding: '4px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
                {transactions.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                    尚無交易紀錄，點擊上方按鈕開始記帳吧！
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: HISTORY */}
        {activeTab === 'history' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>歷史交易明細</h3>
            
            {/* Filter Group Selector */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>帳戶：</span>
              <select 
                value={filterGroup} 
                onChange={(e) => setFilterGroup(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: 'var(--border-radius-sm)' }}
              >
                <option value="all">顯示全部帳戶</option>
                {accountGroups.map(g => (
                  <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>
                ))}
              </select>
            </div>

            {/* Filter buttons for type */}
            <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
              {(['all', 'income', 'expense'] as const).map(t => (
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
                    color: filter === t ? '#fff' : 'var(--text-secondary)'
                  }}
                >
                  {t === 'all' ? '全部' : t === 'income' ? '收入' : '支出'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {transactions
                .filter(tx => filter === 'all' || tx.type === filter)
                .filter(tx => filterGroup === 'all' || tx.accountGroupId === filterGroup)
                .map(tx => (
                  <div key={tx.id} className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--border-radius-md)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ 
                        fontSize: '1.4rem', 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center' 
                      }}>
                        {getCategoryEmoji(tx.category)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.95rem' }}>{tx.description}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                          {tx.category} • {getGroupName(tx.accountGroupId)} • {tx.date}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ 
                        fontWeight: 600, 
                        color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' 
                      }}>
                        {tx.type === 'income' ? '+' : '-'}${tx.amount}
                      </span>
                      <button 
                        onClick={() => handleDeleteTransaction(tx.id)}
                        style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '0.9rem', padding: '4px' }}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              {transactions
                .filter(tx => filter === 'all' || tx.type === filter)
                .filter(tx => filterGroup === 'all' || tx.accountGroupId === filterGroup).length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                  沒有找到符合條件的明細
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ADD TRANSACTION */}
        {activeTab === 'add' && (
          <div className="fade-in glass-card">
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '20px' }}>新增收支記帳</h3>
            
            <form onSubmit={handleAddTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Type Switcher */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>交易類型</label>
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--border-radius-md)' }}>
                  <button
                    type="button"
                    onClick={() => setType('expense')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 600,
                      background: type === 'expense' ? 'var(--expense-color)' : 'transparent',
                      color: type === 'expense' ? '#fff' : 'var(--text-secondary)',
                      boxShadow: type === 'expense' ? '0 4px 10px var(--expense-glow)' : 'none'
                    }}
                  >
                    支出 💸
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('income')}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontWeight: 600,
                      background: type === 'income' ? 'var(--income-color)' : 'transparent',
                      color: type === 'income' ? '#fff' : 'var(--text-secondary)',
                      boxShadow: type === 'income' ? '0 4px 10px var(--income-glow)' : 'none'
                    }}
                  >
                    收入 💰
                  </button>
                </div>
              </div>

              {/* Account Group selection */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>選擇資金帳戶大項</label>
                <select value={accountGroupId} onChange={(e) => setAccountGroupId(e.target.value)}>
                  {accountGroups.map(group => (
                    <option key={group.id} value={group.id}>
                      {group.emoji} {group.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>金額 ($)</label>
                <input 
                  type="number" 
                  pattern="[0-9]*"
                  inputMode="decimal"
                  placeholder="輸入金額" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  required 
                />
              </div>

              {/* Description */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>交易說明</label>
                <input 
                  type="text" 
                  placeholder="例如: 買咖啡、午餐、薪水" 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                />
              </div>

              {/* Category */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>選擇分類</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {CATEGORIES[type].map(cat => (
                    <option key={cat.name} value={cat.name}>
                      {cat.emoji} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date */}
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>交易日期</label>
                <input 
                  type="date" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)} 
                  required 
                />
              </div>

              {/* Submit Buttons */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  style={{
                    flex: 1,
                    padding: '14px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    fontWeight: 600
                  }}
                >
                  取消
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 2,
                    padding: '14px',
                    borderRadius: 'var(--border-radius-md)',
                    background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                    color: '#fff',
                    fontWeight: 600,
                    boxShadow: '0 4px 15px var(--primary-glow)'
                  }}
                >
                  確認儲存
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 4: STATS */}
        {activeTab === 'stats' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>支出統計分析</h3>
            
            {/* Overview stats */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', padding: '16px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>總記帳筆數</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{transactions.length} 筆</div>
              </div>
              <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}></div>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>平均支出 / 筆</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--expense-color)' }}>
                  ${transactions.filter(t => t.type === 'expense').length > 0
                    ? Math.round(totalExpense / transactions.filter(t => t.type === 'expense').length).toLocaleString('zh-TW')
                    : 0}
                </div>
              </div>
            </div>

            {/* Category Bars */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>各類別支出佔比</h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {CATEGORIES.expense.map(cat => {
                  const amt = expenseByCategory[cat.name] || 0;
                  const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
                  return (
                    <div key={cat.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{cat.emoji}</span>
                          <span style={{ fontWeight: 500 }}>{cat.name}</span>
                        </span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          ${amt.toLocaleString('zh-TW')} ({pct}%)
                        </span>
                      </div>
                      
                      {/* Progress Track */}
                      <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ 
                          width: `${pct}%`, 
                          height: '100%', 
                          background: `linear-gradient(90deg, ${cat.color}, #f43f5e)`, 
                          borderRadius: '4px',
                          transition: 'width 0.8s ease-out'
                        }}></div>
                      </div>
                    </div>
                  );
                })}
                {totalExpense === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                    目前尚無支出資料可進行統計分析
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Bottom Tab Bar Navigation */}
      <nav style={{
        position: 'fixed',
        bottom: '16px',
        left: '50%',
        transform: 'translateX(-50%)',
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
        zIndex: 1000
      }}>
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
            gap: '4px'
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
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📖</span>
          <span>明細</span>
        </button>
        <button 
          onClick={() => setActiveTab('add')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            background: 'transparent',
            color: activeTab === 'add' ? 'var(--primary-color)' : 'var(--text-tertiary)',
            padding: '6px 12px',
            fontSize: '0.75rem',
            fontWeight: 500,
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>＋</span>
          <span>記帳</span>
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
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📊</span>
          <span>分析</span>
        </button>
      </nav>
    </div>
  );
}

export default App;


