## Why

Users currently lack a way to set financial boundaries or track their monthly spending against budget goals. Providing budget limit settings allows users to monitor their monthly expenses against predefined thresholds and receive clear warnings when they exceed these limits.

## What Changes

- Add a budget setting input field in the account group edit interface.
- Add a monthly budget display and visual progress bar (green to yellow to red warning color coding) in the dashboard card for each account group.
- Implement an alert/notification when a new transaction causes an account group's total monthly spending to exceed its set budget.
- Persist the budget limits in the account group structure stored in LocalStorage.

## Capabilities

### New Capabilities

- `budget-limits`: Allows users to set monthly budget limits for each account group, view their spending progress, and receive warnings when spending exceeds the budget.

### Modified Capabilities

(none)

## Impact

- Affected specs: `budget-limits`
- Affected code:
  - Modified:
    - `apps/web/src/app/app.tsx`
    - `apps/web/src/app/app.spec.tsx`
