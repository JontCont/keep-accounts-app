## Context

The Dashboard tab already has a Today/Month toggle for summary values, but the detail list is still hard-coded to today's transactions. This creates a mismatch when the user selects "本月": the totals change, but the list does not. The change is limited to the web Dashboard UI and its regression test coverage; it does not affect history, storage, or transaction data shape.

## Goals / Non-Goals

**Goals:**

- Make the Dashboard detail list follow the active Today/Month period toggle.
- Keep the period definition as local calendar day vs current calendar month.
- Preserve the existing summary calculations and day-grouped rendering style.
- Add regression coverage for the Today and Month views.

**Non-Goals:**

- Do not change History tab filtering or grouping.
- Do not change transaction storage, timestamps, or data migration logic.
- Do not introduce a new period type or convert Month into a rolling 30-day window.

## Decisions

### Dashboard detail list follows the selected period
Use the existing `period` state in `DashboardTab` to filter the detail list instead of hard-coding today-only rows. The view should switch between today-only and current-month transactions using the same period toggle that already drives the summary cards.

**Alternatives considered:** keep the list today-only, or add a separate list filter. Both would preserve the current mismatch or create two sources of truth.

### Summary and detail share the same period state
Keep the summary numbers and the detail list derived from one period selector so the screen cannot drift out of sync. This avoids duplicate period state and makes the toggle behavior predictable.

**Alternatives considered:** maintain independent summary and list filters. That would increase the chance of inconsistent UI and test failures.

### Regression coverage for Today and Month views
Add a UI regression in `apps/web/src/app/app.spec.tsx` that asserts the dashboard list changes with the toggle: Today excludes earlier days in the same month, and Month includes them.

**Alternatives considered:** rely on manual testing only. That would not protect the shared period logic from future regressions.

## Implementation Contract

When the Dashboard tab renders:

- Selecting "今日" SHALL show only transactions dated today in the detail list.
- Selecting "本月" SHALL show all transactions from the current local calendar month in the detail list.
- The summary totals and detail rows SHALL derive from the same active period selection.
- The current grouping style may remain day-based; only the filtered transaction set changes.
- History tab behavior, storage format, and transaction creation/editing flows are out of scope.

Acceptance criteria:

- Manual review confirms the dashboard list changes immediately when toggling between Today and Month.
- A Vitest regression covers both the Today and Month behaviors.
- Existing period summary assertions still pass.

## Risks / Trade-offs

- [Risk] Month mode may surface many more rows than Today mode. → Keep the existing day grouping and ordering so the UI remains readable.
- [Risk] Date handling can drift between UTC and local calendar dates. → Continue using the same local calendar string slicing approach already used by the summary logic.

## Migration Plan

No data migration is required. The change is purely behavioral in the Dashboard UI.
