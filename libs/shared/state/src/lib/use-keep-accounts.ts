import { useState, useEffect } from 'react';
import {
  AccountGroup,
  Transaction,
  DEFAULT_ACCOUNT_GROUPS,
  INITIAL_TRANSACTIONS,
  ACCOUNT_COLORS,
  getCurrentMonthExpenseForGroup,
  getDefaultCategoriesForNewGroup,
} from '@keep-accounts-app/domain';

export function useKeepAccounts() {
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

          const defaultGroup = DEFAULT_ACCOUNT_GROUPS.find((dg) => dg.id === g.id);
          const ratio =
            typeof g.targetRatio === 'number' && !isNaN(g.targetRatio)
              ? g.targetRatio
              : defaultGroup?.targetRatio ?? 0;
          return {
            id: g.id,
            name: name,
            emoji: g.emoji,
            color:
              g.color ||
              defaultGroup?.color ||
              ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
            description: description || defaultGroup?.description,
            categories:
              categories ||
              defaultGroup?.categories ||
              getDefaultCategoriesForNewGroup(),
            targetRatio: ratio,
            budget: g.budget,
          };
        });

        // Validate sum equals 100%
        const sum = migrated.reduce((s: number, g: any) => s + g.targetRatio, 0);
        if (sum !== 100) {
          if (
            migrated.length === 3 &&
            migrated.some((g: any) => g.id === '1') &&
            migrated.some((g: any) => g.id === '2') &&
            migrated.some((g: any) => g.id === '3')
          ) {
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

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('keep_accounts_groups', JSON.stringify(accountGroups));
  }, [accountGroups]);

  useEffect(() => {
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // One-time mounting migration to ensure 333 rules are applied even if local state is cached
  useEffect(() => {
    const hasOldGroups = accountGroups.some(
      (g) =>
        (g.id === '1' && g.name === '主資金') ||
        (g.id === '2' && g.name === '投資資金') ||
        (g.id === '3' && g.name === '存款資金')
    );
    if (hasOldGroups) {
      const updated = accountGroups.map((g) => {
        if (g.id === '1' && g.name === '主資金') {
          return {
            ...g,
            name: '日常開銷',
            description: '日常開銷：支付房租、水電、餐費與交通。',
            categories: DEFAULT_ACCOUNT_GROUPS[0].categories,
          };
        }
        if (g.id === '2' && g.name === '投資資金') {
          return {
            ...g,
            name: '投資理財',
            description: '投資理財：投入股市、基金等，用於創造被動收入與資產增值。',
            categories: DEFAULT_ACCOUNT_GROUPS[1].categories,
          };
        }
        if (g.id === '3' && g.name === '存款資金') {
          return {
            ...g,
            name: '長期儲蓄',
            description: '長期儲蓄：存入銀行或作為緊急預備金，確保財務安全。',
            categories: DEFAULT_ACCOUNT_GROUPS[2].categories,
          };
        }
        return g;
      });
      setAccountGroups(updated);
    }
  }, []);

  const saveTransaction = (
    description: string,
    amountStr: string,
    type: 'income' | 'expense',
    category: string,
    date: string,
    accountGroupId: string,
    editingTxId: string | null
  ): boolean => {
    const amount = parseFloat(amountStr);
    if (amount < 0) {
      throw new Error('Transaction amount cannot be negative');
    }
    if (isNaN(amount) || amount <= 0) {
      alert('記帳金額必須為正數！');
      return false;
    }
    if (!description.trim()) {
      alert('請輸入描述！');
      return false;
    }

    const targetGroup = accountGroups.find((g) => g.id === accountGroupId);
    if (
      targetGroup &&
      targetGroup.budget &&
      targetGroup.budget > 0 &&
      type === 'expense'
    ) {
      let projectedTxs: Transaction[] = [];
      if (editingTxId) {
        projectedTxs = transactions.map((tx) => {
          if (tx.id === editingTxId) {
            return { ...tx, amount, type, category, date, accountGroupId };
          }
          return tx;
        });
      } else {
        projectedTxs = [
          {
            id: 'temp',
            description: description.trim(),
            amount,
            type,
            category,
            date,
            accountGroupId,
          },
          ...transactions,
        ];
      }

      const monthlyExpenses = getCurrentMonthExpenseForGroup(
        accountGroupId,
        projectedTxs
      );
      if (monthlyExpenses > targetGroup.budget) {
        const diff = monthlyExpenses - targetGroup.budget;
        alert(
          `提醒：「${
            targetGroup.name
          }」已超出預算！(目前已支出 $${monthlyExpenses.toLocaleString(
            'zh-TW'
          )} / 預算 $${targetGroup.budget.toLocaleString(
            'zh-TW'
          )}，超支 $${diff.toLocaleString('zh-TW')})`
        );
      }
    }

    if (editingTxId) {
      setTransactions(
        transactions.map((tx) =>
          tx.id === editingTxId
            ? {
                ...tx,
                description: description.trim(),
                amount,
                type,
                category,
                date,
                accountGroupId,
              }
            : tx
        )
      );
    } else {
      const newTx: Transaction = {
        id: Date.now().toString(),
        description: description.trim(),
        amount,
        type,
        category,
        date,
        accountGroupId,
      };
      setTransactions([newTx, ...transactions]);
    }
    return true;
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const saveAccountGroups = (groups: AccountGroup[]): boolean => {
    const sum = groups.reduce((s, g) => s + (g.targetRatio || 0), 0);
    if (sum !== 100) {
      alert('目標比例加總必須為 100%！');
      throw new Error('Allocation target ratios must sum to exactly 100%');
    }
    setAccountGroups(groups);
    return true;
  };

  const addAccountGroup = (
    name: string,
    emoji: string,
    color: string,
    budgetStr: string
  ): boolean => {
    if (!name.trim()) return false;

    const budgetVal = budgetStr.trim()
      ? Math.max(0, parseInt(budgetStr.trim(), 10))
      : undefined;

    const newGroup: AccountGroup = {
      id: Date.now().toString(),
      name: name.trim(),
      emoji,
      color,
      categories: getDefaultCategoriesForNewGroup(),
      budget: budgetVal,
      targetRatio: 0,
    };

    setAccountGroups([...accountGroups, newGroup]);
    return true;
  };

  const deleteAccountGroup = (groupId: string): boolean => {
    if (groupId === '1') {
      alert('「日常開銷」為系統核心帳戶，不能刪除！');
      return false;
    }
    if (accountGroups.length <= 1) {
      alert('必須保留至少一個資金帳戶！');
      return false;
    }

    const remainingGroups = accountGroups.filter((g) => g.id !== groupId);
    const targetGroupId = remainingGroups[0].id;

    // Re-link transactions to the first remaining group
    const updatedTxs = transactions.map((tx) => {
      if (tx.accountGroupId === groupId) {
        return { ...tx, accountGroupId: targetGroupId };
      }
      return tx;
    });

    setTransactions(updatedTxs);
    setAccountGroups(remainingGroups);
    return true;
  };

  const addCategory = (
    groupId: string,
    name: string,
    emoji: string,
    color: string,
    type: 'income' | 'expense'
  ): boolean => {
    if (!name.trim()) return false;

    let hasDuplicate = false;
    const updated = accountGroups.map((g) => {
      if (g.id === groupId) {
        if (
          g.categories.some((c) => c.name === name.trim() && c.type === type)
        ) {
          alert('此分類名稱已存在！');
          hasDuplicate = true;
          return g;
        }
        return {
          ...g,
          categories: [
            ...g.categories,
            { name: name.trim(), emoji, color, type },
          ],
        };
      }
      return g;
    });

    if (hasDuplicate) return false;
    setAccountGroups(updated);
    return true;
  };

  const deleteCategory = (
    groupId: string,
    catName: string,
    type: 'income' | 'expense'
  ): boolean => {
    const group = accountGroups.find((g) => g.id === groupId);
    if (group && group.categories.filter((c) => c.type === type).length <= 1) {
      alert('必須保留至少一個分類小項！');
      return false;
    }

    const updated = accountGroups.map((g) => {
      if (g.id === groupId) {
        return {
          ...g,
          categories: g.categories.filter(
            (c) => !(c.name === catName && c.type === type)
          ),
        };
      }
      return g;
    });

    setAccountGroups(updated);
    return true;
  };

  return {
    accountGroups,
    setAccountGroups,
    transactions,
    setTransactions,
    saveTransaction,
    deleteTransaction,
    saveAccountGroups,
    addAccountGroup,
    deleteAccountGroup,
    addCategory,
    deleteCategory,
  };
}
