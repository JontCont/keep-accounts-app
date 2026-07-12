import React from 'react';
import { AccountGroup, InstallmentReminderConfig, Transaction } from '@keep-accounts-app/domain';
import { TransactionModal } from './TransactionModal';

interface TransactionEntryPageProps {
  isOpen: boolean;
  editingTx: Transaction | null;
  accountGroups: AccountGroup[];
  initialTab?: 'basic' | 'installment';
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
    } | null
  ) => void;
}

export const TransactionEntryPage: React.FC<TransactionEntryPageProps> = ({
  isOpen,
  editingTx,
  accountGroups,
  initialTab = 'basic',
  incomeLocked = false,
  incomeLockMessage = '請先完成首次設定引導。',
  onClose,
  onSave,
}) => {
  return (
    <TransactionModal
      isOpen={isOpen}
      onClose={onClose}
      editingTx={editingTx}
      accountGroups={accountGroups}
      initialTab={initialTab}
      incomeLocked={incomeLocked}
      incomeLockMessage={incomeLockMessage}
      presentation="page"
      showHeaderTitle={false}
      onSave={onSave}
    />
  );
};
