import type { FC } from 'react';
import {
  AccountGroup,
  FinancialAccount,
  InstallmentReminderConfig,
  Transaction,
} from '@keep-accounts-app/domain';
import { TransactionModal } from './TransactionModal';

interface TransactionEntryPageProps {
  isOpen: boolean;
  editingTx: Transaction | null;
  accountGroups: AccountGroup[];
  financialAccounts?: FinancialAccount[];
  initialTab?: 'basic' | 'installment';
  initialType?: 'income' | 'expense';
  initialFinancialAccountId?: string;
  incomeLocked?: boolean;
  incomeLockMessage?: string;
  onClose: () => void;
  onSave: (
    description: string,
    amount: string,
    type: 'income' | 'expense' | 'transfer',
    category: string,
    date: string,
    accountGroupId: string,
    installment?: {
      periods: number;
      reminder: InstallmentReminderConfig;
    } | null,
    financialAccountId?: string,
    transferSourceFinancialAccountId?: string,
    transferDestinationFinancialAccountId?: string,
  ) => void;
  onCreateFinancialAccount?: () => void;
}

export const TransactionEntryPage: FC<TransactionEntryPageProps> = ({
  isOpen,
  editingTx,
  accountGroups,
  financialAccounts,
  initialTab = 'basic',
  initialType,
  initialFinancialAccountId,
  incomeLocked = false,
  incomeLockMessage = '請先完成首次設定引導。',
  onClose,
  onSave,
  onCreateFinancialAccount,
}) => {
  return (
    <TransactionModal
      isOpen={isOpen}
      onClose={onClose}
      editingTx={editingTx}
      accountGroups={accountGroups}
      financialAccounts={financialAccounts}
      initialTab={initialTab}
      initialType={initialType}
      initialFinancialAccountId={initialFinancialAccountId}
      incomeLocked={incomeLocked}
      incomeLockMessage={incomeLockMessage}
      onCreateFinancialAccount={onCreateFinancialAccount}
      onSave={onSave}
    />
  );
};
