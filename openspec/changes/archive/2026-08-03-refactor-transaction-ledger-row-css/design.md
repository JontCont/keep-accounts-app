## Context

`TransactionLedgerRow.tsx` calculated inline CSS variables `badgeBackground` and `amountColor` in JS. Replacing these inline ternary variables with CSS classes and `data-tx-type` attribute rules simplifies the React component and follows CSS best practices.

## Goals / Non-Goals

**Goals:**
- Add `.tx-ledger-badge` and `.tx-ledger-amount` rules with `data-tx-type` selectors in `styles.css`.
- Remove JS inline style ternary variables from `TransactionLedgerRow.tsx`.

**Non-Goals:**
- Changing typography, spacing, or DOM structure of transaction rows.

## Decisions

### 1. Use CSS Data Attribute Selectors for Transaction Types

- **Decision**: Define rules in `styles.css`:
  ```css
  .tx-ledger-badge {
    background: var(--input-bg);
  }
  .tx-ledger-badge[data-tx-type="income"] {
    background: var(--income-bg);
  }
  .tx-ledger-badge[data-tx-type="expense"] {
    background: var(--expense-bg);
  }

  .tx-ledger-amount {
    color: var(--text-secondary);
  }
  .tx-ledger-amount[data-tx-type="income"] {
    color: var(--income-color);
  }
  .tx-ledger-amount[data-tx-type="expense"] {
    color: var(--expense-color);
  }
  ```
- **Rationale**: Keeps style rules in CSS where they belong and eliminates JS string concatenation.

## Implementation Contract

- **Behavior**: Component styling remains visually identical for income, expense, and transfer transactions.
- **Interface / Data Shape**: N/A
- **Failure Modes**: N/A
- **Acceptance Criteria**: `npx tsc --noEmit` and `npx nx test web` pass completely.
- **Scope Boundaries**: `styles.css` and `TransactionLedgerRow.tsx`.

## Risks / Trade-offs

- [Risk: Missing fallback styling] → Mitigation: Default `.tx-ledger-badge` uses `var(--input-bg)` and default `.tx-ledger-amount` uses `var(--text-secondary)`.
