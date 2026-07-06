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

## 1. Schema and Calculations

- [x] 1.1 Extend AccountGroup Data Schema: Update the `AccountGroup` interface in `apps/web/src/app/app.tsx` to include an optional `budget?: number` field. Verification: Run TypeScript compiler `npx tsc --noEmit` and confirm the project builds without errors.
- [x] 1.2 Compute Current Month Expenses: Implement a calculation helper in `apps/web/src/app/app.tsx` that filters and sums current month's expenses for an account group using dates formatted as `YYYY-MM-DD`. Verification: Add unit tests in `apps/web/src/app/app.spec.tsx` to verify calculations and run `npm run test` or `npx vitest run apps/web/src/app/app.spec.tsx`.

## 2. Budget Input UI

- [x] 2.1 Build Budget Input in Group Editor Form for Budget limit settings input: Add a numeric "Monthly Budget" input field in the account group edit view in `apps/web/src/app/app.tsx`. Saving updates the group's `budget` field in state and `localStorage`. Verification: Open the group editor, enter 1000, save, and verify `keep_accounts_groups` in local storage contains the key `budget` with value `1000`.

## 3. Progress Visualization and Alerts

- [x] 3.1 Implement Budget Warning UI and Colors for Budget status and progress visualization: Display the progress bar and spending ratio on dashboard cards in `apps/web/src/app/app.tsx` for groups with budgets. Differentiate colors: Green (<80%), Yellow (80%-99.9%), and Red (>=100%). Hide if budget is not set. Verification: Manually test with different spending amounts and verify progress colors change according to the defined thresholds.
- [x] 3.2 Show Over-Budget Toast Alert for Budget warning indicators: Trigger a warning alert dialog in `apps/web/src/app/app.tsx` when saving an expense transaction that causes the current month's spending to exceed the budget limit. Verification: Save an expense transaction that exceeds the limit and confirm the over-budget alert dialog displays.
