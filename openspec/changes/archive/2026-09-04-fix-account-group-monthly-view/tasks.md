## 1. Implementation

- [x] 1.1 Update `DashboardTab.tsx` account group card rendering for `Account Group Target and Reached Dollar Amount Display` by applying decision `Shift Account Group Card Display to Current Month Budget and Expense Metrics`, calculating current month target budget, current month used expenses, and current month remaining balance (`targetAmount - usedExpense`). Verified by running `npx vitest run apps/web/src/app/components/DashboardTab.spec.tsx`.
- [x] 1.2 Confirm decision `Preserve Lifetime Net Balance for Total Assets Header` in `DashboardTab.tsx` so that `displayTotalBalance` continues computing total net worth across all realized transactions. Verified by component tests and UI balance header check.

## 2. Verification & Testing

- [x] 2.1 Update unit tests in `apps/web/src/app/components/DashboardTab.spec.tsx` to assert that historical expenses from past months do not reduce the current month account group card remaining balance, validating `Account Group Target and Reached Dollar Amount Display`. Verified by running `npx vitest run apps/web/src/app/components/DashboardTab.spec.tsx`.
