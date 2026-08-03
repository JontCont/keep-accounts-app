## 1. Implementation

- [x] 1.1 Add `.tx-ledger-badge` and `.tx-ledger-amount` rules with `[data-tx-type]` attribute selectors in `apps/web/src/styles.css` by applying decision `Use CSS Data Attribute Selectors for Transaction Types`. Verified by inspecting `styles.css`.
- [x] 1.2 Refactor `apps/web/src/app/components/TransactionLedgerRow.tsx` to remove inline JS ternary color variables and use `data-tx-type={tx.type}`. Verified by running `npx tsc --noEmit` and `npx nx test web`.
