import type { Transaction } from '@keep-accounts-app/domain';

export interface KeepAccountsWidgetSummary {
  totalBalance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  updatedAt: string;
}

export const createWidgetSummary = (
  transactions: Transaction[],
  referenceDate: Date = new Date()
): KeepAccountsWidgetSummary => {
  const today = referenceDate.toISOString().slice(0, 10);
  const currentMonth = today.slice(0, 7);
  const realizedTransactions = transactions.filter(
    (transaction) => transaction.date.slice(0, 10) <= today
  );

  const totalIncome = realizedTransactions
    .filter((transaction) => transaction.type === 'income')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const totalExpense = realizedTransactions
    .filter((transaction) => transaction.type === 'expense')
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyIncome = transactions
    .filter(
      (transaction) =>
        transaction.type === 'income' && transaction.date.startsWith(currentMonth)
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);
  const monthlyExpense = transactions
    .filter(
      (transaction) =>
        transaction.type === 'expense' && transaction.date.startsWith(currentMonth)
    )
    .reduce((sum, transaction) => sum + transaction.amount, 0);

  return {
    totalBalance: totalIncome - totalExpense,
    monthlyIncome,
    monthlyExpense,
    updatedAt: referenceDate.toISOString(),
  };
};