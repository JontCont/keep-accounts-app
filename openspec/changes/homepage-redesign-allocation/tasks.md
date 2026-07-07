<!--
Each task description MUST state:
- the behavior or contract being delivered (what is observably true when the
  task is complete), and
- the verification target that proves completion (test, CLI invocation,
  analyzer check, manual assertion, or content review).

File paths are supporting context for locating the work, never the task
itself. "Edit file X" is not a valid task — it is missing both behavior and
verification.
-->

## 1. Homepage Balance Card and Filtering

- [x] 1.1 Period-Specific Income and Expense Display: Implement Decision: Add a "今日 / 本月" Toggle to the Top Balance Card in `apps/web/src/app/app.tsx`. When "今日" is active, show daily sums for income/expense; when "本月" is active, show monthly sums. Verification: Toggle between "今日" and "本月" in the browser and verify the calculated sums match the selected period while total balance is unchanged.
- [x] 1.2 Homepage Transaction List Filter: Implement Decision: Filter Homepage Transaction List to Today's Transactions in `apps/web/src/app/app.tsx`, rendering only transactions matching the current calendar day on the homepage. Verification: Verify in the browser that the dashboard transactions list only displays today's records.

## 2. Asset Allocation Visualization

- [x] 2.1 Display a Stacked Progress Bar for Asset Allocation: Implement Decision: Display a Stacked Progress Bar for Asset Allocation in `apps/web/src/app/app.tsx` to render a horizontal multi-segment bar representing each group's actual balance percentage relative to total assets. Verification: View the dashboard and confirm the stacked bar segments are proportional to actual account balances.
- [x] 2.2 Display Target Ratio vs Actual Ratio Progress Bars on Account Cards: Implement Decision: Display Target Ratio vs Actual Ratio Progress Bars on Account Cards in `apps/web/src/app/app.tsx` inside each account card to visualize current actual percentage relative to targetRatio, matching Asset Allocation Visualization. Verification: Confirm the cards display the actual vs target percentages and corresponding progress bar.

## 3. Account Group Editing and Validation

- [x] 3.1 Enforce 100% Target Ratio Sum Validation during Group Editing: Implement Decision: Enforce 100% Target Ratio Sum Validation during Group Editing in `apps/web/src/app/app.tsx` using local state `editingGroups` to track modifications. Verification: In edit mode, verify that entering targets summing to anything other than 100% disables the save button and shows a warning text, while entering targets summing to exactly 100% enables the button.
- [x] 3.2 Target Allocation Configuration and Validation Saving: Complete saving of targetRatio values to state and persist in localStorage when clicking the enabled save button, fulfilling Target Allocation Configuration and Validation. Verification: Save changes with a valid sum, reload the page, and check localStorage to confirm new target ratios are persisted.

## 4. Tests and Code Quality

- [x] 4.1 Update tests for custom allocation: Update unit tests in `apps/web/src/app/app.spec.tsx` to cover the default target ratio migrations, period-specific sums, and target ratio validation. Verification: Run `npm run test` or `npx vitest run apps/web/src/app/app.spec.tsx` and confirm all tests pass.
