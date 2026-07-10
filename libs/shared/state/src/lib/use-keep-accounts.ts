import { useState, useEffect } from 'react';
import {
  AccountGroup,
  Transaction,
  getCurrentMonthExpenseForGroup,
  getDefaultCategoriesForNewGroup,
  getLocalISOString,
  expandInstallment,
} from '@keep-accounts-app/domain';
import { migrateAccountGroups } from './migrations';

export function useKeepAccounts() {
  const [accountGroups, setAccountGroups] = useState<AccountGroup[]>(() => {
    const saved = localStorage.getItem('keep_accounts_groups');
    if (saved) {
      try {
        return migrateAccountGroups(JSON.parse(saved));
      } catch (e) {
        console.error(e);
        // Corrupted data: start empty. Real seed data comes only from the
        // template import button or a user backup restore — never fabricated here.
        return [];
      }
    }
    // Fresh install (no saved data): start empty. Users can seed via the template import button.
    return [];
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('keep_accounts_transactions');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
        // Corrupted data: start empty (consistent with fresh install).
        return [];
      }
    }
    // Fresh install (no saved data): start empty.
    return [];
  });

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem('keep_accounts_groups', JSON.stringify(accountGroups));
  }, [accountGroups]);

  useEffect(() => {
    localStorage.setItem('keep_accounts_transactions', JSON.stringify(transactions));
  }, [transactions]);

  // Legacy repair: before installment account-group selection existed, some
  // installment transactions with system category "分期" were saved into source
  // groups (e.g. 當月薪資). Move them to a non-source group so expense stats and
  // budget cards reflect the user's expected spending bucket.
  useEffect(() => {
    if (accountGroups.length === 0 || transactions.length === 0) {
      return;
    }

    const preferredDailyGroup = accountGroups.find(
      (group) => group.id === '1' && !group.isSource
    );
    const fallbackExpenseGroup = accountGroups.find((group) => !group.isSource);
    const targetGroupId = preferredDailyGroup?.id ?? fallbackExpenseGroup?.id;
    if (!targetGroupId) {
      return;
    }

    const sourceGroupIds = new Set(
      accountGroups.filter((group) => group.isSource).map((group) => group.id)
    );

    let changed = false;
    const repaired = transactions.map((tx) => {
      if (
        tx.installmentId &&
        tx.category === '分期' &&
        sourceGroupIds.has(tx.accountGroupId)
      ) {
        changed = true;
        return { ...tx, accountGroupId: targetGroupId };
      }
      return tx;
    });

    if (changed) {
      setTransactions(repaired);
    }
  }, [accountGroups, transactions]);

  const saveTransaction = (
    description: string,
    amountStr: string,
    type: 'income' | 'expense',
    category: string,
    date: string,
    accountGroupId: string,
    editingTxId: string | null,
    installmentPeriods?: number
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

    const isInstallment = !editingTxId && !!installmentPeriods;
    if (isInstallment) {
      if (!Number.isInteger(installmentPeriods) || (installmentPeriods as number) < 1) {
        alert('分期期數必須為至少 1 期的整數！');
        return false;
      }
    }

    const targetGroup = accountGroups.find((g) => g.id === accountGroupId);
    if (
      !isInstallment &&
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
      if (isInstallment) {
        const installmentId = Date.now().toString();
        const periods = expandInstallment(
          amount,
          installmentPeriods as number,
          date
        );
        const newTxs: Transaction[] = periods.map((p) => ({
          id: `${installmentId}-${p.period}`,
          description: description.trim(),
          amount: p.amount,
          type,
          category,
          date: p.date,
          accountGroupId,
          installmentId,
          installmentPeriod: p.period,
          installmentCount: installmentPeriods as number,
        }));
        setTransactions([...newTxs, ...transactions]);
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
    }
    return true;
  };

  const deleteTransaction = (id: string) => {
    const target = transactions.find((tx) => tx.id === id);
    if (target?.installmentId) {
      deleteInstallmentPeriod(id);
      return;
    }

    setTransactions(transactions.filter((tx) => tx.id !== id));
  };

  const sortInstallmentTransactions = (groupTxs: Transaction[]) => {
    return [...groupTxs].sort((a, b) => {
      const periodDiff = (a.installmentPeriod ?? 0) - (b.installmentPeriod ?? 0);
      if (periodDiff !== 0) return periodDiff;
      return a.date.localeCompare(b.date);
    });
  };

  const replaceInstallmentGroup = (
    installmentId: string,
    updatedGroup: Transaction[]
  ) => {
    const updatedById = new Map(updatedGroup.map((tx) => [tx.id, tx]));
    setTransactions(
      transactions.flatMap((tx) => {
        if (tx.installmentId !== installmentId) {
          return [tx];
        }

        const replacement = updatedById.get(tx.id);
        return replacement ? [replacement] : [];
      })
    );
  };

  const deleteInstallmentPeriod = (id: string): boolean => {
    const target = transactions.find((tx) => tx.id === id);
    if (!target?.installmentId) {
      return false;
    }

    const remainingGroup = sortInstallmentTransactions(
      transactions.filter(
        (tx) => tx.installmentId === target.installmentId && tx.id !== id
      )
    );

    if (remainingGroup.length === 0) {
      setTransactions(
        transactions.filter((tx) => tx.installmentId !== target.installmentId)
      );
      return true;
    }

    const reindexed = remainingGroup.map((tx, index) => ({
      ...tx,
      installmentPeriod: index + 1,
      installmentCount: remainingGroup.length,
    }));

    replaceInstallmentGroup(target.installmentId, reindexed);
    return true;
  };

  const deleteInstallmentGroup = (installmentId: string): boolean => {
    const hasGroup = transactions.some((tx) => tx.installmentId === installmentId);
    if (!hasGroup) {
      return false;
    }

    setTransactions(transactions.filter((tx) => tx.installmentId !== installmentId));
    return true;
  };

  const settleInstallmentGroup = (installmentId: string): boolean => {
    const groupTxs = sortInstallmentTransactions(
      transactions.filter((tx) => tx.installmentId === installmentId)
    );
    if (groupTxs.length === 0) {
      return false;
    }

    const settledAt = getLocalISOString();
    const remainingTxs = groupTxs.filter((tx) => new Date(tx.date).getTime() > new Date(settledAt).getTime());
    if (remainingTxs.length === 0) {
      return false;
    }

    const settledTxs = groupTxs.filter((tx) => new Date(tx.date).getTime() <= new Date(settledAt).getTime());
    const totalRemainingAmount = remainingTxs.reduce((sum, tx) => sum + tx.amount, 0);
    const nextPeriod = settledTxs.length + 1;
    const template = groupTxs[0];

    const updatedSettledTxs = settledTxs.map((tx, index) => ({
      ...tx,
      installmentPeriod: index + 1,
      installmentCount: nextPeriod,
    }));

    const settlementTx: Transaction = {
      id: `${installmentId}-settlement-${Date.now()}`,
      description: template.description,
      amount: totalRemainingAmount,
      type: template.type,
      category: template.category,
      date: settledAt,
      accountGroupId: template.accountGroupId,
      installmentId,
      installmentPeriod: nextPeriod,
      installmentCount: nextPeriod,
    };

    replaceInstallmentGroup(installmentId, [...updatedSettledTxs, settlementTx]);
    return true;
  };

  const saveAccountGroups = (groups: AccountGroup[]): boolean => {
    const sum = groups
      .filter((g) => !g.isSource)
      .reduce((s, g) => s + (g.targetRatio || 0), 0);
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
    const target = accountGroups.find((g) => g.id === groupId);
    if (target?.isSource) {
      alert('「當月薪資」為薪資來源帳戶，不能刪除！');
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
    deleteInstallmentPeriod,
    deleteInstallmentGroup,
    settleInstallmentGroup,
    saveAccountGroups,
    addAccountGroup,
    deleteAccountGroup,
    addCategory,
    deleteCategory,
  };
}
