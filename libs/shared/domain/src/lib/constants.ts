export const ACCOUNT_EMOJIS = ['credit-card', 'trending-up', 'piggy-bank', 'briefcase', 'home', 'car', 'plane', 'gift', 'shopping-cart', 'tag'];

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

export const STORAGE_KEYS = {
  ACCOUNTS: {
    GROUPS: 'keep_accounts_groups',
    TRANSACTIONS: 'keep_accounts_transactions',
  },
  SYSTEM: {
    IMPORT_HISTORY: 'keep_accounts_import_history',
  },
  SETTINGS: {
    THEME: 'keep_accounts_theme',
    PERIOD_VIEW: 'keep_accounts_period_view',
  },
} as const;
