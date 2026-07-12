## Context

Installment management currently supports group-level actions (settle and delete) and period-level deletion, but does not support period-level edits. The installment view in HistoryTab already renders each period row and has action buttons, while the state layer stores each period as an independent transaction linked by installmentId. Users reported practical correction scenarios: final-period remainder mistakes and ad-hoc period amount/date adjustments after statement reconciliation.

## Goals / Non-Goals

**Goals:**

- Enable editing one installment period entry directly from the installment view.
- Allow editing amount and date for one selected period without breaking installmentId linkage.
- Preserve existing group-level actions and period deletion behavior.
- Keep installment totals and remaining amount derived from actual stored period entries.

**Non-Goals:**

- No installment group master edit flow (description/category/account for all periods).
- No automatic redistribution or rebalancing of other periods after one period edit.
- No schema migration or new persistence model for installment transactions.

## Decisions

### Decision: Reuse the existing transaction modal for period edit entry
The implementation SHALL route period edit actions to the existing TransactionModal edit path rather than creating a second installment-specific editor. This minimizes UI duplication and keeps validation behavior centralized.

Alternatives considered:
- Inline row editing in HistoryTab: rejected due to increased row complexity and duplicated validation logic.
- Dedicated installment-period modal: rejected because it duplicates existing form lifecycle and save handling.

### Decision: Item editing SHALL update only the selected period record
Editing a period SHALL patch only that transaction id (amount/date and unchanged linkage metadata), and SHALL NOT mutate sibling periods in the same installment group. This keeps user intent explicit for correction workflows.

Alternatives considered:
- Auto-rebalance remaining periods: rejected because it creates surprising financial side effects.
- Force-edit all future periods together: rejected as too heavy for one-off correction scenarios.

### Decision: Group summary SHALL remain aggregate-from-records
Group total, paid count, and remaining amount displays SHALL continue to be computed from stored installment period rows at render time, so edits are reflected immediately without extra derived storage.

Alternatives considered:
- Persist a separate installment-group summary object: rejected because it introduces synchronization risk.

## Implementation Contract

Behavior:
- In installment view, each period row SHALL expose an edit action.
- Selecting edit on one period SHALL open edit mode for that exact transaction.
- Saving SHALL persist the updated amount/date for that period only.
- Post-save, the installment card summary SHALL reflect the new aggregate values.

Interface / data shape:
- UI integration point: HistoryTab period-row action area in the installment branch.
- Existing callback path SHALL be reused so App passes the selected transaction into TransactionModal editing state.
- State update SHALL use the existing update-by-id save path in useKeepAccounts, preserving installmentId, installmentPeriod, and installmentCount fields unless explicitly changed by edit scope.

Failure modes:
- Invalid amount (non-positive) SHALL be rejected by existing validation and SHALL NOT persist changes.
- Invalid or empty required fields SHALL keep modal open and SHALL NOT mutate storage.
- If target transaction id no longer exists at save time, save SHALL fail safely with no partial group mutation.

Acceptance criteria:
- Manual: edit a middle period amount and verify only that row changes while group totals update.
- Manual: edit final period date and verify paid/remaining counts follow updated due date relation.
- Test: add/extend installment tests to assert single-item edit does not modify sibling periods.
- Test: existing settle/delete installment workflows remain passing.

Scope boundaries:
- In scope: period row edit affordance, period amount/date edit persistence, aggregate display refresh.
- Out of scope: group-wide field edits, automatic redistribution, data model migration, new reminder semantics.

## Risks / Trade-offs

- [Risk] Reusing generic edit modal may expose fields that are not intended for period edit scope.
  → Mitigation: explicitly constrain editable fields for installment-period edit mode to amount/date.

- [Risk] Users may expect period number reordering after date edits.
  → Mitigation: keep period numbering stable for edit operations and document this behavior in tests.

- [Risk] Summary values can appear inconsistent if date edits move periods across paid/unpaid boundary unexpectedly.
  → Mitigation: retain current date-based paid/remaining calculation and verify through scenario tests.
