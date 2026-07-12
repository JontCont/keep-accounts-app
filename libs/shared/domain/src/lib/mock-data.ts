/**
 * Demo / seed data — NOT auto-injected into production state.
 *
 * These datasets are only used in two explicit, opt-in places:
 *  1. The "導入範例模板資料" (import template) button, to let users try the app
 *     with sample groups and transactions.
 *  2. As the canonical reference shape used by the one-time data migration in
 *     `useKeepAccounts` (category colors, source group, default ratios).
 *
 * A fresh install starts EMPTY. Nothing here is written to storage unless the
 * user taps the template button or existing saved data is being migrated.
 */
import { AccountGroup, Transaction } from './types';
import { getLocalISOString } from './utils';

export const DEFAULT_ACCOUNT_GROUPS: AccountGroup[] = [
  {
    id: '0',
    name: '當月薪資',
    emoji: 'briefcase',
    color: '#22c55e',
    description: '當月薪資：本月待分配的收入來源，依比例分配至各大項。',
    isSource: true,
    categories: [
      { name: '薪資收入', emoji: 'briefcase', color: '#22c55e', type: 'income' },     // Green
      { name: '獎金紅包', emoji: 'gift', color: '#ef4444', type: 'income' },          // Red
      { name: '其他收入', emoji: 'tag', color: '#06b6d4', type: 'income' }            // Cyan
    ]
  },
  {
    id: '3',
    name: '儲蓄資金',
    emoji: 'piggy-bank',
    color: '#10b981',
    description: '儲蓄資金：存入銀行或作為緊急預備金，確保財務安全。',
    targetRatio: 40,
    categories: [
      { name: '定存儲蓄', emoji: 'landmark', color: '#f43f5e', type: 'expense' },     // Rose
      { name: '緊急備用', emoji: 'shield', color: '#dc2626', type: 'expense' },        // Red-Dark
      { name: '其他儲蓄', emoji: 'tag', color: '#71717a', type: 'expense' },           // Zinc
      { name: '分期', emoji: 'credit-card', color: '#6366f1', type: 'expense' },       // Indigo
      { name: '定存利息', emoji: 'dollar-sign', color: '#16a34a', type: 'income' },    // Green-Dark
      { name: '其他存款收入', emoji: 'tag', color: '#38bdf8', type: 'income' },        // Light Sky
      { name: '其他收入', emoji: 'tag', color: '#d946ef', type: 'income' }             // Fuchsia
    ]
  },
  {
    id: '1',
    name: '日常開銷',
    emoji: 'credit-card',
    color: '#6366f1',
    description: '日常開銷：支付房租、水電、餐費與交通。',
    targetRatio: 30,
    categories: [
      { name: '餐飲食品', emoji: 'coffee', color: '#f59e0b', type: 'expense' },      // Amber
      { name: '交通出行', emoji: 'car', color: '#0ea5e9', type: 'expense' },          // Sky Blue
      { name: '休閒娛樂', emoji: 'film', color: '#ec4899', type: 'expense' },         // Pink
      { name: '購物消費', emoji: 'shopping-cart', color: '#10b981', type: 'expense' }, // Emerald
      { name: '居住房租', emoji: 'home', color: '#8b5cf6', type: 'expense' },         // Violet
      { name: '水電雜費', emoji: 'zap', color: '#eab308', type: 'expense' },          // Yellow
      { name: '日常雜項', emoji: 'tag', color: '#64748b', type: 'expense' }           // Slate
      ,{ name: '分期', emoji: 'credit-card', color: '#6366f1', type: 'expense' }      // Indigo
    ]
  },
  {
    id: '2',
    name: '投資理財',
    emoji: 'trending-up',
    color: '#3b82f6',
    description: '投資理財：投入股市、基金等，用於創造被動收入與資產增值。',
    targetRatio: 30,
    categories: [
      { name: '股票', emoji: 'trending-up', color: '#2563eb', type: 'expense' },        // Blue-Dark
      { name: '股市投資', emoji: 'trending-down', color: '#6366f1', type: 'expense' }, // Indigo
      { name: '基金認購', emoji: 'landmark', color: '#a855f7', type: 'expense' },      // Purple
      { name: '投資理財', emoji: 'trending-up', color: '#3b82f6', type: 'expense' },   // Blue
      { name: '其他投資', emoji: 'tag', color: '#f97316', type: 'expense' },           // Orange
      { name: '分期', emoji: 'credit-card', color: '#6366f1', type: 'expense' },       // Indigo
      { name: '投資收益', emoji: 'trending-up', color: '#84cc16', type: 'income' },    // Lime
      { name: '股利發放', emoji: 'dollar-sign', color: '#d97706', type: 'income' },    // Amber-Dark
      { name: '其他投資收入', emoji: 'tag', color: '#14b8a6', type: 'income' }         // Teal
    ]
  }
];

