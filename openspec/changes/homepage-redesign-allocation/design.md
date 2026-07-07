## Context

The Keep Accounts App is a React 19 web application. Currently, the dashboard homepage displays the total balance (derived from total income minus total expense) and a simple list of accounts (account groups) with no visual representation of target asset allocation rules (like the 333 rule). Additionally, the dashboard displays all historical transactions, which clutters the homepage view.

## Goals / Non-Goals

**Goals:**
- Provide a clear asset allocation dashboard widget containing a stacked bar chart of actual allocations and target vs actual progress bars on each account group.
- Allow users to set target percentages for each account group and enforce that the sum of these target percentages equals exactly 100% to successfully save.
- Filter the homepage balance card flow stats (income and expense) and the transactions list by the current day.
- Support toggling the homepage flow stats to a monthly view while keeping the asset allocation and total balance views based on lifetime totals.

**Non-Goals:**
- Applying the 333 rule to transaction history view or the statistics tab.
- Supporting asset allocation targets that sum to values other than 100%.

## Decisions

### Decision: Add a "今日 / 本月" Toggle to the Top Balance Card
The homepage balance card will be updated to include a button-style toggle switch for "今日" (Today) and "本月" (This Month).
- When "今日" is selected, the income and expense sums will be calculated using transactions from the current calendar date (using `YYYY-MM-DD` formatting).
- When "本月" is selected, they will be calculated using transactions from the current calendar month (using `YYYY-MM` formatting).
- The total balance will always show the lifetime cumulative sum across all transactions to represent current net worth.

*Alternatives considered:*
- Storing the toggle state globally in localStorage: Decided against because it is simple view-state specific to the dashboard tab.

### Decision: Filter Homepage Transaction List to Today's Transactions
The transaction list rendered at the bottom of the dashboard page will be filtered to display only transactions where `tx.date` matches the current day's date (`new Date().toISOString().split('T')[0]`). The full transaction history will remain accessible on the dedicated "歷史明細" (History) tab.

*Alternatives considered:*
- Showing the last 5 transactions: Decided against because the user explicitly wants to focus the homepage on today's transactions.

### Decision: Display a Stacked Progress Bar for Asset Allocation
At the top of the "資金分配與大項帳戶" widget, we will render a horizontal stacked bar. The width of each segment in the bar will represent `(groupBalance / totalAssets) * 100` for groups with a positive balance. The segment colors will match the configured group colors.

*Alternatives considered:*
- Using a circular pie chart: Decided against since a horizontal stacked progress bar is more compact and aligns better with the linear layout of the dashboard cards.

### Decision: Display Target Ratio vs Actual Ratio Progress Bars on Account Cards
Each account group card on the dashboard will render:
- The actual percentage of total assets: `(groupBalance / totalAssets) * 100`.
- The target percentage: `group.targetRatio` (defaulting to 30% for Daily Expense, 30% for Investment, and 40% for Long-term Savings during initial load/migration).
- A linear progress bar representing the comparison: `(actualPercentage / targetPercentage) * 100` with the percentage label.

*Alternatives considered:*
- Showing actual percentage only: Decided against since comparing actual vs target is the core requirement of the custom asset allocation rules.

### Decision: Enforce 100% Target Ratio Sum Validation during Group Editing
We will update the account group editor in the UI. Instead of saving changes to `accountGroups` dynamically on input change, we will maintain a temporary local copy of the groups (`editingGroups`) in state while `isEditingGroups` is true.
- A new numeric input field for "目標配比 (%)" will be added to the editing panel for each group.
- We will compute the sum of target ratios across all groups in `editingGroups`.
- If the sum is not exactly 100%, we will show a red warning text: `⚠️ 目標比例加總必須為 100%（目前: X%）`, and disable the "完成編輯" save button.
- The button is only enabled when the sum is exactly 100%, at which point clicking it commits `editingGroups` to `accountGroups` and saves it to localStorage.

*Alternatives considered:*
- Autosaving and showing a non-blocking toast warning: Rejected because the user explicitly requested blocking saves for invalid configurations.

## Implementation Contract

- **Observable Behavior**:
  - The homepage dashboard balance card shows a toggle: "今日" and "本月".
  - The homepage only shows today's transactions.
  - A stacked bar is rendered above the accounts list.
  - Each account group card shows the actual asset percentage, target percentage, and progress bar comparing the two.
  - Clicking "編輯帳戶" opens the edit mode. The "完成編輯" button is disabled if the sum of target ratios does not equal 100%.

- **Interface and Data Shape**:
  - `AccountGroup` interface updated:
    ```typescript
    interface AccountGroup {
      id: string;
      name: string;
      emoji: string;
      color: string;
      categories: Category[];
      description?: string;
      budget?: number;
      targetRatio?: number; // Target asset allocation percentage (e.g., 30)
    }
    ```
  - LocalStorage structure: `keep_accounts_groups` contains the serialized array of `AccountGroup` objects including `targetRatio`.

- **Failure Modes**:
  - If no target ratios exist in parsed localStorage data, the migration step must assign default target ratios: Group '1' -> 30%, Group '2' -> 30%, Group '3' -> 40%.
  - Non-numeric input in target ratios must be parsed as 0.

- **Acceptance Criteria**:
  - App compiles successfully without TypeScript errors.
  - Target ratios sum check strictly blocks exiting edit mode if the total target ratio is not 100%.
  - Dashboard layout displays the stacked bar and card-level progress bars correctly.

## Risks / Trade-offs

- **[Risk] Existing users with customized groups list**: If a user has deleted default groups or created new ones, default target ratios might not sum to 100%.
  - *Mitigation*: The migration logic must check if the sum of existing groups' target ratios equals 100%. If not, it should reset/assign balanced ratios (e.g., distributing 100% evenly across the existing groups) so they start in a valid state.
