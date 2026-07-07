import { AccountGroup, Transaction } from './types';
import { getLocalISOString } from './utils';

export const ACCOUNT_EMOJIS = ['💳', '📈', '🐷', '💰', '💼', '🏠', '🚗', '✈️', '🎁', '🛒'];

export const ACCOUNT_COLORS = [
  '#6366f1', // Indigo
  '#3b82f6', // Blue
  '#10b981', // Teal
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#ec4899', // Pink
  '#8b5cf6', // Violet
  '#6b7280'  // Gray
];

export const DEFAULT_ACCOUNT_GROUPS: AccountGroup[] = [
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

export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: '1', description: '午餐牛肉麵', amount: 150, type: 'expense', category: '餐飲食品', date: getLocalISOString(), accountGroupId: '1' },
  { id: '2', description: '發放月薪', amount: 45000, type: 'income', category: '薪資收入', date: getLocalISOString(), accountGroupId: '1' },
  { id: '3', description: '悠遊卡加值', amount: 200, type: 'expense', category: '交通出行', date: getLocalISOString(), accountGroupId: '1' },
  { id: '4', description: '購買美股 ETF', amount: 5000, type: 'expense', category: '投資理財', date: getLocalISOString(), accountGroupId: '2' },
  { id: '5', description: '定期存款存入', amount: 10000, type: 'income', category: '其他收入', date: getLocalISOString(), accountGroupId: '3' }
];
