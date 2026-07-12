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
  isSource?: boolean;
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  category: string;
  date: string;
  accountGroupId: string; // Associated account group
  installmentId?: string; // Shared id linking all periods of one installment
  installmentPeriod?: number; // 1-based period number within the installment
  installmentCount?: number; // Total number of periods in the installment
}

export interface InstallmentReminderConfig {
  remindOnDueDate: boolean;
  notificationTitle: string;
  notificationBody: string;
}
