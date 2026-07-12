## Context

The current transaction input flow is rendered in a modal and now contains multiple controls, including account and category pickers, create and edit behavior, and installment configuration. On mobile viewports this density reduces readability and increases interaction friction. The app already uses top-level tab navigation in App state, so introducing a dedicated transaction-entry context can reuse existing rendering patterns without introducing a new router dependency.

## Goals / Non-Goals

**Goals:**

- Replace modal-based transaction entry with a dedicated page-style context.
- Preserve all current transaction validation and save semantics.
- Provide deterministic back navigation to the invoking context (dashboard or history).
- Keep installment workflow available in create-expense flow.

**Non-Goals:**

- No transfer transaction model in this change.
- No redesign of dashboard, history, or statistics calculations in this change.
- No schema migration or persistent data format changes.

## Decisions

### Use app-level transaction-entry view state instead of modal visibility state
Use an explicit page context in App state (for example, a transaction-entry mode plus origin metadata) instead of toggling modal open state. This keeps navigation semantics observable and easier to reason about than nested modal state transitions.

Alternative considered: keep modal and only increase modal height. Rejected because it does not solve navigation clarity or future feature growth.

### Preserve form behavior by reusing existing transaction form logic
The new page context must reuse existing field validation, defaulting rules, and installment behavior. UI container changes, behavior contract remains stable.

Alternative considered: rewrite transaction form from scratch for page UX. Rejected due to high regression risk and unnecessary duplication.

### Make back navigation origin-aware
When opening transaction entry, persist invoking context (dashboard or history). Back action returns to the recorded origin, and successful save also returns to that origin.

Alternative considered: always return to dashboard. Rejected because it breaks history editing workflow continuity.

## Implementation Contract

- Behavior:
  - Triggering add or edit transaction opens a full transaction-entry page context.
  - Header in transaction-entry context shows mode-specific title and a visible back action.
  - Back action returns to invoking context without applying changes.
  - Save applies current validation and persistence behavior, then returns to invoking context.
- Interface and data shape:
  - App view state SHALL include transaction-entry context and origin metadata.
  - Transaction entry props SHALL include mode (create or edit), origin (dashboard or history), and existing edit payload when applicable.
  - Save callback signature SHALL remain compatible with existing transaction persistence behavior.
- Failure modes:
  - Invalid input SHALL block save with existing validation messaging behavior.
  - If save fails, user remains on transaction-entry page and no implicit navigation occurs.
- Acceptance criteria:
  - Manual: open add from dashboard, press back, verify return to dashboard.
  - Manual: open edit from history, save valid changes, verify return to history with updated row.
  - Automated: app-level tests verify transaction-entry context rendering and origin-aware return behavior for create and edit flows.
- Scope boundaries:
  - In scope: entry container replacement, header behavior for entry context, origin-aware navigation.
  - Out of scope: new accounting types, report-calculation redesign, data migration.

## Risks / Trade-offs

- [Risk] Increased App state complexity for view orchestration. -> Mitigation: keep transaction-entry state shape minimal and explicit.
- [Risk] Regression in existing installment UX. -> Mitigation: preserve installment behavior contract and add focused create-flow tests.
- [Risk] Header logic branching grows with one more context. -> Mitigation: centralize title and date-visibility mapping in one context resolver.
