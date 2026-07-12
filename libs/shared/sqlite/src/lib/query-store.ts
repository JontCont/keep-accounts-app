import { AccountGroup, Transaction } from '@keep-accounts-app/domain';

export interface HistoryPageQuery {
  transactions: Transaction[];
  filterType: 'all' | 'income' | 'expense' | 'installment';
  filterGroup: string;
  offset: number;
  pageSize: number;
}

export interface HistoryPageResult {
  items: Transaction[];
  hasMore: boolean;
  nextOffset: number;
}

export const queryHistoryPage = ({
  transactions,
  filterType,
  filterGroup,
  offset,
  pageSize,
}: HistoryPageQuery): HistoryPageResult => {
  const flatTypeFilter = filterType === 'installment' ? 'all' : filterType;
  const filtered = transactions
    .filter((tx) => flatTypeFilter === 'all' || tx.type === flatTypeFilter)
    .filter((tx) => filterGroup === 'all' || tx.accountGroupId === filterGroup)
    .sort((a, b) => b.date.localeCompare(a.date));

  const safeOffset = Math.max(0, offset);
  const safePageSize = Math.max(1, pageSize);
  const items = filtered.slice(safeOffset, safeOffset + safePageSize);
  const nextOffset = safeOffset + items.length;

  return {
    items,
    hasMore: nextOffset < filtered.length,
    nextOffset,
  };
};

export interface StatsAggregationQuery {
  transactions: Transaction[];
  accountGroups: AccountGroup[];
  statsGroup: string;
}

export interface StatsCategoryBucket {
  name: string;
  emoji: string;
  color: string;
  amount: number;
}

export interface StatsTrendPoint {
  date: string;
  amount: number;
}

export interface StatsAggregationResult {
  totalCount: number;
  totalExpense: number;
  categories: StatsCategoryBucket[];
  trend: StatsTrendPoint[];
}

export const queryStatsAggregates = ({
  transactions,
  accountGroups,
  statsGroup,
}: StatsAggregationQuery): StatsAggregationResult => {
  const scopedExpenses = transactions.filter(
    (tx) =>
      tx.type === 'expense' &&
      (statsGroup === 'all' || tx.accountGroupId === statsGroup)
  );

  const totalExpense = scopedExpenses.reduce((sum, tx) => sum + tx.amount, 0);

  let categories: StatsCategoryBucket[] = [];
  if (statsGroup === 'all') {
    const categoryMap = scopedExpenses.reduce<
      Record<string, { amount: number; emoji: string; color: string }>
    >((acc, tx) => {
      if (!acc[tx.category]) {
        let emoji = '🏷️';
        let color = '#6b7280';
        const group = accountGroups.find((g) => g.id === tx.accountGroupId);
        const category = group?.categories.find((c) => c.name === tx.category);
        if (category) {
          emoji = category.emoji;
          color = category.color;
        }
        acc[tx.category] = { amount: 0, emoji, color };
      }
      acc[tx.category].amount += tx.amount;
      return acc;
    }, {});

    categories = Object.entries(categoryMap)
      .map(([name, value]) => ({ name, ...value }))
      .sort((a, b) => b.amount - a.amount);
  } else {
    const selectedGroup = accountGroups.find((g) => g.id === statsGroup);
    const groupCategories =
      selectedGroup?.categories.filter((c) => c.type === 'expense') ?? [];
    const expenseMap = scopedExpenses.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.category] = (acc[tx.category] ?? 0) + tx.amount;
      return acc;
    }, {});

    categories = groupCategories
      .map((cat) => ({
        name: cat.name,
        emoji: cat.emoji,
        color: cat.color,
        amount: expenseMap[cat.name] ?? 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }

  const dailyMap = scopedExpenses.reduce<Record<string, number>>((acc, tx) => {
    const dateKey = tx.date.substring(0, 10);
    acc[dateKey] = (acc[dateKey] ?? 0) + tx.amount;
    return acc;
  }, {});

  const trend = Object.entries(dailyMap)
    .map(([date, amount]) => ({ date, amount }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalCount: scopedExpenses.length,
    totalExpense,
    categories,
    trend,
  };
};
