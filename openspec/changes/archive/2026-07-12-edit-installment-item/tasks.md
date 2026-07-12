## 1. Installment period edit entry in history view

- [x] 1.1 Implement Requirement: Installment period rows SHALL support direct item editing by adding an edit action for each period row in apps/web/src/app/components/HistoryTab.tsx that routes the selected period transaction to existing edit flow; verify by manual assertion that clicking period 2 edit opens TransactionModal populated with period 2 data.
- [x] 1.2 Implement Decision: Reuse the existing transaction modal for period edit entry in apps/web/src/app/app.tsx so installment-row edit uses the same editingTx path as normal transaction edits; verify by extending apps/web/src/app/app.spec.tsx with a test that installment row edit opens modal for the targeted period id.

## 2. Isolated installment-item persistence behavior

- [x] 2.1 Implement Requirement: Editing one installment period SHALL be isolated to that period by ensuring save in libs/shared/state/src/lib/use-keep-accounts.ts updates only the selected transaction id and preserves installmentId/installmentPeriod/installmentCount linkage fields for sibling rows; verify with a unit test that editing period 5 amount/date keeps periods 1-4 unchanged.
- [x] 2.2 Implement Decision: Item editing SHALL update only the selected period record by constraining installment edit mode fields in apps/web/src/app/components/TransactionModal.tsx to intended scope (amount/date) and reusing existing validation failure behavior; verify with component tests that invalid amount is rejected and no sibling period mutation occurs.

## 3. Aggregate consistency and regression coverage

- [x] 3.1 Implement Requirement: Installment group summary SHALL reflect edited period data by keeping summary values in apps/web/src/app/components/HistoryTab.tsx derived from current period records after item edits; verify by test or manual assertion that total and remaining values update immediately after editing final-period amount.
- [x] 3.2 Implement Decision: Group summary SHALL remain aggregate-from-records by adding regression tests in apps/web/src/app/app.spec.tsx for edited-period aggregate recomputation and confirming existing settle/delete flows still pass; verify by running npx nx test @keep-accounts-app/web.
