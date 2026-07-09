## Context

Instead of toggling between Month-Start Assets and Monthly Income, we can display the actual asset balance as the card amount while calculating target allocations based on specific income categories. This lets users specify which categories (e.g. Salary) represent regular allocatable income streams, excluding irregular flows (like gifts, red envelopes) from skewing targets.

## Goals / Non-Goals

**Goals:**
- Provide a multi-select checkbox list in the Group Settings Modal for selecting bound income categories.
- Calculate Dashboard target ratios using only the current month's income from these bound categories.
- Display actual cumulative balance on the Dashboard cards.
- Remove the manual mode switcher.

**Non-Goals:**
- No changes to database model schemas.
- No changes to other tab views (e.g. HistoryTab, StatsTab).

## Decisions

### Decision 1: Persisted State for Allocation Categories
- **Choice**: Store bound categories `allocationCategories: string[]` in the `useKeepAccounts` hook, persisting to `localStorage` under `keep_accounts_allocation_categories`.
- **Rationale**: Keeps the state synchronized and easily accessible by both the Settings Modal (for updates) and the Dashboard (for calculations).
- **Default**: `['薪資工作', '薪資收入', '薪水', '薪水收入']`.

### Decision 2: Checklist UI in Group Settings Modal
- **Choice**: Add a checklist card in `GroupSettingsModal.tsx` listing all unique income categories found in the account groups.
- **Rationale**: Group settings is where target ratios are configured, making it the most logical place to configure the calculation baseline categories.

### Decision 3: Simple Cumulative/Monthly Integration on Dashboard
- **Choice**: Remove the segmented switcher. Calculate target percentages directly using current month's bound income transactions, while displaying cumulative net balances as the main card values.
- **Rationale**: Displays total wealth (cumulative balance) next to monthly budgeting progress (ratio progress), giving a comprehensive overview without requiring toggles.

## Implementation Contract

### Behavior
- An "Allocation Source Categories" card is rendered inside the settings modal, containing a grid/list of checkbox inputs.
- Checking/unchecking updates target ratio calculations instantly.
- The Dashboard displays:
  - Main amount: Actual cumulative balance of the group.
  - Progress bar: Ratio of the current month's bound income for the group vs. total bound income.

### Interface / Data Shape
- **Hook State**:
  - `allocationCategories`: `string[]`
  - `setAllocationCategories`: `(cats: string[]) => void`
- **Dashboard Calculations**:
  - `totalMonthlyIncomeBase`: Sum of current month's income transactions belonging to `allocationCategories`.
  - `getGroupMonthlyIncome`: Sum of current month's income transactions in group $g$ belonging to `allocationCategories`.

### Acceptance Criteria
- Unit tests run successfully.
- Settings checklist correctly updates calculation progress.
