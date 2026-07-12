## Context

The current application stores account groups and transactions as JSON blobs in localStorage and computes History/Stats by scanning full in-memory arrays. This model becomes unstable for very large ledgers because browser storage limits, full deserialization, and repeated filter/sort/reduce work scale poorly. The target is a native-local database approach that preserves existing bookkeeping behavior while changing data access to query-driven reads.

## Goals / Non-Goals

**Goals:**

- Persist account and transaction data in native-local SQLite on mobile builds.
- Keep web compatibility through fallback persistence when SQLite is not available.
- Drive History rendering from paginated queries (50 rows per page) instead of full-list scans.
- Drive Stats category/trend aggregates from query results instead of full-array reductions.
- Preserve existing transaction semantics (installment handling, budget validation, category behavior).

**Non-Goals:**

- Rewriting Dashboard visual design or settings UI.
- Changing transaction schema fields or accounting rules.
- Introducing remote sync/cloud replication.

## Decisions

### Decision: Use SQLite-first persistence with compatibility fallback

Native platforms will treat SQLite as the source of truth. If SQLite is unavailable (web/test/runtime failure), the system falls back to localStorage-compatible persistence so app behavior remains functional.

Alternatives considered:
- localStorage-only: rejected due to capacity and performance limits.
- immediate IndexedDB-only cross-platform rewrite: rejected due to native parity risk and plugin integration requirements.

### Decision: Introduce query-store APIs for History pagination

History reads will go through query APIs that support page size and offset/cursor semantics, returning already-ordered slices. The view must not receive or compute over the entire ledger for list rendering.

Alternatives considered:
- keep in-memory full array + UI slicing: rejected because total compute still scales with full dataset.

### Decision: Introduce aggregation query APIs for Stats

Stats totals, category amounts, and daily trends will be derived from query-store aggregation APIs. UI components consume aggregate payloads rather than reducing all transactions client-side.

Alternatives considered:
- keep Stats reductions in component: rejected because large datasets produce expensive repeated scans.

### Decision: Maintain business-rule compatibility at mutation boundaries

Create/update/delete/settle operations continue to enforce existing domain behavior and feed persistence through repository boundaries. Mutation semantics remain compatible while storage internals change.

Alternatives considered:
- rewrite all mutation logic into SQL first: rejected for higher migration risk in one pass.

## Implementation Contract

- **Behavior**
  - On native builds, account and transaction data SHALL be persisted and read from SQLite.
  - History SHALL render initial page (50 rows) and subsequent pages from query-store pagination calls.
  - Stats SHALL render totals/category/trend views using query-store aggregates, not full-array reductions.
  - Existing mutation operations SHALL preserve observable behavior (create/edit/delete/installment settle flows).

- **Interface / data shape**
  - Persistence contract SHALL expose load/save snapshot operations and query-store read operations (paginated transactions + aggregate stats payloads).
  - History query contract SHALL include page size, page token/offset, has-more flag, and deterministic date-desc ordering.
  - Stats query contract SHALL include: total transaction count for scope, total expense, category buckets, and daily trend points.

- **Failure modes**
  - If SQLite open/read/write fails, system SHALL fall back to compatibility storage and surface console diagnostics.
  - If query page/aggregate fetch fails, UI SHALL preserve last successful data and terminate active loading state.

- **Acceptance criteria**
  - Native persistence survives app restart without relying on localStorage quotas.
  - History infinite-scroll shows 50-row incremental append from query-store APIs.
  - Stats renders category and trend data with no full-array reduce path in component scope.
  - Existing transaction mutation tests still pass for core behaviors.

- **Scope boundaries**
  - **In scope**: persistence-layer change, query-store APIs, History/Stats query-driven reads, compatibility fallback.
  - **Out of scope**: cloud sync, backup format migration, Dashboard redesign.

## Risks / Trade-offs

- **[Risk] SQLite plugin differences between environments** → **Mitigation**: keep fallback persistence path and runtime capability checks.
- **[Risk] Divergence between query-store and existing mutation logic** → **Mitigation**: preserve mutation APIs and add focused regression tests.
- **[Risk] Partial migration leaves hidden full-array reads** → **Mitigation**: explicitly replace History/Stats full-array derivation paths and test for pagination/aggregation behavior.
- **[Trade-off] Added complexity in persistence abstraction** → **Mitigation**: keep a narrow repository contract and avoid unnecessary adapter layers.

## Migration Plan

1. Add SQLite dependency and persistence abstraction with fallback.
2. Route hook-level snapshot load/save through abstraction.
3. Add query-store APIs for paginated history and stats aggregates.
4. Update History/Stats components to consume query APIs.
5. Run targeted regression tests and update failing expectations.

### Rollback / Fallback note

- If native SQLite integration regresses in production, runtime fallback keeps localStorage-compatible persistence active without blocking app startup.
- Emergency rollback path: ship a patch that disables native SQLite path selection while retaining query-store interfaces, so UI behavior remains stable while persistence reverts to compatibility storage.

## Open Questions

- Should web target eventually migrate from fallback persistence to IndexedDB-backed SQL engine, or remain compatibility-only for this cycle?
