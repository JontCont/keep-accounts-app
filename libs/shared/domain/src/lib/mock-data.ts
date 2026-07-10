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
      { name: '股市投資', emoji: 'trending-down', color: '#6366f1', type: 'expense' }, // Indigo
      { name: '基金認購', emoji: 'landmark', color: '#a855f7', type: 'expense' },      // Purple
      { name: '投資理財', emoji: 'trending-up', color: '#3b82f6', type: 'expense' },   // Blue
      { name: '其他投資', emoji: 'tag', color: '#f97316', type: 'expense' },           // Orange
      { name: '投資收益', emoji: 'trending-up', color: '#84cc16', type: 'income' },    // Lime
      { name: '股利發放', emoji: 'dollar-sign', color: '#d97706', type: 'income' },    // Amber-Dark
      { name: '其他投資收入', emoji: 'tag', color: '#14b8a6', type: 'income' }         // Teal
    ]
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: '午餐牛肉麵', amount: 150, type: 'expense', category: '餐飲食品', date: getLocalISOString(), accountGroupId: '1' },
  { id: '2', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: getLocalISOString(), accountGroupId: '0' },
  { id: '3', description: '悠遊卡加值', amount: 200, type: 'expense', category: '交通出行', date: getLocalISOString(), accountGroupId: '1' },
  { id: '4', description: '購買美股 ETF', amount: 5000, type: 'expense', category: '投資理財', date: getLocalISOString(), accountGroupId: '2' },
  { id: '5', description: '定期存款存入', amount: 10000, type: 'income', category: '其他收入', date: getLocalISOString(), accountGroupId: '3' }
];
