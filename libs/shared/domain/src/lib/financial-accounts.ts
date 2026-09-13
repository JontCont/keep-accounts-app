import { FinancialAccount, FinancialAccountSummary, Transaction } from './types';

export const FINANCIAL_ACCOUNT_TYPES = ['bank', 'credit-card', 'cash'] as const;

export const getFinancialAccountOpeningAmount = (account: FinancialAccount): number =>
  account.openingAmount +
  (account.openingAmountAdjustments ?? []).reduce((sum, adjustment) => sum + adjustment.amount, 0);

export const validateFinancialAccount = (account: FinancialAccount): string | null => {
  if (!account.name.trim()) {
    return '請輸入金融帳戶名稱。';
  }
  if (!FINANCIAL_ACCOUNT_TYPES.includes(account.type)) {
    return '金融帳戶類型無效。';
  }
  if (!Number.isFinite(account.openingAmount)) {
    return '初始金額必須是有效數字。';
  }
  if (account.type === 'credit-card') {
    for (const [label, day] of [
      ['結帳日', account.statementClosingDay],
      ['繳款日', account.paymentDueDay],
    ] as const) {
      if (
        day === undefined ||
        !Number.isInteger(day) ||
        day < 1 ||
        day > 31
      ) {
        return `${label}必須是 1 到 31 日。`;
      }
    }
  }
  return null;
};

export const validateFinancialAccountTransaction = (
  transaction: Pick<
    Transaction,
    | 'type'
    | 'financialAccountId'
    | 'transferSourceFinancialAccountId'
    | 'transferDestinationFinancialAccountId'
  >,
  accounts: FinancialAccount[]
): string | null => {
  const accountsById = new Map(accounts.map((account) => [account.id, account]));
  const isActiveAccount = (accountId: string | undefined) => {
    const account = accountId ? accountsById.get(accountId) : undefined;
    return !!account;
  };

  if (transaction.type === 'transfer') {
    if (!transaction.transferSourceFinancialAccountId || !transaction.transferDestinationFinancialAccountId) {
      return '轉帳需要選擇來源與目的金融帳戶。';
    }
    if (
      transaction.transferSourceFinancialAccountId ===
      transaction.transferDestinationFinancialAccountId
    ) {
      return '來源與目的金融帳戶必須不同。';
    }
    if (
      !isActiveAccount(transaction.transferSourceFinancialAccountId) ||
      !isActiveAccount(transaction.transferDestinationFinancialAccountId)
    ) {
      return '來源與目的金融帳戶必須是有效帳戶。';
    }
    return null;
  }

  if (transaction.type === 'income' || transaction.type === 'expense') {
    if (!transaction.financialAccountId) {
      return '請選擇金融帳戶。';
    }
    if (!isActiveAccount(transaction.financialAccountId)) {
      return '請選擇有效的金融帳戶。';
    }
  }

  return null;
};

const sortTransactions = (transactions: Transaction[]) =>
  [...transactions].sort((left, right) => {
    const dateDifference = new Date(left.date).getTime() - new Date(right.date).getTime();
    if (dateDifference !== 0) {
      return dateDifference;
    }
    return left.id.localeCompare(right.id);
  });

const applyAccountDelta = (
  account: FinancialAccount,
  currentAmount: number,
  direction: 'in' | 'out',
  transactionAmount: number
) => {
  const increasesAmount = account.type !== 'credit-card';
  const shouldIncrease = direction === 'in' ? increasesAmount : !increasesAmount;
  return currentAmount + (shouldIncrease ? transactionAmount : -transactionAmount);
};

export const calculateFinancialAccountSummaries = (
  accounts: FinancialAccount[],
  transactions: Transaction[]
): FinancialAccountSummary[] => {
  const amounts = new Map(
    accounts.map((account) => [account.id, getFinancialAccountOpeningAmount(account)])
  );

  for (const transaction of sortTransactions(transactions)) {
    if (transaction.effect === 'pnl') {
      continue;
    }

    if (transaction.type === 'income' || transaction.type === 'expense') {
      const accountId = transaction.financialAccountId;
      const account = accounts.find((candidate) => candidate.id === accountId);
      if (!account || !amounts.has(account.id)) {
        continue;
      }

      const direction = transaction.type === 'income' ? 'in' : 'out';
      amounts.set(
        account.id,
        applyAccountDelta(account, amounts.get(account.id) as number, direction, transaction.amount)
      );
      continue;
    }

    if (transaction.type === 'transfer') {
      const sourceAccount = accounts.find(
        (account) => account.id === transaction.transferSourceFinancialAccountId
      );
      const destinationAccount = accounts.find(
        (account) => account.id === transaction.transferDestinationFinancialAccountId
      );

      if (sourceAccount && amounts.has(sourceAccount.id)) {
        amounts.set(
          sourceAccount.id,
          applyAccountDelta(
            sourceAccount,
            amounts.get(sourceAccount.id) as number,
            'out',
            transaction.amount
          )
        );
      }
      if (destinationAccount && amounts.has(destinationAccount.id)) {
        amounts.set(
          destinationAccount.id,
          applyAccountDelta(
            destinationAccount,
            amounts.get(destinationAccount.id) as number,
            'in',
            transaction.amount
          )
        );
      }
    }
  }

  return accounts.map((account) => {
    const rawAmount = amounts.get(account.id) ?? account.openingAmount;
    if (account.type !== 'credit-card') {
      return {
        accountId: account.id,
        amount: rawAmount,
        status: 'balance',
      };
    }

    return {
      accountId: account.id,
      amount: Math.abs(rawAmount),
      status: rawAmount < 0 ? 'credit' : 'outstanding',
    };
  });
};
