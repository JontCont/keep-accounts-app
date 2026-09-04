## MODIFIED Requirements

### Requirement: Account Group Target and Reached Dollar Amount Display
Each account group card MUST display the computed current-month target dollar amount, the current-month used expense amount, and the current-month remaining balance. The target amount is calculated as `totalMonthlyBoundIncome * (targetRatio / 100)`. The used expense amount is the sum of current month's expenses for that group. The remaining balance SHALL be `targetAmount - usedExpenseAmount`.

#### Scenario: Display current month budget and remaining balance on card
- **WHEN** the Dashboard Tab calculates account group card statistics for the active month
- **THEN** each non-source account group card SHALL display `目標 {targetRatio}% (${targetAmount})`
- **AND** the card SHALL display the current month used expense `${usedExpense}`
- **AND** the card SHALL display the current month remaining balance `${remainingAmount}`

##### Example: Current month budget and remaining calculation
- **GIVEN** current month bound income is $100,000
- **AND** Daily Expense account group has target ratio 30% and current month expenses of $4,814
- **WHEN** rendering the Daily Expense account group card
- **THEN** target budget SHALL be $30,000
- **AND** current month used expense SHALL be $4,814
- **AND** current month remaining balance SHALL be $25,186 ($30,000 - $4,814)
