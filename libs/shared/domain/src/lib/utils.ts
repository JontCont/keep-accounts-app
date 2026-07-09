import { Category, Transaction } from './types';

export const getDefaultCategoriesForNewGroup = (): Category[] => [
  { name: '日常餐飲', emoji: '🍔', color: '#f59e0b', type: 'expense' },
  { name: '生活交通', emoji: '🚗', color: '#3b82f6', type: 'expense' },
  { name: '購物消費', emoji: '🛍️', color: '#10b981', type: 'expense' },
  { name: '日常雜項', emoji: '🏷️', color: '#6b7280', type: 'expense' },
  { name: '主動收入', emoji: '💰', color: '#10b981', type: 'income' },
  { name: '其他收入', emoji: '🏷️', color: '#6b7280', type: 'income' }
];

export const getCurrentMonthExpenseForGroup = (
  groupId: string,
  txs: Transaction[],
  referenceDate?: Date
): number => {
  const ref = referenceDate || new Date();
  const year = ref.getFullYear();
  const month = String(ref.getMonth() + 1).padStart(2, '0');
  const yearMonth = `${year}-${month}`; // "YYYY-MM"
  return txs
    .filter(
      (tx) =>
        tx.accountGroupId === groupId &&
        tx.type === 'expense' &&
        tx.date.startsWith(yearMonth)
    )
    .reduce((sum, tx) => sum + tx.amount, 0);
};

export const getLocalISOString = (d: Date = new Date()): string => {
  const pad = (n: number) => String(n).padStart(2, '0');
  const offset = -d.getTimezoneOffset();
  const sign = offset >= 0 ? '+' : '-';
  const absOffset = Math.abs(offset);
  const offsetH = pad(Math.floor(absOffset / 60));
  const offsetM = pad(absOffset % 60);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}${sign}${offsetH}:${offsetM}`;
};
