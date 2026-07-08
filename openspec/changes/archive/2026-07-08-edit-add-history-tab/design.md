## Context

Transactions can only be added or edited from the Dashboard tab, causing navigation friction. We want to add edit buttons and an add FAB directly to the History tab. We will reuse the existing `<TransactionModal>` and state hooks in `app.tsx`.

## Goals / Non-Goals

**Goals:**
- Extend `HistoryTabProps` to support `onEditTransaction` and `onAddTransaction` callbacks.
- Add an edit button next to the delete button in each transaction row in the History tab.
- Add a Floating Action Button (FAB) styled with glassmorphism to the bottom-right corner of the History tab.
- Wire the new callbacks in `app.tsx` to open the modal in the correct modes.

**Non-Goals:**
- Creating a new transaction entry modal specific to the History tab.
- Re-architecting how transactions are filtered or sorted on the History tab.

## Decisions

### Decision 1: HistoryTab Callback Interface Extension
- **Rationale**: Reusing the existing `TransactionModal` and transaction state functions in `app.tsx` is the cleanest approach. We will pass callback functions (`onEditTransaction` and `onAddTransaction`) to the `HistoryTab` component props.

### Decision 2: Inline Edit Button Placement
- **Rationale**: Placing an explicit edit icon button next to the delete button on each row ensures clear user intent and prevents accidental triggers while scrolling.

### Decision 3: Floating Action Button (FAB) Positioning and Styling
- **Rationale**: A floating button in the bottom-right corner (`position: fixed`) is highly reachable. We will style it with glassmorphism and position it above the bottom navigation bar (`bottom: 96px`, `right: 24px`) to prevent overlaps.

## Implementation Contract

- **Behavior**:
  - Users see an edit button (pen icon) on every transaction item in the History list. Clicking it opens the pre-populated transaction modal.
  - Users see a floating circular plus button in the bottom-right corner of the History page. Clicking it opens the empty transaction modal.
  
- **Interface / Data Shape**:
  - `HistoryTabProps` Callback definition:
    ```typescript
    interface HistoryTabProps {
      accountGroups: AccountGroup[];
      transactions: Transaction[];
      onDeleteTransaction: (id: string) => void;
      getCategoryEmoji: (catName: string, groupId: string) => string;
      getGroupName: (groupId: string) => string;
      onEditTransaction: (tx: Transaction) => void;
      onAddTransaction: () => void;
    }
    ```

- **Acceptance Criteria**:
  - Clicking the edit button on any transaction item opens the modal populated with its data.
  - Clicking the plus FAB opens the modal in creation mode.
  - Saving changes correctly updates the transaction list and changes are reflected immediately.
  - FAB does not overlap with the bottom nav bar.
  - All tests pass.

- **Scope boundaries**:
  - UI triggers and wiring only. No changes to state hooks or transaction validations.

## Risks / Trade-offs

- **[Risk] FAB overlaps with list scroll** → *Mitigation*: Ensure the history container has enough bottom margin/padding (`padding-bottom: 80px`) so that the last list items can be scrolled past the FAB.
