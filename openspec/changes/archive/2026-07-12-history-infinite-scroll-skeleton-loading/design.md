## Context

The History tab currently operates over the in-memory `transactions` array and performs list shaping in render-time paths. As record count grows, first paint, scroll smoothness, and interaction latency degrade, especially on mobile devices. The product direction for this change is to keep History responsive by switching to incremental rendering behavior while preserving existing business logic and transaction semantics.

## Goals / Non-Goals

**Goals:**

- Render History records in deterministic 50-item pages.
- Fetch the next page only when users reach list end (infinite-scroll interaction).
- Show animated loading placeholders with `IonSkeletonText` while page fetch is in progress.
- Provide explicit completion behavior when no more records are available.

**Non-Goals:**

- Introducing a new local database engine or replacing storage architecture.
- Changing domain rules for transaction creation, deletion, installments, or budgeting.
- Redesigning Dashboard, Stats, or Settings visual behavior.

## Decisions

### Decision: Use fixed page-size pagination with 50-item slices

A fixed page size keeps behavior predictable for UX and testing. The first render SHALL include at most 50 History records; each additional request appends the next contiguous 50 records in descending date order. This avoids full-list render costs and provides bounded work per load event.

Alternatives considered:
- Variable page size based on viewport height: rejected for higher complexity and unstable test expectations.
- Full render with memoization only: rejected because memory and reconciliation costs still scale with full list size.

### Decision: Use Ionic infinite-scroll primitives for load triggering

The list-end trigger SHALL be implemented with Ionic infinite-scroll semantics so scroll interactions remain consistent with the app's Ionic stack. Load requests SHALL be ignored while a load is already in flight.

Alternatives considered:
- Manual scroll listener and threshold math: rejected due to duplicate platform behavior and harder maintenance.
- Explicit "Load more" button: rejected because it adds friction compared to continuous history browsing.

### Decision: Use `IonSkeletonText` transaction-card placeholders during loading

Loading feedback SHALL be animation-based and card-shaped, matching the History row footprint. Skeleton cards SHALL appear only during in-progress next-page loads and SHALL be replaced by actual records on completion.

Alternatives considered:
- Text-only "Loading...": rejected per UX requirement and lower perceived responsiveness.
- Spinner-only indicator: rejected because it does not communicate list-shape continuity.

### Decision: Keep grouping/filter semantics unchanged for loaded subset

Existing filter/group controls SHALL continue to operate without changing their domain meaning. During pagination rollout, those controls will apply to the currently loaded dataset window rather than forcing full-data materialization.

Alternatives considered:
- Recomputing all filters against the complete list before render: rejected because it defeats incremental rendering goals.

## Implementation Contract

- **Behavior**
  - On History tab open, the UI SHALL display up to 50 most recent records.
  - On list-end reach, the UI SHALL request the next 50 records and append them below existing items.
  - While next-page data is loading, the UI SHALL render animated skeleton cards using `IonSkeletonText`.
  - When no more data exists, infinite loading SHALL stop and the UI SHALL present an end-of-list state.

- **Interface / data shape**
  - Pagination state SHALL include: current loaded count, page size (`50`), loading flag, and has-more flag.
  - Load trigger contract SHALL be idempotent during in-flight state (no concurrent page fetch).

- **Failure modes**
  - If next-page retrieval fails, loading state SHALL terminate and the UI SHALL allow retry via next scroll trigger.
  - The list SHALL remain on already loaded records; no destructive rollback of visible items.

- **Acceptance criteria**
  - Initial History render shows at most 50 records.
  - First scroll-to-end appends records 51–100 when available.
  - During fetch, at least one visible `IonSkeletonText` placeholder appears.
  - Repeated rapid scroll events during loading do not duplicate append operations.
  - When data is exhausted, no additional fetch is triggered.

- **Scope boundaries**
  - **In scope**: History list pagination behavior, loading animation state, end-of-list handling.
  - **Out of scope**: storage engine migration, backup/import format changes, non-History tab behavior.

## Risks / Trade-offs

- **[Risk] Grouping/filters against partially loaded data can be misread as complete totals** → **Mitigation**: keep labels neutral and avoid claiming full-history totals in this change.
- **[Risk] Scroll-trigger overfiring on some devices** → **Mitigation**: enforce in-flight guard and has-more short-circuit.
- **[Risk] Skeleton/card visual mismatch** → **Mitigation**: mirror transaction card structure and spacing in skeleton layout.
- **[Trade-off] Incremental rendering improves responsiveness but delays access to deeper history** → **Mitigation**: maintain smooth append cadence and clear loading feedback.
