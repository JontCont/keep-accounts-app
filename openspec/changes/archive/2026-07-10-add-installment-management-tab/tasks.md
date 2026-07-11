## 1. History navigation and flat-list restrictions

- [x] [P] 1.1 Deliver Four history filters are available by exposing 全部 / 收入 / 支出 / 分期 in the history tab navigation; verify with a browser check on the history page and the existing `npx nx test @keep-accounts-app/web` suite.
- [x] [P] 1.2 Deliver Flat transaction lists are read-only for installment transactions by hiding edit and delete actions for installment rows in the flat views while keeping an installment indicator visible; verify with `apps/web/src/app/app.spec.tsx` plus a browser check in 全部 / 收入 / 支出.

## 2. Installment group view and actions

- [x] [P] 2.1 Deliver Installment transactions are grouped in the 分期 filter by rendering one group per `installmentId` with installment description and progress; verify with a browser check in the 分期 view and the grouped-installment test coverage in `apps/web/src/app/app.spec.tsx` and `apps/web/src/app/installments.spec.ts`.
- [x] 2.2 Deliver Installment groups support installment-specific management actions by adding group-level viewing, single-period deletion, whole-group deletion, and early settlement from the 分期 view; verify with focused state-hook coverage in `libs/shared/state/src/lib/use-keep-accounts.ts` and an end-to-end browser check.
