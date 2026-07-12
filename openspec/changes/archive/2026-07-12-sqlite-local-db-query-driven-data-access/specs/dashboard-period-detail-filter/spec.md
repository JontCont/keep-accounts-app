## MODIFIED Requirements

### Requirement: Dashboard detail list follows the selected period
The Dashboard tab SHALL filter the detail list with the active period toggle so the list matches the summary above it, regardless of whether transaction data is sourced from full in-memory arrays or query-driven persistence.

#### Scenario: Today shows only today’s transactions
- **WHEN** the user selects the "今日" period
- **THEN** the detail list SHALL show only transactions whose date is today in the local calendar

#### Scenario: Month shows the current calendar month
- **WHEN** the user selects the "本月" period
- **THEN** the detail list SHALL show all transactions whose date is within the current calendar month in the local calendar

#### Scenario: Summary and detail use the same period state
- **WHEN** the user switches between "今日" and "本月"
- **THEN** the summary values and the detail list SHALL update from the same period selection without requiring any additional filter change

##### Example: month filter includes earlier days in the same month
- **GIVEN** today is 2026-07-12
- **AND** the dashboard has transactions on 2026-07-01, 2026-07-11, and 2026-07-12
- **WHEN** the user selects "本月"
- **THEN** the detail list SHALL show all three transactions in date-descending order

##### Example: today filter excludes earlier days in the same month
- **GIVEN** today is 2026-07-12
- **AND** the dashboard has transactions on 2026-07-11 and 2026-07-12
- **WHEN** the user selects "今日"
- **THEN** the detail list SHALL show only the 2026-07-12 transaction
