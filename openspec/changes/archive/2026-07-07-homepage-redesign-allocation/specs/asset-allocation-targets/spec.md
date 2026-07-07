## ADDED Requirements

### Requirement: Period-Specific Income and Expense Display
The system SHALL provide a "今日 / 本月" (Today / This Month) toggle switch on the homepage balance card. When "今日" is active, the total income and total expense displays MUST show the sum of transactions for the current calendar day. When "本月" is active, they MUST show the sum of transactions for the current calendar month. The total balance display SHALL always show the lifetime total balance across all account groups regardless of the selected period.

#### Scenario: Toggling period view
- **WHEN** the user switches the period toggle from "今日" to "本月"
- **THEN** the total income and total expense update to reflect the monthly sums, while the total balance remains unchanged.

### Requirement: Homepage Transaction List Filter
The homepage transaction list SHALL only display transactions that occurred on the current calendar day.

#### Scenario: Displaying transactions on the homepage
- **WHEN** the homepage is loaded
- **THEN** the transactions list only contains transactions matching the current day's date.

### Requirement: Asset Allocation Visualization
The system SHALL render a stacked progress bar at the top of the "資金分配與大項帳戶" (Fund Allocation & Account Groups) widget, displaying the actual lifetime asset percentage of each account group. Each individual account group card SHALL render a progress bar displaying the ratio of actual percentage to the configured target percentage.

#### Scenario: Displaying actual vs target progress bars
- **WHEN** the dashboard is rendered
- **THEN** the stacked bar shows the actual distribution percentage of all groups, and each card shows the progress bar calculated as (actual percentage / target percentage).

### Requirement: Target Allocation Configuration and Validation
The system SHALL support configuring a target allocation percentage (targetRatio) for each account group. The group editing interface MUST prevent saving changes unless the sum of targetRatio values across all account groups is exactly 100%. If the sum is not 100%, the save button MUST be disabled and a validation warning message MUST be shown.

#### Scenario: Editing target ratios with invalid sum
- **WHEN** the user edits target ratios such that their sum does not equal 100%
- **THEN** the save button is disabled and a warning message is displayed showing the current sum.

#### Scenario: Saving target ratios with valid sum
- **WHEN** the user edits target ratios such that their sum equals exactly 100% and clicks save
- **THEN** the configuration is saved to state and persisted in localStorage, and the editing mode is closed.

##### Example: Valid and invalid target configurations
| Daily Expense Target | Investment Target | Savings Target | Total Sum | Valid (Save Enabled) |
| --- | --- | --- | --- | --- |
| 30 | 30 | 40 | 100 | Yes |
| 33 | 33 | 34 | 100 | Yes |
| 30 | 40 | 40 | 110 | No |
| 20 | 30 | 40 | 90 | No |
