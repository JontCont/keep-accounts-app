## ADDED Requirements

### Requirement: Four history filters are available
The system SHALL expose four history filters: 全部, 收入, 支出, and 分期.

#### Scenario: history page shows the installment filter
- **WHEN** the user opens the transaction history page
- **THEN** the system SHALL show the 分期 filter alongside 全部, 收入, and 支出

### Requirement: Flat transaction lists are read-only for installment transactions
The system SHALL treat installment transactions as read-only items in the 全部, 收入, and 支出 filters.
The system SHALL NOT show edit or delete actions for installment transactions in those filters.
The system SHALL still show installment transactions with an installment indicator so the user can identify them.

#### Scenario: installment rows do not expose edit or delete actions in flat filters
- **WHEN** the user views an installment transaction in 全部, 收入, or 支出
- **THEN** the system SHALL display the transaction as a read-only item
- **AND THEN** the system SHALL not show edit or delete actions for that installment transaction

### Requirement: Installment transactions are grouped in the 分期 filter
The system SHALL group installment transactions by installmentId in the 分期 filter.
The system SHALL present each installment group as a single management unit rather than as isolated transaction rows.
The system SHALL show the installment description and installment progress for each group.

#### Scenario: one installment group is displayed as one group card
- **GIVEN** three transactions share the same installmentId and have installmentPeriod values 1, 2, and 3
- **WHEN** the user opens the 分期 filter
- **THEN** the system SHALL display one installment group for those three transactions
- **AND THEN** the group SHALL show the installment description and the installment progress for the group

##### Example: grouped installment data
| transaction id | installmentId | installmentPeriod | installmentCount | description |
| --- | --- | --- | --- | --- |
| inst-1 | group-9 | 1 | 3 | 手機分期 |
| inst-2 | group-9 | 2 | 3 | 手機分期 |
| inst-3 | group-9 | 3 | 3 | 手機分期 |

- **WHEN** the user opens the 分期 filter
- **THEN** the system SHALL show one group for group-9 with progress 3/3

### Requirement: Installment groups support installment-specific management actions
The system SHALL provide installment-specific actions in the 分期 filter for each installment group.
The system SHALL allow the user to inspect the group contents, delete a single installment period, delete the entire group, and settle the remaining balance early from the installment management view.
The system SHALL NOT require the user to edit installment periods from the flat transaction filters to perform these actions.

#### Scenario: installment management happens from the group view
- **WHEN** the user opens an installment group in the 分期 filter
- **THEN** the system SHALL allow actions that apply to the whole group or to a single period within that group
- **AND THEN** the system SHALL not require the user to use 全部, 收入, or 支出 to manage the installment
