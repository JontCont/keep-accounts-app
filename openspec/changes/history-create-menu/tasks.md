## 1. History page create menu

- [x] 1.1 Deliver History page create menu only and Preserve original position and layout by showing a two-option chooser from the existing history create icon while keeping the icon in its original position; verify with a browser check on the history page and `npx nx test @keep-accounts-app/web`.
- [x] 1.2 Deliver History page create menu selection behavior by routing the general choice to the existing normal transaction flow and the installment choice to installment entry; verify with browser checks on the history page and `apps/web/src/app/app.spec.tsx`.

## 2. Entry mode handoff to the modal

- [x] 2.1 Deliver Entry mode routes to the correct transaction flow and Explicit entry mode handoff to the modal by passing the selected mode into `TransactionModal` so installment opens directly in installment mode and general opens normally; verify with `apps/web/src/app/components/TransactionModal.tsx` behavior in browser and `apps/web/src/app/app.spec.tsx`.
- [x] 2.2 Deliver non-history pages keep the original create behavior by leaving their create action unchanged and confirming the history-only menu does not appear there; verify with a browser check on the dashboard and stats pages plus `npx nx test @keep-accounts-app/web`.
