## Why

Installment groups currently support delete and settlement actions, but users cannot correct a single period when the final period remainder is wrong or when one period must be adjusted after reconciliation. This creates real-world accounting drift that requires deleting and recreating the whole group.

## What Changes

- Add item-level editing for installment periods in the installment history view.
- Allow editing one installment period's amount and date without forcing group-level edits.
- Keep group-level actions (settle group, delete group) unchanged.
- Recompute displayed group totals and remaining amount from actual stored period entries after any item edit.

## Non-Goals (optional)

- No group master editing flow (description/category/account for all periods).
- No automatic redistribution of other periods when one period is edited.
- No migration of existing installment data model.

## Capabilities

### New Capabilities

- `installment-item-editing`: Edit a single installment period entry (amount/date) directly from installment view while preserving installment group linkage.

### Modified Capabilities

(none)

## Impact

- Affected specs: installment-item-editing (new)
- Affected code:
  - New: none
  - Modified:
    - apps/web/src/app/components/HistoryTab.tsx
    - apps/web/src/app/components/TransactionModal.tsx
    - apps/web/src/app/app.tsx
    - libs/shared/state/src/lib/use-keep-accounts.ts
    - apps/web/src/app/app.spec.tsx
    - apps/web/src/app/components/TransactionModal.spec.tsx
  - Removed: none
