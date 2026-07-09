# allocation-mode-switch Specification

## Purpose

TBD - created by archiving change 'allocation-mode-switch'. Update Purpose after archive.

## Requirements

### Requirement: Allocation Source Category Binding
The Group Settings Modal MUST render a checklist of all available income categories, allowing the user to multi-select which categories are bound to the allocation target ratio calculations. The selected categories SHALL be persisted.

#### Scenario: User toggles bound categories in settings
- **WHEN** the user checks a category in the settings checklist
- **THEN** it SHALL be added to the list of bound allocation categories
- **WHEN** the user unchecks a category in the settings checklist
- **THEN** it SHALL be removed from the list of bound allocation categories


<!-- @trace
source: allocation-mode-switch
updated: 2026-07-09
code:
  - apps/web/src/app/services/backup.ts
  - apps/web/src/app/components/DashboardTab.tsx
  - apps/web/src/app/components/TransactionModal.tsx
  - apps/web/src/app/components/GroupSettingsModal.tsx
  - apps/web/src/app/app.tsx
  - libs/shared/state/src/lib/use-keep-accounts.ts
-->

---
### Requirement: Category-Bound Target Ratio Calculations
The Dashboard Tab SHALL calculate the allocation percentages based on the current month's income transactions that belong to the bound allocation categories. The total monthly allocation base is the sum of these transactions. The card main amount SHALL display the group's cumulative net balance.

#### Scenario: Calculations reflect only bound categories
- **WHEN** calculating target ratio progress on the Dashboard
- **THEN** the system SHALL sum only the current month's income transactions belonging to the bound categories
- **AND** the stacked progress bar and progress bar indicators SHALL reflect these ratios
- **AND** the cards SHALL display cumulative group balance amounts

##### Example: Summing only bound category income
- **GIVEN** bound categories are `['薪資工作']`
- **AND** account groups with the following transactions in the current month:
  | Group | Cumulative Balance | Category | Income Amount |
  | ----- | ------------------ | -------- | ------------- |
  | Daily | $25,000            | 薪資工作 | $15,000       |
  | Daily | $25,000            | 紅包他人 | $2,000        |
  | Save  | $40,000            | 薪資工作 | $20,000       |
  | Invest| $30,000            | 薪資工作 | $15,000       |
- **WHEN** calculating allocations on the Dashboard
- **THEN** the output values SHALL be:
  | Group | Displayed Card Amount | Calculated Income Flow | Actual Allocation Pct | Target Ratio |
  | ----- | --------------------- | ---------------------- | --------------------- | ------------ |
  | Daily | $25,000               | $15,000                | 30%                   | 30%          |
  | Save  | $40,000               | $20,000                | 40%                   | 40%          |
  | Invest| $30,000               | $15,000                | 30%                   | 30%          |
  *(Note: The $2,000 income under '紅包他人' is ignored because it is not in the bound categories list. Total bound income base = $50,000)*

<!-- @trace
source: allocation-mode-switch
updated: 2026-07-09
code:
  - apps/web/src/app/services/backup.ts
  - apps/web/src/app/components/DashboardTab.tsx
  - apps/web/src/app/components/TransactionModal.tsx
  - apps/web/src/app/components/GroupSettingsModal.tsx
  - apps/web/src/app/app.tsx
  - libs/shared/state/src/lib/use-keep-accounts.ts
-->