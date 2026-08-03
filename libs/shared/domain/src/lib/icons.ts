/**
 * Centralized Icon Registry for Keep Accounts App.
 * Single Source of Truth (SSOT) for icon alias mappings and available UI icons.
 */
export const ICON_ALIAS_MAP: Record<string, string> = {
  // Navigation Tabs
  'home': 'Home',
  'book-open': 'BookOpen',
  'bar-chart': 'BarChart2',
  'settings': 'Settings',

  // Account Groups
  'credit-card': 'CreditCard',
  'trending-up': 'TrendingUp',
  'piggy-bank': 'PiggyBank',
  'briefcase': 'Briefcase',

  // Actions
  'plus': 'Plus',
  'trash': 'Trash2',
  'edit': 'Edit2',
  'close': 'X',
  'database': 'Database',
  'download': 'Download',
  'upload': 'Upload',
  'refresh': 'RefreshCw',
  'check-circle': 'CheckCircle2',
  'alert-triangle': 'AlertTriangle',
  'layout-template': 'LayoutTemplate',
  'trash-2': 'Trash2',

  // Categories
  'shopping-cart': 'ShoppingCart',
  'coffee': 'Coffee',
  'car': 'Car',
  'film': 'Film',
  'arrow-up-right': 'ArrowUpRight',
  'arrow-down-left': 'ArrowDownLeft',
};

/**
 * List of available icons supported across the application.
 */
export const AVAILABLE_ICONS: string[] = Object.keys(ICON_ALIAS_MAP);
