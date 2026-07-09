## Why

To avoid confusing users with toggling between Month-Start Assets and Monthly Income calculations, we can unify the Dashboard view. By allowing users to bind specific income categories (e.g. Salary, Part-time Income) as the "Allocation Source", we can calculate the monthly allocation progress solely from these bound income flows, while displaying the actual cumulative net balance on each group card. This eliminates the need for a manual switcher and aligns with classic envelope budgeting.

## What Changes

- Add an "Allocation Source Categories" (配比基準分類) multi-select checklist in the Group Settings Modal, letting users choose which income categories participate in allocation calculations.
- Store the selected categories in `localStorage` under `keep_accounts_allocation_categories`. By default, include common salary/work categories.
- Remove the segmented switcher on the Dashboard Tab.
- On the Dashboard:
  - Account cards display the **cumulative net balance** of the group.
  - The stacked progress bar and target progress indicators calculate actual allocation percentages using only the **current month's income transactions belonging to the bound categories**.

## Capabilities

### New Capabilities

- `allocation-mode-switch`: Defines the category-bound allocation calculation logic and the Settings UI checkbox list for category bindings.

### Modified Capabilities

None.

## Impact

- `libs/shared/state/src/lib/use-keep-accounts.ts`: Introduce `allocationCategories` and `setAllocationCategories` state, persisting to `localStorage`.
- `apps/web/src/app/components/GroupSettingsModal.tsx`: Add a multi-select checklist card for binding income categories.
- `apps/web/src/app/components/DashboardTab.tsx`: Remove switcher, update calculations of progress bar and actual percentages based on bound categories, and keep card amounts displaying actual cumulative balances.
