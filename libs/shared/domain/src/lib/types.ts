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
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountGroupId: string; // Associated account group
}
