## Why

`TransactionLedgerRow.tsx` computed inline CSS variable strings (`badgeBackground`, `amountColor`) using JavaScript ternary operators instead of delegating element styling to CSS selectors. Moving type-based badge and amount styling into CSS data attribute selectors (`data-tx-type="income" | "expense" | "transfer"`) decouples JavaScript logic from CSS styles, improves re-render performance, and adheres to standard frontend practices.

## What Changes

- Add `.tx-ledger-badge` and `.tx-ledger-amount` styling rules using `[data-tx-type]` attribute selectors in `apps/web/src/styles.css`.
- Refactor `TransactionLedgerRow.tsx` to remove inline JS ternary color variables and use `data-tx-type={tx.type}` with CSS classes.

## Non-Goals

- Changing visual design or transaction rendering behavior.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: (none)
- Affected code:
  - Modified: `apps/web/src/styles.css`
  - Modified: `apps/web/src/app/components/TransactionLedgerRow.tsx`
