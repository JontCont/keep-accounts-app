## ADDED Requirements

### Requirement: Interactive Category Distribution Doughnut Chart
The system SHALL render a Recharts Pie Chart (in doughnut style) representing the percentage distribution of expenses by category within the selected account group. The color of each slice SHALL match the color property defined for the corresponding category.

#### Scenario: Slices match category distribution
- **WHEN** the user views the statistics tab with transactions present
- **THEN** the system renders a doughnut chart where each slice represents a category's percentage of total expense

##### Example: Two categories with expense data
- **GIVEN** transactions: Food ($150, color `#f59e0b`), Transport ($100, color `#3b82f6`)
- **WHEN** rendering the doughnut chart
- **THEN** the chart SHALL contain two slices: Food (60%, color `#f59e0b`) and Transport (40%, color `#3b82f6`)

#### Scenario: No expense data display message
- **WHEN** the user views the statistics tab and there are no expense transactions in the selected account group
- **THEN** the system SHALL NOT render the doughnut chart and SHALL display the message "目前尚無支出資料可進行統計分析"

### Requirement: Interactive Expense Trend Chart
The system SHALL render a Recharts Bar Chart representing the daily or monthly total expense trend. The X-axis SHALL represent the grouped time (dates or months) and the Y-axis SHALL represent the aggregate expense amount.

#### Scenario: Weekly daily aggregate trend rendering
- **WHEN** the user selects the daily trend view
- **THEN** the system renders a bar chart showing the sum of expenses grouped by each unique day in ascending order

##### Example: Grouping daily expenses
- **GIVEN** transactions: `2026-07-06` ($150), `2026-07-06` ($100), `2026-07-07` ($50)
- **WHEN** grouping by day
- **THEN** the chart X-axis SHALL show `2026-07-06` with Y-axis value $250, and `2026-07-07` with Y-axis value $50

### Requirement: View Switching and Category Details List
The system SHALL provide a tab or segmented control to switch the visible chart between "類別佔比" (Category Distribution) and "趨勢分析" (Trend Analysis). Below the active chart, the system SHALL render the list of categories with progress bars showing exact amounts and percentages.

#### Scenario: Toggle between views
- **WHEN** the user toggles between the chart tabs
- **THEN** the active chart view changes while the detailed category progress bars list remains visible below the charts
