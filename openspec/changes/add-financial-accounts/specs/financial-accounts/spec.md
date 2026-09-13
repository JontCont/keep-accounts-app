## Purpose

Define financial accounts as the source or destination of money independently from allocation groups. This capability provides account management, transaction linkage, derived balances, and non-P&L transfers for bank accounts, credit cards, and cash.

## ADDED Requirements

### Requirement: Financial account management

The system SHALL allow users to create and edit financial accounts with a non-empty name, a type of `bank`, `credit-card`, or `cash`, and a finite opening amount. The system SHALL group accounts by type under Bank Accounts, Credit Cards, and Cash without persisting a separate user-editable group entity.

#### Scenario: Create accounts in derived groups

- **WHEN** a user creates "Cathay Checking" with type `bank` and opening amount 20000 and creates "Taishin Card" with type `credit-card` and opening amount 0
- **THEN** the system persists both accounts and displays them under Bank Accounts and Credit Cards respectively

#### Scenario: Reject invalid account data

- **WHEN** a user submits a blank name, an unsupported type, or a non-finite opening amount
- **THEN** the system displays a specific validation error and leaves account state and persistence unchanged

### Requirement: Referenced account lifecycle

The system SHALL allow permanent deletion only for a financial account that no transaction references. The system SHALL allow a referenced account to be archived, SHALL exclude archived accounts from new transaction selectors, and SHALL retain its name in existing transaction history.

#### Scenario: Archive a referenced account

- **WHEN** a user attempts to remove a financial account referenced by an existing transaction
- **THEN** the system offers archival instead of permanent deletion and existing transaction rows continue to display the account name

#### Scenario: Delete an unreferenced account

- **WHEN** a user deletes a financial account that no transaction references
- **THEN** the system permanently removes that account

### Requirement: Income and expense account linkage

Every newly created income or expense transaction MUST reference one active financial account independently from its allocation group and category. A legacy transaction without a financial account reference SHALL remain readable, SHALL display "Unspecified account", and SHALL affect no financial account balance.

#### Scenario: Record a credit-card expense

- **WHEN** a user records a 500 expense in the Food category of the Daily Expenses allocation group and selects "Taishin Card"
- **THEN** the system stores both the allocation group reference and the financial account reference on the transaction

#### Scenario: No active financial account exists

- **WHEN** a user attempts to create an income or expense and no active financial account exists
- **THEN** the system displays an account-creation action and prevents transaction submission

#### Scenario: Edit a legacy transaction

- **WHEN** a user edits and submits a legacy income or expense that has no financial account reference
- **THEN** the system requires the user to select an active financial account before saving the edited transaction

### Requirement: Financial account transfer

A new transfer MUST store one source financial account and one different destination financial account in a single transaction. The transfer SHALL update both account summaries and SHALL NOT affect allocation, budget, income, expense, or profit-and-loss totals.

#### Scenario: Pay a credit card from a bank account

- **WHEN** a user transfers 500 from "Cathay Checking" to "Taishin Card"
- **THEN** the system decreases the bank balance by 500, decreases the credit-card outstanding amount by 500, and does not add income or expense

#### Scenario: Transfer between asset accounts

- **WHEN** a user transfers 1000 from one bank account to a different bank or cash account
- **THEN** the system decreases the source balance by 1000 and increases the destination balance by 1000 without changing profit-and-loss totals

#### Scenario: Reject an invalid transfer

- **WHEN** a transfer has a missing account, identical source and destination accounts, or an amount that is not positive
- **THEN** the system displays a specific validation error and persists no transaction

### Requirement: Derived account amounts

The system SHALL derive each financial account amount by replaying its opening amount and all linked transactions in chronological order with transaction ID as a stable tie-breaker. For bank and cash accounts, income and inbound transfers SHALL increase the balance while expenses and outbound transfers SHALL decrease it. For credit cards, expenses and outbound transfers SHALL increase outstanding debt while income and inbound transfers SHALL decrease it.

#### Scenario: Credit-card purchase followed by payment

- **WHEN** "Cathay Checking" starts at 20000, "Taishin Card" starts at 0, a 500 expense is charged to the card, and 500 is transferred from the bank to the card
- **THEN** the derived bank balance is 19500, the derived card outstanding amount is 0, and total expense is 500

##### Example: Purchase and payment ledger

| Step | Cathay Checking | Taishin Card outstanding | P&L expense |
| ----- | --------------- | ------------------------- | ----------- |
| Opening | 20000 | 0 | 0 |
| Card expense 500 | 20000 | 500 | 500 |
| Bank-to-card transfer 500 | 19500 | 0 | 500 |

#### Scenario: Credit-card overpayment

- **WHEN** inbound payments or refunds reduce a credit-card amount below zero
- **THEN** the system displays the absolute value as a card credit balance instead of truncating the amount to zero

#### Scenario: Native balance uses complete history

- **WHEN** native persistence contains more transactions than the recent in-memory cache
- **THEN** the system derives account amounts from the complete SQLite history rather than the recent cache

### Requirement: Installment account linkage

Each transaction generated for an installment purchase SHALL retain the selected financial account reference and SHALL affect that account only on the generated transaction date. The system SHALL NOT introduce a separate future-liability calculation in this capability.

#### Scenario: Generate three card installments

- **WHEN** a user records a 3000 three-period installment purchase using "Taishin Card"
- **THEN** the system creates three 1000 expense transactions linked to "Taishin Card", each affecting outstanding debt on its existing installment date

### Requirement: Financial account persistence compatibility

Financial accounts and transaction account references SHALL round-trip through localStorage snapshots, backups, restores, and native SQLite persistence. Loading data without a financial-accounts collection or without transaction account fields SHALL normalize the collection to empty and the references to unspecified without failing or guessing an account.

#### Scenario: Load a legacy snapshot

- **WHEN** the system loads a snapshot containing allocation groups and transactions but no financial-accounts collection or transaction account references
- **THEN** it preserves the existing data, initializes financial accounts as empty, and leaves every legacy transaction unspecified

#### Scenario: Migrate an existing SQLite database

- **WHEN** the application opens a database created before financial-account support
- **THEN** it creates the financial-accounts table and nullable transaction account columns without deleting or reassigning existing rows

### Requirement: Financial account identity in history

Transaction history SHALL display the linked financial account name for income and expense rows and SHALL display source name followed by destination name for transfer rows. Missing or unresolved references SHALL display "Unspecified account" without preventing the history view from loading.

#### Scenario: Display account identities

- **WHEN** history contains a card expense, a bank-to-card transfer, and a legacy transaction
- **THEN** their account labels are "Taishin Card", "Cathay Checking → Taishin Card", and "Unspecified account" respectively
