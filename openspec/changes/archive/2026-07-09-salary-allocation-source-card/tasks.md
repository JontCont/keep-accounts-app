## 1. Dashboard rendering

- [x] 1.1 Render the Salary Allocation Source Card at the top of the account groups list in apps/web/src/app/components/DashboardTab.tsx, summing current-month income from bound `allocationCategories` as the "待分配總額" green +$ total. Verify by loading the Dashboard with the demo data and asserting the card shows the bound-category income sum in apps/web/src/app/app.spec.tsx.
- [x] 1.2 Compute and display the Per-Group Planned Allocation Amount on each group card as `round(totalToAllocate * targetRatio / 100)` with subtext "計畫分配 {targetRatio}% (${plannedAmount})", creating no transaction and mutating no balance. Verify with a test asserting a $45,000 source yields $13,500 / $13,500 / $18,000 for 30/30/40 groups and that transaction count and group balances are unchanged.
- [x] 1.3 Compute and display the Planned versus Actual Inflow Comparison on each group card as bound-category current-month income filed under that group, with subtext "實際流入 {actualPct}% (${actualAmount})". Verify with a test where a whole $45,000 paycheck filed under 日常開銷 shows 實際流入 $45,000 for 日常開銷 and $0 for the other two groups while their 計畫分配 stays $13,500/$18,000.

## 2. Settings wiring

- [x] 2.1 Ensure the Salary Allocation Source Card bound categories remain editable via the existing `allocationCategories` multi-select in apps/web/src/app/components/GroupSettingsModal.tsx, wired through apps/web/src/app/app.tsx and libs/shared/state/src/lib/use-keep-accounts.ts. Verify by toggling a category in settings and asserting the source-card total and per-group figures on the Dashboard recompute accordingly.

## 3. Verification

- [x] 3.1 Run the web unit tests to confirm the Salary Allocation Source Card, planned allocation, and actual inflow behaviors pass. Verify by running `npx nx test web` and confirming apps/web/src/app/app.spec.tsx is green.