export const STARTER_ALLOCATION_PRESET: AccountGroup[] = DEFAULT_ACCOUNT_GROUPS.map((group) => ({
  ...group,
  categories: group.categories.map((category) => ({ ...category })),
}));

const atLocalTime = (base: Date, hour: number, minute: number): string => {
  const d = new Date(base);
  d.setHours(hour, minute, 0, 0);
  return getLocalISOString(d);
};

const daysAgo = (days: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return atLocalTime(d, hour, minute);
};

const monthsAgoDay = (months: number, day: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setMonth(d.getMonth() - months);
  d.setDate(day);
  return atLocalTime(d, hour, minute);
};

const yearOffsetDate = (yearOffset: number, month: number, day: number, hour: number, minute: number): string => {
  const d = new Date();
  d.setFullYear(d.getFullYear() + yearOffset, month - 1, day);
  return atLocalTime(d, hour, minute);
};

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tmpl-1', description: '發放月薪', amount: 58000, type: 'income', category: '薪資收入', date: monthsAgoDay(0, 5, 10, 30), accountGroupId: '0' },
  { id: 'tmpl-2', description: '績效獎金', amount: 9000, type: 'income', category: '獎金紅包', date: monthsAgoDay(0, 10, 11, 10), accountGroupId: '0' },
  { id: 'tmpl-3', description: '午餐便當', amount: 140, type: 'expense', category: '餐飲食品', date: daysAgo(1, 12, 20), accountGroupId: '1' },
  { id: 'tmpl-4', description: '晚餐火鍋', amount: 460, type: 'expense', category: '餐飲食品', date: daysAgo(3, 19, 35), accountGroupId: '1' },
  { id: 'tmpl-5', description: '捷運加值', amount: 300, type: 'expense', category: '交通出行', date: daysAgo(2, 8, 35), accountGroupId: '1' },
  { id: 'tmpl-6', description: '網購生活用品', amount: 1280, type: 'expense', category: '購物消費', date: daysAgo(6, 21, 15), accountGroupId: '1' },
  { id: 'tmpl-7', description: '房租', amount: 15000, type: 'expense', category: '居住房租', date: monthsAgoDay(0, 2, 9, 0), accountGroupId: '1' },
  { id: 'tmpl-8', description: '水電瓦斯', amount: 2380, type: 'expense', category: '水電雜費', date: monthsAgoDay(0, 8, 20, 30), accountGroupId: '1' },
  { id: 'tmpl-9', description: '定存轉入', amount: 12000, type: 'expense', category: '定存儲蓄', date: monthsAgoDay(0, 6, 13, 0), accountGroupId: '3' },
  { id: 'tmpl-10', description: '緊急預備金補足', amount: 4000, type: 'expense', category: '緊急備用', date: monthsAgoDay(0, 12, 16, 45), accountGroupId: '3' },
  { id: 'tmpl-11', description: '定存利息入帳', amount: 360, type: 'income', category: '定存利息', date: monthsAgoDay(0, 18, 9, 15), accountGroupId: '3' },
  { id: 'tmpl-12', description: 'ETF 定期定額', amount: 6000, type: 'expense', category: '股票', date: monthsAgoDay(0, 7, 10, 0), accountGroupId: '2' },
  { id: 'tmpl-13', description: '股利入帳', amount: 1800, type: 'income', category: '股利發放', date: monthsAgoDay(0, 16, 14, 5), accountGroupId: '2' },
  { id: 'tmpl-14', description: '基金加碼', amount: 2500, type: 'expense', category: '基金認購', date: daysAgo(9, 15, 40), accountGroupId: '2' },

  // Previous-month records for history grouping and period filters.
  { id: 'tmpl-15', description: '上月月薪', amount: 56000, type: 'income', category: '薪資收入', date: monthsAgoDay(1, 5, 10, 30), accountGroupId: '0' },
  { id: 'tmpl-16', description: '上月餐飲支出', amount: 3200, type: 'expense', category: '餐飲食品', date: monthsAgoDay(1, 22, 19, 20), accountGroupId: '1' },
  { id: 'tmpl-17', description: '上月投資收益', amount: 1200, type: 'income', category: '投資收益', date: monthsAgoDay(1, 27, 11, 5), accountGroupId: '2' },

  // Explicit cross-day sample records.
  { id: 'tmpl-18', description: '深夜宵夜', amount: 180, type: 'expense', category: '餐飲食品', date: daysAgo(1, 23, 50), accountGroupId: '1' },
  { id: 'tmpl-19', description: '隔日早餐', amount: 95, type: 'expense', category: '餐飲食品', date: daysAgo(0, 7, 20), accountGroupId: '1' },

  // Explicit cross-year sample records.
  { id: 'tmpl-20', description: '跨年聚餐', amount: 888, type: 'expense', category: '休閒娛樂', date: yearOffsetDate(-1, 12, 31, 21, 30), accountGroupId: '1' },
  { id: 'tmpl-21', description: '元旦開工紅包', amount: 1200, type: 'income', category: '獎金紅包', date: yearOffsetDate(0, 1, 1, 9, 0), accountGroupId: '0' },

  // Explicit last-month and last-year records.
  { id: 'tmpl-22', description: '上個月交通月票', amount: 1280, type: 'expense', category: '交通出行', date: monthsAgoDay(1, 10, 8, 15), accountGroupId: '1' },
  { id: 'tmpl-23', description: '上個月定存利息', amount: 320, type: 'income', category: '定存利息', date: monthsAgoDay(1, 25, 10, 20), accountGroupId: '3' },
  { id: 'tmpl-24', description: '去年股利入帳', amount: 2600, type: 'income', category: '股利發放', date: yearOffsetDate(-1, 6, 15, 13, 0), accountGroupId: '2' },
  { id: 'tmpl-25', description: '去年旅遊支出', amount: 5400, type: 'expense', category: '休閒娛樂', date: yearOffsetDate(-1, 8, 20, 18, 45), accountGroupId: '1' },

  // Installment sample records for installment views and summaries.
  { id: 'tmpl-inst-1', description: '手機分期', amount: 1200, type: 'expense', category: '分期', date: monthsAgoDay(1, 15, 12, 0), accountGroupId: '1', installmentId: 'tmpl-inst-phone', installmentPeriod: 1, installmentCount: 3 },
  { id: 'tmpl-inst-2', description: '手機分期', amount: 1200, type: 'expense', category: '分期', date: monthsAgoDay(0, 15, 12, 0), accountGroupId: '1', installmentId: 'tmpl-inst-phone', installmentPeriod: 2, installmentCount: 3 },
  { id: 'tmpl-inst-3', description: '手機分期', amount: 1200, type: 'expense', category: '分期', date: monthsAgoDay(0, 28, 12, 0), accountGroupId: '1', installmentId: 'tmpl-inst-phone', installmentPeriod: 3, installmentCount: 3 }
];
