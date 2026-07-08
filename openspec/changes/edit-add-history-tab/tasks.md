## 1. Component Interface and Header Changes

- [x] 1.1 Extend `HistoryTabProps` to satisfy "Decision 1: HistoryTab Callback Interface Extension". Verify by editing `apps/web/src/app/components/HistoryTab.tsx` and verifying it compiles successfully.

## 2. Row Actions and FAB Implementation

- [x] 2.1 Implement edit button on transaction items in `HistoryTab.tsx` to satisfy "Decision 2: Inline Edit Button Placement" and "Edit Transaction Trigger in History Tab" requirement. Verify by content review or manual inspection that the Lucide `edit` icon renders next to the delete button.
- [x] 2.2 Add Floating Action Button (FAB) to `HistoryTab.tsx` to satisfy "Decision 3: Floating Action Button (FAB) Positioning and Styling" and "Add Transaction FAB in History Tab" requirement. Verify by content review or manual inspection that the FAB renders with a `plus` icon in the bottom-right corner.

## 3. UI Integration and Wire Up

- [x] 3.1 Wire up the edit and add handlers inside `apps/web/src/app/app.tsx`. Verify that clicking edit or add on the History tab correctly opens the modal and updates data by running all unit tests in `apps/web/src/app/app.spec.tsx`.
