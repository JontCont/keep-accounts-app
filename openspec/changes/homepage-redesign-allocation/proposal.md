## Why

Users currently lack a structured visual way to set and track custom asset allocation targets (such as the 333 or 343 rules) across their account groups. Additionally, there is no way to filter the homepage dashboard to show only today's transactions or period-specific income/expense flows, making it harder to get a clean daily overview.

## What Changes

- Add a "今日 / 本月" toggle switch to the homepage dashboard balance card to filter period-specific income and expense stats.
- Modify the bottom transactions list on the homepage to display only today's transactions.
- Implement a "資金分配與大項帳戶" widget that merges account groups with a custom asset allocation rule.
- Render a stacked progress bar showing the actual lifetime asset distribution percentage.
- Render actual vs target ratio progress bars on each account group card.
- Extend the account group editing interface to accept custom "目標佔比 %" (targetRatio) for each group.
- Enforce validation in the editing interface: the target ratio sum of all groups must equal exactly 100% to save changes, disabling the save button and showing a warning if invalid.

## Capabilities

### New Capabilities

- `asset-allocation-targets`: Allows users to customize asset allocation target percentages for each account group, visualizes actual vs target progress, enforces 100% sum validation, and updates the homepage layout to focus on period-specific stats and today's transactions.

### Modified Capabilities

(none)

## Impact

- Affected specs: `asset-allocation-targets`
- Affected code:
  - Modified:
    - `apps/web/src/app/app.tsx`
    - `apps/web/src/app/app.spec.tsx`
