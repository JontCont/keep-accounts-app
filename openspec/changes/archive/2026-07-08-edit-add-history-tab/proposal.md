## Why

Currently, transactions can only be added or edited from the Dashboard tab. Users looking at the History tab must navigate back to the Dashboard to perform these actions, which is inconvenient. Adding add/edit triggers directly to the History tab improves user efficiency.

## What Changes

- Extend `HistoryTab` component props to include `onEditTransaction` and `onAddTransaction` callbacks.
- Add an edit button with a pen icon next to the delete button in each history item in `HistoryTab`.
- Add a Floating Action Button (FAB) with a plus icon in the bottom-right corner of the `HistoryTab` view to trigger new transaction entry.
- Wire these callbacks inside `app.tsx` to update state (e.g., `editingTx`, `showTxModal`) and open the standard `TransactionModal` modal.

## Capabilities

### New Capabilities

- `history-tab-actions`: Provides transaction editing and adding directly within the History tab.

### Modified Capabilities

(none)

## Impact

- Affected specs: `history-tab-actions`
- Affected code:
  - Modified:
    - `apps/web/src/app/app.tsx`
    - `apps/web/src/app/components/HistoryTab.tsx`
