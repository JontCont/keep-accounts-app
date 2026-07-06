## Context

The Keep Accounts web application allows users to manage multiple account groups (e.g., "日常開銷", "投資理財", "長期儲蓄") and record transactions under these groups. However, there is currently no way to set a limit on how much can be spent in each group per month. This design introduces a budget setting for each account group, computes the current month's spending against it, and presents warnings when approaching or exceeding the budget.

## Goals / Non-Goals

**Goals:**
- Add an optional numeric budget field to each account group.
- Provide a form control in the UI to view and edit this budget.
- Render visual feedback on the dashboard indicating how much of the budget has been spent.
- Alert the user immediately when a new or modified transaction exceeds the budget.

**Non-Goals:**
- Category-level budgeting (budgeting is strictly at the Account Group level).
- Multi-currency conversion or budgeting.
- Historical budget archiving (only the current month's budget is tracked).

## Decisions

### Extend AccountGroup Data Schema
The `AccountGroup` interface in `apps/web/src/app/app.tsx` will be extended with an optional `budget` property of type `number`. When storing and retrieving account groups to/from `localStorage`, this property will be serialized and deserialized automatically. If not set, it defaults to undefined or zero.

### Compute Current Month Expenses
To compute the total monthly spending for a group, we will filter all transactions where:
- The transaction `accountGroupId` matches the target group's ID.
- The transaction `type` is 'expense'.
- The transaction `date` matches the current year and month (derived from the current system date's `YYYY-MM` prefix).
This calculation will be run dynamically in the rendering lifecycle of the Dashboard component.

### Build Budget Input in Group Editor Form
A numeric input field labeled "每月預算" (Monthly Budget) will be added to the account group editing form. It will accept positive integers. When saving changes to an account group, the budget value from the form will be saved into the group's state.

### Implement Budget Warning UI and Colors
On the dashboard, for each account group that has a budget set (greater than zero), we will render:
- The current monthly spending and the budget limit in the format: `已用: $X / $Y`.
- A progress bar showing the percentage consumed.
- Progress bar colors:
  - Green (`#10b981`) for consumption < 80%
  - Yellow/Amber (`#f59e0b`) for consumption between 80% and 99.9%
  - Red (`#ef4444`) for consumption >= 100%

### Show Over-Budget Toast Alert
When a user adds a new transaction or updates an existing transaction, the system will check if the transaction is an expense and if its group has a budget set. If the total expenses for the current month in that group exceed the budget, and the transaction is saved, a standard browser alert or React modal dialog will be shown notifying the user that they have exceeded their budget.

## Implementation Contract

#### Observable Behavior
- In the Account Group editing dialog, users see a "每月預算" input field.
- On the dashboard, groups with budgets display their current monthly spending progress with color-coded bars.
- Saving a transaction that goes over budget triggers a popup alert: "提醒：日常開銷 已超出預算！(目前已支出 $1200 / 預算 $1000)".

#### Interface and Data Shape
- `AccountGroup` interface updated:
  ```typescript
  interface AccountGroup {
    id: string;
    name: string;
    emoji: string;
    color: string;
    categories: Category[];
    description?: string;
    budget?: number; // New optional field
  }
  ```

#### Failure Modes
- Non-numeric or negative budget inputs are rejected or parsed as zero/no-budget.
- If a transaction has an invalid date or is not in the current month, it is excluded from the budget progress calculations.

#### Acceptance Criteria
- App builds successfully via `npm run build` or `npx nx build web`.
- Budget is persisted in `localStorage` under `keep_accounts_groups`.
- The progress bar displays correct colors at <80%, >=80%, and >=100% budget usage.
- Over-budget warning alert is triggered upon saving an expense transaction that exceeds the limit.

#### Scope Boundaries
- **In Scope**: Budget configuration, dashboard progress UI, basic alert upon transaction saving.
- **Out of Scope**: Budgets spanning multiple months, custom budget reset cycles, email/push notifications.

## Risks / Trade-offs

- [Risk] LocalStorage schema mismatch for existing users -> [Mitigation] Fallback to default budget values or `undefined` when parsing legacy JSON that lacks the `budget` key.
- [Risk] Performance of recalculating expenses on every render -> [Mitigation] Since the transaction array size is small (< 1000 items), filtering on every render is negligible. If it becomes a bottleneck, use `React.useMemo`.
