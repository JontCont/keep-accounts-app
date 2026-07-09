# allocation-income-block Specification

## Purpose

TBD - created by archiving change 'allocation-income-block'. Update Purpose after archive.

## Requirements

### Requirement: Total Income to Allocate Block
The Dashboard Tab MUST render a dedicated card at the top of the account groups list displaying the total allocation source income of the current month. The card SHALL display the title "本月待分配總額" and the subtext "已勾選之基準分類（如薪資）收入加總" alongside the formatted green sum prefixed with "+$".

#### Scenario: Display total allocation source income
- **WHEN** the Dashboard Tab is loaded
- **THEN** it SHALL render the "本月待分配總額" block
- **AND** the displayed amount SHALL match the sum of current month's income transactions from bound categories


<!-- @trace
source: allocation-income-block
updated: 2026-07-09
code:
  - apps/web/src/app/app.tsx
  - libs/shared/state/src/lib/use-keep-accounts.ts
  - apps/web/src/app/components/DashboardTab.tsx
  - apps/web/src/app/services/backup.ts
  - apps/web/src/app/components/GroupSettingsModal.tsx
  - apps/web/src/app/components/TransactionModal.tsx
tests:
  - apps/web/src/app/app.spec.tsx
-->

---
### Requirement: Account Group Target and Reached Dollar Amount Display
Each account group card's target ratio section MUST display the computed target dollar amount and the actual allocated dollar amount next to their respective percentages, rather than displaying only percentages. The target amount is calculated as `totalMonthlyBoundIncome * (targetRatio / 100)`. The actual allocated amount is the sum of bound monthly income for that group.

#### Scenario: Display dollar amounts on card subtext
- **WHEN** the Dashboard Tab calculates allocation statistics
- **THEN** the target ratio subtext SHALL display `目標 {targetRatio}% (${targetAmount})`
- **AND** the actual allocation subtext SHALL display `已分 {actualPct}% (${actualAmount})`

##### Example: Target and actual allocation dollar calculations
- **GIVEN** total monthly bound income is $50,000
- **AND** account groups with the following target ratios and actual bound monthly incomes:
  | Group | Target Ratio | Actual Bound Income |
  | ----- | ------------ | ------------------- |
  | Daily | 30%          | $15,000             |
  | Save  | 40%          | $20,000             |
  | Invest| 30%          | $15,000             |
- **WHEN** rendering the card subtexts
- **THEN** the calculated values SHALL be:
  | Group | Target Subtext | Actual Subtext |
  | ----- | -------------- | -------------- |
  | Daily | 目標 30% ($15,000) | 已分 30% ($15,000) |
  | Save  | 目標 40% ($20,000) | 已分 40% ($20,000) |
  | Invest| 目標 30% ($15,000) | 已分 30% ($15,000) |

<!-- @trace
source: allocation-income-block
updated: 2026-07-09
code:
  - apps/web/src/app/app.tsx
  - libs/shared/state/src/lib/use-keep-accounts.ts
  - apps/web/src/app/components/DashboardTab.tsx
  - apps/web/src/app/services/backup.ts
  - apps/web/src/app/components/GroupSettingsModal.tsx
  - apps/web/src/app/components/TransactionModal.tsx
tests:
  - apps/web/src/app/app.spec.tsx
-->