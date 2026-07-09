## ADDED Requirements

### Requirement: History List Grouping Switcher
The History tab SHALL display a grouping selector that allows the user to switch the list grouping between Year, Month, and Day.
The default selected grouping SHALL be Month.

#### Scenario: Switching grouping option
- **WHEN** the user selects the "Day" grouping option
- **THEN** the ledger list SHALL group transactions by calendar date
- **AND** show individual day headers

##### Example: Grouping selector options
- **GIVEN** grouping switcher rendering
- **WHEN** the user interacts with the switcher
- **THEN** the options "年", "月", and "日" are available for selection

### Requirement: Group Header with Subtotals
Each transaction group in the History tab SHALL display a formatted header and show the total income and total expense for that specific group.

#### Scenario: Displaying group header and totals
- **WHEN** transactions are grouped by month
- **THEN** the system SHALL display headers formatted as "YYYY年M月"
- **AND** render the sum of all income transactions and the sum of all expense transactions within that month inside the header

##### Example: Monthly group subtotal calculation
- **GIVEN** transactions in July 2026:
  | Description | Type | Amount | Date |
  | Lunch | expense | 150 | 2026-07-08 |
  | Salary | income | 45000 | 2026-07-08 |
  | Transport | expense | 200 | 2026-07-08 |
- **WHEN** grouped by month ("月")
- **THEN** the header for "2026年7月" SHALL display:
  - Total Income: +$45000
  - Total Expense: -$350
