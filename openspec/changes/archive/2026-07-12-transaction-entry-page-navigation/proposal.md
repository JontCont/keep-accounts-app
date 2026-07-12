## Why

The transaction entry modal has grown to include many controls and now feels cramped, especially on mobile screens. Moving this flow to a dedicated page improves readability, reduces interaction friction, and creates room for upcoming transaction types such as transfer.

## What Changes

- Replace the add or edit transaction modal flow with a dedicated transaction entry page.
- Add explicit back navigation on the transaction entry page so users can return to the previous context (dashboard or history) without losing orientation.
- Keep existing save behavior and validation semantics while changing only the presentation and navigation pattern.
- Keep installment configuration available in the new page flow.

## Capabilities

### New Capabilities

- transaction-entry-page: A full-page transaction editor with create and edit modes, contextual back navigation, and behavior parity with the current form fields.

### Modified Capabilities

- dynamic-header: Extend header behavior to support a transaction entry context with a back action and context-aware title.

## Impact

- Affected specs: transaction-entry-page, dynamic-header
- Affected code:
  - New: apps/web/src/app/components/TransactionEntryPage.tsx
  - Modified: apps/web/src/app/app.tsx
  - Modified: apps/web/src/app/components/TransactionModal.tsx
  - Modified: apps/web/src/app/components/DashboardTab.tsx
  - Modified: apps/web/src/app/components/HistoryTab.tsx
  - Modified: apps/web/src/app/app.spec.tsx
  - Modified: apps/web/src/app/components/TransactionModal.spec.tsx
  - Modified: apps/web/src/styles.css
  - Removed: none
