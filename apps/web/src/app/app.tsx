import React, { useState, useEffect, useRef } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { IonSelect, IonSelectOption } from '@ionic/react';
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

export interface Category {
  name: string;
  emoji: string;
  color: string;
  type: 'income' | 'expense';
}

export interface AccountGroup {
  id: string;
  name: string;
  emoji: string;
  color: string;
  categories: Category[];
  description?: string;
  budget?: number;
  targetRatio?: number;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountGroupId: string; // Associated account group
}

const ACCOUNT_EMOJIS = ['💳', '📈', '🐷', '💰', '💼', '🏠', '🚗', '✈️', '🎁', '🛒'];

const ACCOUNT_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Teal
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#6b7280'  // Gray
];

const getDefaultCategoriesForNewGroup = (): Category[] => [
  { name: '日常餐飲', emoji: '🍔', color: '#f59e0b', type: 'expense' },
  { name: '生活交通', emoji: '🚗', color: '#3b82f6', type: 'expense' },
  { name: '購物消費', emoji: '🛍️', color: '#10b981', type: 'expense' },
  { name: '日常雜項', emoji: '🏷️', color: '#6b7280', type: 'expense' },
  { name: '主動收入', emoji: '💰', color: '#10b981', type: 'income' },
  { name: '其他收入', emoji: '🏷️', color: '#6b7280', type: 'income' }
];

const DEFAULT_ACCOUNT_GROUPS: AccountGroup[] = [
  {
    id: '1',
    name: '日常開銷',
    emoji: '💳',
    color: '#6366f1',
    description: '日常開銷：支付房租、水電、餐費與交通。',
    targetRatio: 30,
    categories: [
      { name: '餐飲食品', emoji: '🍔', color: '#f59e0b', type: 'expense' },
      { name: '交通出行', emoji: '🚗', color: '#3b82f6', type: 'expense' },
      { name: '休閒娛樂', emoji: '🎬', color: '#ec4899', type: 'expense' },
      { name: '購物消費', emoji: '🛍️', color: '#10b981', type: 'expense' },
      { name: '居住房租', emoji: '🏠', color: '#8b5cf6', type: 'expense' },
      { name: '水電雜費', emoji: '⚡', color: '#a855f7', type: 'expense' },
      { name: '日常雜項', emoji: '🏷️', color: '#6b7280', type: 'expense' },
      { name: '薪資收入', emoji: '💰', color: '#10b981', type: 'income' },
      { name: '獎金紅包', emoji: '🎁', color: '#ef4444', type: 'income' },
      { name: '其他收入', emoji: '🏷️', color: '#6b7280', type: 'income' }
    ]
  },
  {
    id: '2',
    name: '投資理財',
    emoji: '📈',
    color: '#3b82f6',
    description: '投資理財：投入股市、基金等，用於創造被動收入與資產增值。',
    targetRatio: 30,
    categories: [
      { name: '股市投資', emoji: '📉', color: '#3b82f6', type: 'expense' },
      { name: '基金認購', emoji: '🏦', color: '#8b5cf6', type: 'expense' },
      { name: '投資理財', emoji: '📈', color: '#3b82f6', type: 'expense' },
      { name: '其他投資', emoji: '🏷️', color: '#6b7280', type: 'expense' },
      { name: '投資收益', emoji: '📈', color: '#10b981', type: 'income' },
      { name: '股利發放', emoji: '💵', color: '#f59e0b', type: 'income' },
      { name: '其他投資收入', emoji: '🏷️', color: '#6b7280', type: 'income' }
    ]
  },
  {
    id: '3',
    name: '長期儲蓄',
    emoji: '🐷',
    color: '#10b981',
    description: '長期儲蓄：存入銀行或作為緊急預備金，確保財務安全。',
    targetRatio: 40,
    categories: [
      { name: '定存儲蓄', emoji: '🏦', color: '#8b5cf6', type: 'expense' },
      { name: '緊急備用', emoji: '🛡️', color: '#ef4444', type: 'expense' },
      { name: '其他儲蓄', emoji: '🏷️', color: '#6b7280', type: 'expense' },
      { name: '定存利息', emoji: '💰', color: '#10b981', type: 'income' },
      { name: '其他存款收入', emoji: '🏷️', color: '#6b7280', type: 'income' },
      { name: '其他收入', emoji: '🏷️', color: '#6b7280', type: 'income' }
    ]
  }
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: '午餐牛肉麵', amount: 150, type: 'expense', category: '餐飲食品', date: new Date().toISOString().split('T')[0], accountGroupId: '1' },
  { id: '2', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: new Date().toISOString().split('T')[0], accountGroupId: '1' },
  { id: '3', description: '悠遊卡加值', amount: 200, type: 'expense', category: '交通出行', date: new Date().toISOString().split('T')[0], accountGroupId: '1' },
  { id: '4', description: '購買美股 ETF', amount: 5000, type: 'expense', category: '投資理財', date: new Date().toISOString().split('T')[0], accountGroupId: '2' },
  { id: '5', description: '定期存款存入', amount: 10000, type: 'income', category: '其他收入', date: new Date().toISOString().split('T')[0], accountGroupId: '3' }
];

export const getCurrentMonthExpenseForGroup = (groupId: string, txs: Transaction[], referenceDate?: Date) => {
  const ref = referenceDate || new Date();
  const year = ref.getFullYear();
  const month = String(ref.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}-${month}`; // "YYYY-MM"
  return txs
    .filter(tx => tx.accountGroupId === groupId && tx.type === 'expense' && tx.date.startsWith(yearMonth))
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export function App() {
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>(() => {
    const saved = localStorage.getItem('keep_accounts_groups');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        let migrated = parsed.map((g: any, index: number) => {
          let name = g.name;
          let description = g.description;
          let categories = g.categories;
          
          if (g.id === '1' && (g.name === '主資金' || !g.name)) {
            name = '日常開銷';
            description = '日常開銷：支付房租、水電、餐費與交通。';
            if (!g.categories) {
              categories = DEFAULT_ACCOUNT_GROUPS[0].categories;
            }
          } else if (g.id === '2' && (g.name === '投資資金' || !g.name)) {
            name = '投資理財';
            description = '投資理財：投入股市、基金等，用於創造被動收入與資產增值。';
            if (!g.categories) {
              categories = DEFAULT_ACCOUNT_GROUPS[1].categories;
            }
          } else if (g.id === '3' && (g.name === '存款資金' || !g.name)) {
            name = '長期儲蓄';
            description = '長期儲蓄：存入銀行或作為緊急預備金，確保財務安全。';
            if (!g.categories) {
              categories = DEFAULT_ACCOUNT_GROUPS[2].categories;
            }
          }

          const defaultGroup = DEFAULT_ACCOUNT_GROUPS.find(dg => dg.id === g.id);
          const ratio = typeof g.targetRatio === 'number' && !isNaN(g.targetRatio) ? g.targetRatio : (defaultGroup?.targetRatio ?? 0);
          return {
            id: g.id,
            name: name,
            emoji: g.emoji,
            color: g.color || defaultGroup?.color || ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
            description: description || defaultGroup?.description,
            categories: categories || defaultGroup?.categories || getDefaultCategoriesForNewGroup(),
            targetRatio: ratio,
            budget: g.budget
          };
        });

        // Validate sum equals 100%
        const sum = migrated.reduce((s: number, g: any) => s + g.targetRatio, 0);
        if (sum !== 100) {
          if (migrated.length === 3 && migrated.some((g: any) => g.id === '1') && migrated.some((g: any) => g.id === '2') && migrated.some((g: any) => g.id === '3')) {
            migrated = migrated.map((g: any) => {
              let r = 0;
              if (g.id === '1') r = 30;
              else if (g.id === '2') r = 30;
              else if (g.id === '3') r = 40;
              return { ...g, targetRatio: r };
            });
          } else {
            const avg = Math.floor(100 / migrated.length);
            const remainder = 100 % migrated.length;
            migrated = migrated.map((g: any, i: number) => {
              const r = avg + (i < remainder ? 1 : 0);
              return { ...g, targetRatio: r };
            });
          }
        }
        return migrated;
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

  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'stats' | 'settings'>('dashboard');
  const [isEditingGroups, setIsEditingGroups] = useState(false);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editingGroups, setEditingGroups] = useState<AccountGroup[] | null>(null);

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

  const handleStartEditGroups = () => {
    setEditingGroups(JSON.parse(JSON.stringify(accountGroups)));
    setIsEditingGroups(true);
  };

  const handleSaveEditGroups = () => {
    if (!editingGroups) return;
    const sum = editingGroups.reduce((s, g) => s + (g.targetRatio || 0), 0);
    if (sum !== 100) {
      alert('目標比例加總必須為 100%！');
      return;
    }
    setAccountGroups(editingGroups);
    localStorage.setItem('keep_accounts_groups', JSON.stringify(editingGroups));
    setIsEditingGroups(false);
    setEditingGroups(null);
  };

  // Simplified Dashboard & Grouping States
  const [showTxModal, setShowTxModal] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Form State for Transactions
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [accountGroupId, setAccountGroupId] = useState('1');

  // Form State for Adding Account Group
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupEmoji, setNewGroupEmoji] = useState('💳');
  const [newGroupColor, setNewGroupColor] = useState('#6366f1');
  const [newGroupBudget, setNewGroupBudget] = useState('');

  // State for Managing Categories (小項)
  const [catEditType, setCatEditType] = useState<'expense' | 'income'>('expense');
  const [newCatName, setNewCatName] = useState('');
  const [newCatEmoji, setNewCatEmoji] = useState('🏷️');
  const [newCatColor, setNewCatColor] = useState('#f59e0b');

  // History Filter
  const [filter, setFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [filterGroup, setFilterGroup] = useState<string>('all');
  const [statsGroup, setStatsGroup] = useState<string>('all');
  const [statsSubTab, setStatsSubTab] = useState<'category' | 'trend'>('category');
  const [period, setPeriod] = useState<'today' | 'month'>('month');

  // Sync form states with editingTx when modal opens or editingTx changes
  useEffect(() => {
    if (editingTx) {
      setDescription(editingTx.description);
      setAmount(editingTx.amount.toString());
      setType(editingTx.type);
      setAccountGroupId(editingTx.accountGroupId);
      setDate(editingTx.date);
      setCategory(editingTx.category);
    } else {
      setDescription('');
      setAmount('');
      setType('expense');
      setAccountGroupId(accountGroups[0]?.id || '1');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingTx, showTxModal, accountGroups]);

  useEffect(() => {
    localStorage.setItem('keep_accounts_groups', JSON.stringify(accountGroups));
  }, [accountGroups]);

  useEffect(() => {
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(transactions));
  }, [transactions]);

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

  // Ensure default account selection is valid when groups change
  useEffect(() => {
    if (accountGroups.length > 0 && !accountGroups.some(g => g.id === accountGroupId)) {
      setAccountGroupId(accountGroups[0].id);
    }
  }, [accountGroups, accountGroupId]);

  // Dynamically set category when group, type, or groups change
  useEffect(() => {
    const currentGroup = accountGroups.find(g => g.id === accountGroupId);
    if (currentGroup && currentGroup.categories) {
      const filtered = currentGroup.categories.filter(c => c.type === type);
      if (filtered.length > 0) {
        if (!filtered.some(c => c.name === category)) {
          setCategory(filtered[0].name);
        }
      } else {
        setCategory('');
      }
    }
  }, [accountGroupId, type, accountGroups, category]);

  // One-time mounting migration to ensure 333 rules are applied even if local state is cached
  useEffect(() => {
    const hasOldGroups = accountGroups.some(g => 
      (g.id === '1' && g.name === '主資金') || 
      (g.id === '2' && g.name === '投資資金') || 
      (g.id === '3' && g.name === '存款資金')
    );
    if (hasOldGroups) {
      const updated = accountGroups.map(g => {
        if (g.id === '1' && g.name === '主資金') {
          return {
            ...g,
            name: '日常開銷',
            description: '日常開銷：支付房租、水電、餐費與交通。',
            categories: DEFAULT_ACCOUNT_GROUPS[0].categories
          };
        }
        if (g.id === '2' && g.name === '投資資金') {
          return {
            ...g,
            name: '投資理財',
            description: '投資理財：投入股市、基金等，用於創造被動收入與資產增值。',
            categories: DEFAULT_ACCOUNT_GROUPS[1].categories
          };
        }
        if (g.id === '3' && g.name === '存款資金') {
          return {
            ...g,
            name: '長期儲蓄',
            description: '長期儲蓄：存入銀行或作為緊急預備金，確保財務安全。',
            categories: DEFAULT_ACCOUNT_GROUPS[2].categories
          };
        }
        return g;
      });
      setAccountGroups(updated);
    }
  }, []);

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || parseFloat(amount) <= 0) return;

    // Check budget limit threshold
    const targetGroup = accountGroups.find(g => g.id === accountGroupId);
    if (targetGroup && targetGroup.budget && targetGroup.budget > 0 && type === 'expense') {
      let projectedTxs: Transaction[] = [];
      if (editingTx) {
        projectedTxs = transactions.map(tx => {
          if (tx.id === editingTx.id) {
            return {
              ...tx,
              amount: parseFloat(amount),
              type,
              category,
              date,
              accountGroupId
            };
          }
          return tx;
        });
      } else {
        projectedTxs = [
          {
            id: 'temp',
            description: description.trim(),
            amount: parseFloat(amount),
            type,
            category,
            date,
            accountGroupId
          },
          ...transactions
        ];
      }

      const monthlyExpenses = getCurrentMonthExpenseForGroup(accountGroupId, projectedTxs);
      if (monthlyExpenses > targetGroup.budget) {
        const diff = monthlyExpenses - targetGroup.budget;
        alert(`提醒：「${targetGroup.name}」已超出預算！(目前已支出 $${monthlyExpenses.toLocaleString('zh-TW')} / 預算 $${targetGroup.budget.toLocaleString('zh-TW')}，超支 $${diff.toLocaleString('zh-TW')})`);
      }
    }

    if (editingTx) {
      // Edit Mode
      const updatedTxs = transactions.map(tx => {
        if (tx.id === editingTx.id) {
          return {
            ...tx,
            description: description.trim(),
            amount: parseFloat(amount),
            type,
            category,
            date,
            accountGroupId
          };
        }
        return tx;
      });
      setTransactions(updatedTxs);
    } else {
      // Add Mode
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
    }

    // Reset and Close Modal
    setDescription('');
    setAmount('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowTxModal(false);
    setEditingTx(null);
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

    const budgetVal = newGroupBudget.trim() ? Math.max(0, parseInt(newGroupBudget.trim(), 10)) : undefined;

    const newGroup: AccountGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      emoji: newGroupEmoji,
      color: newGroupColor,
      categories: getDefaultCategoriesForNewGroup(),
      budget: budgetVal,
      targetRatio: 0
    };

    const updated = [...accountGroups, newGroup];
    setAccountGroups(updated);
    if (editingGroups) {
      setEditingGroups([...editingGroups, newGroup]);
    }
    setNewGroupName('');
    setNewGroupColor('#6366f1');
    setNewGroupBudget('');
  };

  const handleDeleteAccountGroup = (groupId: string) => {
    if (groupId === '1') {
      alert('「日常開銷」為系統核心帳戶，不能刪除！');
      return;
    }
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
      if (editingGroups) {
        setEditingGroups(editingGroups.filter(g => g.id !== groupId));
      }
      if (editingGroupId === groupId) {
        setEditingGroupId(null);
      }
    }
  };

  const handleAddCategory = (groupId: string, name: string, emoji: string, color: string, type: 'income' | 'expense') => {
    if (!name.trim()) return;

    const updateInList = (list: AccountGroup[]) => list.map(g => {
      if (g.id === groupId) {
        if (g.categories.some(c => c.name === name.trim() && c.type === type)) {
          alert('此分類名稱已存在！');
          return g;
        }
        return {
          ...g,
          categories: [...g.categories, { name: name.trim(), emoji, color, type }]
        };
      }
      return g;
    });

    setAccountGroups(updateInList(accountGroups));
    if (editingGroups) {
      setEditingGroups(updateInList(editingGroups));
    }
  };

  const handleDeleteCategory = (groupId: string, catName: string, type: 'income' | 'expense') => {
    const group = accountGroups.find(g => g.id === groupId);
    if (group && group.categories.filter(c => c.type === type).length <= 1) {
      alert('必須保留至少一個分類小項！');
      return;
    }

    if (confirm(`確定要刪除「${catName}」分類小項嗎？\n舊有的交易明細仍會保留此分類名稱，但將改用預設樣式。`)) {
      const updateInList = (list: AccountGroup[]) => list.map(g => {
        if (g.id === groupId) {
          return {
            ...g,
            categories: g.categories.filter(c => !(c.name === catName && c.type === type))
          };
        }
        return g;
      });

      setAccountGroups(updateInList(accountGroups));
      if (editingGroups) {
        setEditingGroups(updateInList(editingGroups));
      }
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

  const todayStr = new Date().toISOString().split('T')[0];
  const currentMonthStr = todayStr.substring(0, 7);

  const displayIncome = transactions
    .filter(tx => tx.type === 'income')
    .filter(tx => period === 'today' ? tx.date === todayStr : tx.date.startsWith(currentMonthStr))
    .reduce((sum, tx) => sum + tx.amount, 0);

  const displayExpense = transactions
    .filter(tx => tx.type === 'expense')
    .filter(tx => period === 'today' ? tx.date === todayStr : tx.date.startsWith(currentMonthStr))
    .reduce((sum, tx) => sum + tx.amount, 0);

  // Daily allowed consumption calculations for "日常開銷" (Group '1')
  const dailyExpenseGroup = accountGroups.find(g => g.id === '1');
  const group1Budget = dailyExpenseGroup?.budget || 30000;
  const todayDay = new Date().getDate();
  const dailyAllowance = Math.round(group1Budget / 30);
  
  const cumulativeExpenseUpToYesterday = transactions
    .filter(tx => 
      tx.accountGroupId === '1' && 
      tx.type === 'expense' && 
      tx.date.startsWith(currentMonthStr) && 
      tx.date < todayStr
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const allowedToday = todayDay * dailyAllowance - cumulativeExpenseUpToYesterday;

  const todayExpenseForDailyGroup = transactions
    .filter(tx => 
      tx.accountGroupId === '1' && 
      tx.type === 'expense' && 
      tx.date === todayStr
    )
    .reduce((sum, tx) => sum + tx.amount, 0);

  const remainingToday = allowedToday - todayExpenseForDailyGroup;

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

  const getCategoryEmoji = (catName: string, groupId: string) => {
    const matchGroup = accountGroups.find(g => g.id === groupId);
    if (matchGroup) {
      const matchCat = matchGroup.categories.find(c => c.name === catName);
      if (matchCat) return matchCat.emoji;
    }
    // Fallback search in all groups
    for (const group of accountGroups) {
      const matchCat = group.categories.find(c => c.name === catName);
      if (matchCat) return matchCat.emoji;
    }
    return '🏷️';
  };

  const getCategoryColor = (catName: string, groupId: string) => {
    const matchGroup = accountGroups.find(g => g.id === groupId);
    if (matchGroup) {
      const matchCat = matchGroup.categories.find(c => c.name === catName);
      if (matchCat) return matchCat.color;
    }
    for (const group of accountGroups) {
      const matchCat = group.categories.find(c => c.name === catName);
      if (matchCat) return matchCat.color;
    }
    return '#6b7280';
  };

  const getGroupName = (groupId: string) => {
    const match = accountGroups.find(g => g.id === groupId);
    return match ? `${match.emoji} ${match.name}` : '⚙️ 未知帳戶';
  };

  // Grouping Helpers
  const getGroupKey = (dateStr: string, mode: 'day' | 'month' | 'year') => {
    if (mode === 'day') return dateStr;
    if (mode === 'month') return dateStr.substring(0, 7);
    return dateStr.substring(0, 4);
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
    const income = groupTxs.filter(tx => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
    const expense = groupTxs.filter(tx => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
    return { income, expense };
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>目前總餘額</div>
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '2px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <button
                    type="button"
                    onClick={() => setPeriod('today')}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: period === 'today' ? 'rgba(255,255,255,0.08)' : 'transparent',
                      color: period === 'today' ? '#fff' : 'var(--text-secondary)'
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
                      color: period === 'month' ? '#fff' : 'var(--text-secondary)'
                    }}
                  >
                    本月
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '2.5rem', fontWeight: 700, margin: '8px 0', color: totalBalance >= 0 ? '#fff' : 'var(--expense-color)' }}>
                ${totalBalance.toLocaleString('zh-TW')}
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{period === 'today' ? '今日收入' : '本月收入'}</div>
                  <div style={{ color: 'var(--income-color)', fontWeight: 600, fontSize: '1.1rem' }}>+${displayIncome.toLocaleString('zh-TW')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>{period === 'today' ? '今日支出' : '本月支出'}</div>
                  <div style={{ color: 'var(--expense-color)', fontWeight: 600, fontSize: '1.1rem' }}>-${displayExpense.toLocaleString('zh-TW')}</div>
                </div>
              </div>

              {period === 'today' && dailyExpenseGroup ? (
                <div style={{
                  marginTop: '16px',
                  paddingTop: '16px',
                  borderTop: '1px dashed rgba(255,255,255,0.1)',
                  fontSize: '0.85rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>當日可消費 (累計昨天)</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>${allowedToday.toLocaleString('zh-TW')}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>當日消費: </span>
                      <span style={{ fontWeight: 600, color: '#fff' }}>${todayExpenseForDailyGroup.toLocaleString('zh-TW')}</span>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-secondary)' }}>當日剩餘: </span>
                      <span style={{
                        fontWeight: 600,
                        color: remainingToday >= 0 ? 'var(--income-color)' : 'var(--expense-color)'
                      }}>
                        {remainingToday >= 0 ? `$${remainingToday.toLocaleString('zh-TW')}` : `超支 $${Math.abs(remainingToday).toLocaleString('zh-TW')}`}
                      </span>
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', overflow: 'hidden', marginTop: '2px' }}>
                    <div style={{
                      width: `${Math.min(100, Math.max(0, allowedToday > 0 ? (todayExpenseForDailyGroup / allowedToday) * 100 : 100))}%`,
                      height: '100%',
                      backgroundColor: todayExpenseForDailyGroup > allowedToday ? 'var(--expense-color)' : 'var(--income-color)',
                      borderRadius: '2px',
                      transition: 'width 0.3s ease-in-out'
                    }} />
                  </div>
                </div>
              ) : null}
            </div>

            {/* Account Groups List */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>資金大項帳戶</h3>
                <button 
                  onClick={() => {
                    if (isEditingGroups) {
                      handleSaveEditGroups();
                    } else {
                      handleStartEditGroups();
                    }
                  }} 
                  style={{ background: 'transparent', color: 'var(--primary-color)', fontSize: '0.85rem', fontWeight: 500 }}
                  disabled={isEditingGroups && (!editingGroups || editingGroups.reduce((s, g) => s + (g.targetRatio || 0), 0) !== 100)}
                >
                  {isEditingGroups ? '完成編輯' : '⚙️ 編輯帳戶'}
                </button>
              </div>

              {/* Stacked Progress Bar for Asset Allocation at the top */}
              {(() => {
                const totalPositive = accountGroups
                  .map(g => getGroupBalance(g.id))
                  .filter(b => b > 0)
                  .reduce((sum, b) => sum + b, 0);

                return (
                  <>
                    {!isEditingGroups && totalPositive > 0 && (
                      <div style={{ 
                        width: '100%', 
                        height: '12px', 
                        background: 'rgba(255,255,255,0.04)', 
                        borderRadius: '6px', 
                        display: 'flex', 
                        overflow: 'hidden',
                        marginBottom: '16px'
                      }}>
                        {accountGroups.map(group => {
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
                                transition: 'width 0.5s ease-in-out'
                              }}
                              title={`${group.name}: ${Math.round(pct)}%`}
                            />
                          );
                        })}
                      </div>
                    )}

                    {/* Accounts scroll container */}
                    <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', paddingBottom: '8px', scrollbarWidth: 'none' }}>
                      {accountGroups.map(group => {
                        const bal = getGroupBalance(group.id);
                        const actualPct = totalPositive > 0 ? Math.round((Math.max(0, bal) / totalPositive) * 100) : 0;
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
                              position: 'relative'
                            }}
                          >
                            <div style={{ fontSize: '0.9rem', fontWeight: 500, display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'space-between' }}>
                              <span style={{ display: 'flex', gap: '4px', alignItems: 'center', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                                <span>{group.emoji}</span>
                                <span>{group.name}</span>
                              </span>
                              <span style={{ 
                                fontSize: '0.7rem', 
                                padding: '2px 5px', 
                                borderRadius: '8px', 
                                background: 'rgba(255,255,255,0.06)', 
                                color: 'var(--text-secondary)', 
                                fontWeight: 600,
                                flexShrink: 0
                              }}>
                                {actualPct}%
                              </span>
                            </div>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: '12px', color: bal >= 0 ? '#fff' : 'var(--expense-color)' }}>
                              ${bal.toLocaleString('zh-TW')}
                            </div>

                            {/* Target Progress Bar */}
                            <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                <span>目標 {targetRatio}%</span>
                                <span>達標 {comparisonRatio}%</span>
                              </div>
                              <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '2.5px', overflow: 'hidden' }}>
                                <div style={{ 
                                  width: `${Math.min(100, comparisonRatio)}%`, 
                                  height: '100%', 
                                  backgroundColor: group.color, 
                                  borderRadius: '2.5px',
                                  transition: 'width 0.3s ease-in-out'
                                }} />
                              </div>
                            </div>

                            {group.budget && group.budget > 0 ? (() => {
                              const monthlyExpense = getCurrentMonthExpenseForGroup(group.id, transactions);
                              const pct = Math.round((monthlyExpense / group.budget) * 100);
                              let barColor = '#10b981'; // Green
                              if (pct >= 80 && pct < 100) {
                                barColor = '#f59e0b'; // Yellow/Orange
                              } else if (pct >= 100) {
                                barColor = '#ef4444'; // Red
                              }
                              const barWidth = Math.min(100, pct);
                              return (
                                <div style={{ marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-tertiary)', marginBottom: '4px' }}>
                                    <span>預算 ${group.budget.toLocaleString('zh-TW')}</span>
                                    <span style={{ color: pct >= 100 ? '#ef4444' : pct >= 80 ? '#f59e0b' : 'var(--text-secondary)', fontWeight: 600 }}>{pct}%</span>
                                  </div>
                                  <div style={{ width: '100%', height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '2.5px', overflow: 'hidden' }}>
                                    <div style={{ 
                                      width: `${barWidth}%`, 
                                      height: '100%', 
                                      backgroundColor: barColor, 
                                      borderRadius: '2.5px',
                                      transition: 'width 0.3s ease-in-out'
                                    }} />
                                  </div>
                                </div>
                              );
                            })() : null}
                            
                            {isEditingGroups && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', position: 'absolute', top: '4px', right: '4px' }}>
                                {group.id !== '1' && (
                                  <button 
                                    type="button"
                                    onClick={() => handleDeleteAccountGroup(group.id)}
                                    style={{
                                      background: '#f43f5e',
                                      color: '#fff',
                                      width: '18px',
                                      height: '18px',
                                      borderRadius: '50%',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontSize: '0.7rem',
                                      fontWeight: 700
                                    }}
                                    title="刪除帳戶"
                                  >
                                    ✕
                                  </button>
                                )}
                                <button 
                                  type="button"
                                  onClick={() => setEditingGroupId(editingGroupId === group.id ? null : group.id)}
                                  style={{
                                    background: editingGroupId === group.id ? 'var(--primary-color)' : 'rgba(255,255,255,0.1)',
                                    color: '#fff',
                                    width: '18px',
                                    height: '18px',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.65rem'
                                  }}
                                  title="管理分類小項"
                                >
                                  ⚙️
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                );
              })()}

              {/* Category Management Sub-panel */}
              {isEditingGroups && editingGroupId && (() => {
                const group = (editingGroups || accountGroups).find(g => g.id === editingGroupId);
                if (!group) return null;
                const filteredCats = group.categories.filter(c => c.type === catEditType);
                return (
                  <div className="glass-card fade-in" style={{ padding: '16px', marginTop: '12px', border: '1px solid rgba(99, 102, 241, 0.4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{group.emoji}</span>
                        <span>管理「{group.name}」分類小項</span>
                      </h4>
                      <button 
                        onClick={() => setEditingGroupId(null)}
                        style={{ background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}
                      >
                        關閉
                      </button>
                    </div>

                    {/* Budget Edit Section */}
                    <div style={{ marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
                      <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                        設定每月預算 (未設置或 0 表示不限制)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="例如: 10000"
                        value={group.budget || ''}
                        onChange={(e) => {
                          const val = e.target.value === '' ? undefined : Math.max(0, parseInt(e.target.value, 10));
                          if (editingGroups) {
                            const updated = editingGroups.map(eg => {
                              if (eg.id === group.id) {
                                return { ...eg, budget: val };
                              }
                              return eg;
                            });
                            setEditingGroups(updated);
                          } else {
                            const updatedGroups = accountGroups.map(g => {
                              if (g.id === group.id) {
                                return { ...g, budget: val };
                              }
                              return g;
                            });
                            setAccountGroups(updatedGroups);
                          }
                        }}
                        style={{ width: '100%', padding: '8px', fontSize: '0.85rem', boxSizing: 'border-box' }}
                      />
                    </div>

                    {/* Type Switcher */}
                    <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--border-radius-sm)' }}>
                      {(['expense', 'income'] as const).map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setCatEditType(t)}
                          style={{
                            flex: 1,
                            padding: '6px',
                            borderRadius: '6px',
                            fontSize: '0.8rem',
                            fontWeight: 500,
                            background: catEditType === t ? 'rgba(255,255,255,0.08)' : 'transparent',
                            color: catEditType === t ? '#fff' : 'var(--text-secondary)'
                          }}
                        >
                          {t === 'expense' ? '支出分類' : '收入分類'}
                        </button>
                      ))}
                    </div>

                    {/* Categories List */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {filteredCats.map(cat => (
                        <div 
                          key={cat.name} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '6px', 
                            padding: '6px 10px', 
                            borderRadius: '16px', 
                            background: 'rgba(255,255,255,0.04)',
                            border: `1px solid ${cat.color}33`,
                            fontSize: '0.8rem'
                          }}
                        >
                          <span>{cat.emoji}</span>
                          <span>{cat.name}</span>
                          <button 
                            type="button"
                            onClick={() => handleDeleteCategory(group.id, cat.name, catEditType)}
                            style={{ 
                              background: 'transparent', 
                              color: 'var(--text-tertiary)', 
                              fontSize: '0.75rem', 
                              marginLeft: '4px',
                              padding: '2px'
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      {filteredCats.length === 0 && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)', width: '100%', textAlign: 'center', padding: '10px 0' }}>
                          無此類型分類，請新增
                        </div>
                      )}
                    </div>

                    {/* Add Category Form */}
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px' }}>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '10px', color: 'var(--text-secondary)' }}>新增分類小項</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <IonSelect
                            value={newCatEmoji}
                            interface="action-sheet"
                            onIonChange={(e) => setNewCatEmoji(e.detail.value!)}
                            style={{ width: '70px', padding: '8px', fontSize: '0.85rem' }}
                          >
                            {['🍔', '🚗', '🎬', '🛍️', '🏠', '⚡', '🏷️', '💰', '💵', '📈', '🎁', '🏦', '💳', '🛡️', '🍕', '☕', '🎮', '🩺'].map(em => (
                              <IonSelectOption key={em} value={em}>{em}</IonSelectOption>
                            ))}
                          </IonSelect>
                          <input
                            type="text"
                            placeholder="分類名稱"
                            value={newCatName}
                            onChange={(e) => setNewCatName(e.target.value)}
                            style={{ flex: 1, padding: '8px', fontSize: '0.85rem' }}
                          />
                        </div>
                        
                        {/* Category Color Picker */}
                        <div>
                          <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '6px' }}>選擇分類顏色</label>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            {ACCOUNT_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setNewCatColor(c)}
                                style={{
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '50%',
                                  backgroundColor: c,
                                  border: newCatColor === c ? '2px solid #fff' : '2px solid transparent',
                                  padding: 0
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleAddCategory(group.id, newCatName, newCatEmoji, newCatColor, catEditType);
                            setNewCatName('');
                          }}
                          style={{
                            background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                            color: '#fff',
                            padding: '8px 12px',
                            borderRadius: 'var(--border-radius-sm)',
                            fontSize: '0.85rem',
                            fontWeight: 600,
                            marginTop: '4px'
                          }}
                        >
                          新增分類
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Target Ratio Editor Panel */}
              {isEditingGroups && editingGroups && (() => {
                const targetSum = editingGroups.reduce((s, g) => s + (g.targetRatio || 0), 0);
                const isInvalid = targetSum !== 100;

                return (
                  <div className="glass-card fade-in" style={{ padding: '16px', marginTop: '12px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, marginBottom: '12px' }}>🎯 設定資金大項目標配比</h4>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {editingGroups.map((group) => (
                        <div key={group.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                          <span style={{ fontSize: '0.9rem', display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <span>{group.emoji}</span>
                            <span>{group.name}</span>
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="0"
                              value={group.targetRatio ?? ''}
                              onChange={(e) => {
                                const val = e.target.value === '' ? 0 : Math.max(0, parseInt(e.target.value, 10));
                                const updated = editingGroups.map(eg => {
                                  if (eg.id === group.id) {
                                    return { ...eg, targetRatio: val };
                                  }
                                  return eg;
                                });
                                setEditingGroups(updated);
                              }}
                              style={{ width: '80px', padding: '6px 8px', fontSize: '0.85rem', textAlign: 'right', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '4px' }}
                            />
                            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>%</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>配比總和:</span>
                        <span style={{ fontWeight: 600, color: isInvalid ? 'var(--expense-color)' : 'var(--income-color)' }}>
                          {targetSum}%
                        </span>
                      </div>
                      {isInvalid && (
                        <div style={{ color: 'var(--expense-color)', fontSize: '0.8rem', marginTop: '6px', fontWeight: 500 }}>
                          ⚠️ 目標比例加總必須為 100%（目前: {targetSum}%）
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

              {/* Inline Account group editor panel */}
              {isEditingGroups && (
                <div className="glass-card fade-in" style={{ padding: '16px', marginTop: '12px', borderStyle: 'dashed' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', fontWeight: 600 }}>新增資金大項</h4>
                  <form onSubmit={handleAddAccountGroup} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <IonSelect 
                        value={newGroupEmoji} 
                        interface="action-sheet"
                        onIonChange={(e) => setNewGroupEmoji(e.detail.value!)}
                        style={{ width: '70px', padding: '8px' }}
                      >
                        {ACCOUNT_EMOJIS.map(e => <IonSelectOption key={e} value={e}>{e}</IonSelectOption>)}
                      </IonSelect>
                      <input 
                        type="text" 
                        placeholder="帳戶大項名稱" 
                        value={newGroupName} 
                        onChange={(e) => setNewGroupName(e.target.value)}
                        style={{ flex: 1, padding: '8px' }}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>每月預算 (選填，未設定或0為不限制)</label>
                      <input 
                        type="number" 
                        min="0"
                        placeholder="每月預算金額 ($)" 
                        value={newGroupBudget} 
                        onChange={(e) => setNewGroupBudget(e.target.value)}
                        style={{ padding: '8px', fontSize: '0.85rem' }}
                      />
                    </div>

                    {/* Color selection for new group */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>選擇資金大項顏色</label>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {ACCOUNT_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewGroupColor(c)}
                            style={{
                              width: '24px',
                              height: '24px',
                              borderRadius: '50%',
                              backgroundColor: c,
                              border: newGroupColor === c ? '2px solid #fff' : '2px solid transparent',
                              boxShadow: newGroupColor === c ? '0 0 8px ' + c : 'none',
                              padding: 0
                            }}
                          />
                        ))}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      style={{
                        background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                        color: '#fff',
                        padding: '10px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        marginTop: '6px'
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
              onClick={() => {
                setEditingTx(null);
                setShowTxModal(true);
              }}
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

            {/* Grouped Transaction Ledger */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>今日記帳明細</h3>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {(() => {
                  const dashboardTxs = transactions.filter(tx => tx.date === todayStr);
                  const dashboardGrouped = dashboardTxs.reduce((acc: { [key: string]: Transaction[] }, tx) => {
                    const key = getGroupKey(tx.date, 'day');
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(tx);
                    return acc;
                  }, {});
                  const sortedDashboardKeys = Object.keys(dashboardGrouped).sort((a, b) => b.localeCompare(a));

                  return (
                    <>
                      {sortedDashboardKeys.map(groupKey => {
                        const groupTxs = dashboardGrouped[groupKey];
                        const { income, expense } = getGroupTotals(groupTxs);
                        return (
                          <div key={groupKey} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {/* Group Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px', fontSize: '0.85rem' }}>
                              <span style={{ fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                📅 {formatGroupHeader(groupKey, 'day')}
                              </span>
                              <span style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>
                                {income > 0 && <span style={{ color: 'var(--income-color)', marginRight: '8px' }}>+{income}</span>}
                                {expense > 0 && <span style={{ color: 'var(--expense-color)' }}>-{expense}</span>}
                              </span>
                            </div>
                            
                            {/* Group Items */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                              {groupTxs.map(tx => (
                                <div key={tx.id} className="glass-card" style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: 'var(--border-radius-md)' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                                    <div style={{ 
                                      fontSize: '1.3rem', 
                                      width: '36px', 
                                      height: '36px', 
                                      borderRadius: '50%', 
                                      background: tx.type === 'income' ? 'var(--income-bg)' : 'var(--expense-bg)',
                                      display: 'flex', 
                                      alignItems: 'center', 
                                      justifyContent: 'center',
                                      flexShrink: 0
                                    }}>
                                      {getCategoryEmoji(tx.category, tx.accountGroupId)}
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                      <div style={{ fontWeight: 500, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{tx.description}</div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {tx.category} • {getGroupName(tx.accountGroupId)}
                                      </div>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                                    <span style={{ 
                                      fontWeight: 600, 
                                      fontSize: '0.95rem',
                                      color: tx.type === 'income' ? 'var(--income-color)' : 'var(--expense-color)' 
                                    }}>
                                      {tx.type === 'income' ? '+' : '-'}${tx.amount}
                                    </span>
                                    
                                    {/* Edit & Delete Action Buttons */}
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                      <button 
                                        type="button"
                                        onClick={() => {
                                          setEditingTx(tx);
                                          setShowTxModal(true);
                                        }}
                                        style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '4px', opacity: 0.7 }}
                                        title="編輯"
                                      >
                                        ✏️
                                      </button>
                                      <button 
                                        type="button"
                                        onClick={() => handleDeleteTransaction(tx.id)}
                                        style={{ background: 'transparent', color: 'var(--text-tertiary)', fontSize: '0.85rem', padding: '4px', opacity: 0.7 }}
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
                        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)', fontSize: '0.9rem' }}>
                          今日尚無交易紀錄
                        </div>
                      )}
                    </>
                  );
                })()}
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
              <IonSelect 
                value={filterGroup} 
                interface="action-sheet"
                onIonChange={(e) => setFilterGroup(e.detail.value!)}
                style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: 'var(--border-radius-sm)' }}
              >
                <IonSelectOption value="all">顯示全部帳戶</IonSelectOption>
                {accountGroups.map(g => (
                  <IonSelectOption key={g.id} value={g.id}>{g.emoji} {g.name}</IonSelectOption>
                ))}
              </IonSelect>
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
                        {getCategoryEmoji(tx.category, tx.accountGroupId)}
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

        {/* TRANSACTION MODAL (Add/Edit) */}
        {showTxModal && (
          <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1100,
            padding: '16px'
          }}>
            <div className="glass-card" style={{
              width: '100%',
              maxWidth: '400px',
              padding: '24px',
              borderRadius: 'var(--border-radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              background: 'rgba(20, 20, 25, 0.95)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, textAlign: 'center', margin: 0 }}>
                {editingTx ? '修改收支記帳' : '新增收支記帳'}
              </h3>
              
              <form onSubmit={handleSaveTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Type Switcher */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>交易類型</label>
                  <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--border-radius-md)' }}>
                    <button
                      type="button"
                      onClick={() => setType('expense')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontWeight: 600,
                        background: type === 'expense' ? 'var(--expense-color)' : 'transparent',
                        color: type === 'expense' ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      支出 💸
                    </button>
                    <button
                      type="button"
                      onClick={() => setType('income')}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: 'var(--border-radius-sm)',
                        fontWeight: 600,
                        background: type === 'income' ? 'var(--income-color)' : 'transparent',
                        color: type === 'income' ? '#fff' : 'var(--text-secondary)'
                      }}
                    >
                      收入 💰
                    </button>
                  </div>
                </div>

                {/* Account Group selection */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>選擇資金帳戶大項</label>
                  <IonSelect 
                    value={accountGroupId} 
                    interface="action-sheet"
                    onIonChange={(e) => setAccountGroupId(e.detail.value!)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    {accountGroups.map(group => (
                      <IonSelectOption key={group.id} value={group.id}>
                        {group.emoji} {group.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
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
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
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
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required 
                  />
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>選擇分類</label>
                  <IonSelect 
                    value={category} 
                    interface="action-sheet"
                    onIonChange={(e) => setCategory(e.detail.value!)}
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                  >
                    {(accountGroups.find(g => g.id === accountGroupId)?.categories.filter(c => c.type === type) || []).map(cat => (
                      <IonSelectOption key={cat.name} value={cat.name}>
                        {cat.emoji} {cat.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </div>

                {/* Date */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>交易日期</label>
                  <input 
                    type="date" 
                    value={date} 
                    onChange={(e) => setDate(e.target.value)} 
                    style={{ width: '100%', padding: '10px', borderRadius: 'var(--border-radius-sm)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }}
                    required 
                  />
                </div>

                {/* Submit Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowTxModal(false);
                      setEditingTx(null);
                    }}
                    style={{
                      flex: 1,
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
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
                      padding: '12px',
                      borderRadius: 'var(--border-radius-sm)',
                      background: 'linear-gradient(90deg, #6366f1, #4f46e5)',
                      color: '#fff',
                      fontWeight: 600,
                      boxShadow: '0 4px 15px var(--primary-glow)'
                    }}
                  >
                    儲存
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TAB 4: STATS */}
        {activeTab === 'stats' && (() => {
          const statsTxs = transactions.filter(tx => tx.type === 'expense' && (statsGroup === 'all' || tx.accountGroupId === statsGroup));
          const statsTotalExpense = statsTxs.reduce((sum, tx) => sum + tx.amount, 0);

          let sortedStats: { name: string; emoji: string; color: string; amount: number }[] = [];

          if (statsGroup === 'all') {
            const activeExpenseByCategory = statsTxs.reduce((acc: { [key: string]: { amount: number; emoji: string; color: string } }, tx) => {
              if (!acc[tx.category]) {
                let emoji = '🏷️';
                let color = '#6b7280';
                const group = accountGroups.find(g => g.id === tx.accountGroupId);
                if (group) {
                  const cat = group.categories.find(c => c.name === tx.category);
                  if (cat) {
                    emoji = cat.emoji;
                    color = cat.color;
                  }
                }
                acc[tx.category] = { amount: 0, emoji, color };
              }
              acc[tx.category].amount += tx.amount;
              return acc;
            }, {});
            
            sortedStats = Object.entries(activeExpenseByCategory)
              .map(([name, data]) => ({ name, ...data }))
              .sort((a, b) => b.amount - a.amount);
          } else {
            const selectedGroupObj = accountGroups.find(g => g.id === statsGroup);
            const groupCategories = selectedGroupObj?.categories.filter(c => c.type === 'expense') || [];
            
            const groupExpenseMap = statsTxs.reduce((acc: { [key: string]: number }, tx) => {
              acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
              return acc;
            }, {});
            
            sortedStats = groupCategories.map(cat => ({
              name: cat.name,
              emoji: cat.emoji,
              color: cat.color,
              amount: groupExpenseMap[cat.name] || 0
            })).sort((a, b) => b.amount - a.amount);
          }

          return (
            <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600 }}>支出統計分析</h3>
              
              {/* Account Group Selector for Stats */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>帳戶：</span>
                <IonSelect 
                  value={statsGroup} 
                  interface="action-sheet"
                  onIonChange={(e) => setStatsGroup(e.detail.value!)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem', borderRadius: 'var(--border-radius-sm)' }}
                >
                  <IonSelectOption value="all">顯示全部帳戶</IonSelectOption>
                  {accountGroups.map(g => (
                    <IonSelectOption key={g.id} value={g.id}>{g.emoji} {g.name}</IonSelectOption>
                  ))}
                </IonSelect>
              </div>

              {/* Overview stats */}
              <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', padding: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>總記帳筆數</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{statsTxs.length} 筆</div>
                </div>
                <div style={{ borderLeft: '1px solid rgba(255,255,255,0.06)' }}></div>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>平均支出 / 筆</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--expense-color)' }}>
                    ${statsTxs.length > 0
                      ? Math.round(statsTotalExpense / statsTxs.length).toLocaleString('zh-TW')
                      : 0}
                  </div>
                </div>
              </div>

              {(() => {
                const dailyMap = statsTxs.reduce((acc: { [key: string]: number }, tx) => {
                  acc[tx.date] = (acc[tx.date] || 0) + tx.amount;
                  return acc;
                }, {});

                const trendData = Object.entries(dailyMap)
                  .map(([date, amount]) => ({ date, amount }))
                  .sort((a, b) => a.date.localeCompare(b.date));

                const pieData = sortedStats.filter(item => item.amount > 0);

                const CustomPieTooltip = ({ active, payload }: any) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass-card" style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20, 20, 25, 0.95)', fontSize: '0.8rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>{data.emoji} {data.name}</p>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)' }}>金額: ${data.amount.toLocaleString('zh-TW')}</p>
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
                      <div className="glass-card" style={{ padding: '8px 12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(20, 20, 25, 0.95)', fontSize: '0.8rem' }}>
                        <p style={{ margin: 0, fontWeight: 600 }}>📅 {data.date}</p>
                        <p style={{ margin: '4px 0 0 0', color: 'var(--expense-color)', fontWeight: 600 }}>支出: ${data.amount.toLocaleString('zh-TW')}</p>
                      </div>
                    );
                  }
                  return null;
                };

                return (
                  <>
                    {/* View Switcher Segmented Control */}
                    {statsTotalExpense > 0 && (
                      <div style={{ display: 'flex', gap: '8px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--border-radius-sm)', border: '1px solid rgba(255,255,255,0.05)' }}>
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
                            color: statsSubTab === 'category' ? '#fff' : 'var(--text-secondary)'
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
                            color: statsSubTab === 'trend' ? '#fff' : 'var(--text-secondary)'
                          }}
                        >
                          趨勢分析
                        </button>
                      </div>
                    )}

                    {/* Active Chart Card */}
                    {statsTotalExpense > 0 && (
                      <div className="glass-card" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                          {statsSubTab === 'category' ? '支出類別佔比圖' : '支出金額趨勢圖'}
                        </h4>
                        
                        {statsSubTab === 'category' ? (
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
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
                          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '220px' }}>
                            <ResponsiveContainer width="100%" height={220}>
                              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
                                  axisLine={{ stroke: 'rgba(255,255,255,0.08)' }}
                                  tickLine={false}
                                />
                                <YAxis 
                                  tick={{ fill: 'var(--text-tertiary)', fontSize: 10 }}
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
                    )}
                  </>
                );
              })()}

              {/* Category Bars */}
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)' }}>各類別支出佔比</h4>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {sortedStats.map(cat => {
                    const pct = statsTotalExpense > 0 ? Math.round((cat.amount / statsTotalExpense) * 100) : 0;
                    return (
                      <div key={cat.name}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{cat.emoji}</span>
                            <span style={{ fontWeight: 500 }}>{cat.name}</span>
                          </span>
                          <span style={{ color: 'var(--text-secondary)' }}>
                            ${cat.amount.toLocaleString('zh-TW')} ({pct}%)
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
                  {statsTotalExpense === 0 && (
                    <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                      目前尚無支出資料可進行統計分析
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* TAB 4: SETTINGS (BACKUP & RESTORE) */}
        {activeTab === 'settings' && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                💾 備份與還原 (Backup & Restore)
              </h2>
              
              {/* Native automatic backup toggle */}
              {isNative && (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '16px' }}>
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
                  📤 匯出資料備份 (.zip)
                </button>
                
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(255, 255, 255, 0.06)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    📥 匯入資料還原 (.zip)
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
                      backgroundColor: 'rgba(16, 185, 129, 0.1)',
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
                    🔄 從本機自動備份檔還原
                  </button>
                )}
              </div>
            </div>

            {/* Import history logs */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '12px' }}>
                📋 歷史匯入紀錄
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
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px solid rgba(255,255,255,0.04)',
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
                            backgroundColor: record.status === 'success' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
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
            gap: '4px'
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>⚙️</span>
          <span>設定</span>
        </button>
      </nav>
    </div>
  );
}

export default App;


