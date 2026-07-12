## 1. SQLite-first persistence foundation

- [x] 1.1 Implement **Native persistence uses local SQLite as primary storage** under **Decision: Use SQLite-first persistence with compatibility fallback** so native startup loads account groups and transactions from SQLite with compatibility fallback when SQLite fails; verify with new persistence unit tests in `libs/shared/state/src/lib/persistence.spec.ts` that cover native success and fallback behavior.
- [x] 1.2 Route `useKeepAccounts` snapshot hydration/save through the persistence abstraction while preserving existing mutation APIs under **Decision: Maintain business-rule compatibility at mutation boundaries**; verify by running `npx nx test web -- --run src/app/app.spec.tsx` and ensuring existing mutation-focused cases still pass.

## 2. Query-store for History pagination

- [x] 2.1 Implement query-store pagination API for **History data is provided by paginated DB query** aligned with **Decision: Introduce query-store APIs for History pagination**, returning deterministic date-desc pages with has-more metadata; verify with dedicated query tests in `libs/shared/state/src/lib/query-store.spec.ts` using the 120-record examples from the spec.
- [x] 2.2 Integrate History UI with query pagination so first render is 50 items, next page appends contiguous items, and end-of-list stops loading while preserving existing filter/group semantics; verify by running `npx nx test web -- --run src/app/components/HistoryTab.spec.tsx` and confirming pagination, in-flight guard, and exhaustion scenarios.

## 3. Query-store for Stats aggregation

- [x] 3.1 Implement aggregation APIs for **Stats data is provided by DB aggregation queries** under **Decision: Introduce aggregation query APIs for Stats**, including scoped total expense, category buckets, and daily trend buckets; verify with query-store tests that validate category/trend output ordering and empty-scope results.
- [x] 3.2 Refactor `StatsTab` to consume aggregation payloads instead of full-array reduce logic, preserving chart and ratio behavior for selected scope; verify by adding/updating `apps/web/src/app/components/StatsTab.spec.tsx` assertions for scoped totals and trend rendering.

## 4. Compatibility and regression guardrails

- [x] 4.1 Ensure **Dashboard detail list follows the selected period** remains correct after query-driven migration by keeping Dashboard period filtering behavior source-agnostic; verify with `npx nx test web -- --run src/app/app.spec.tsx` period-filter tests.
- [x] 4.2 Update iOS native integration for SQLite plugin linkage (Pod sync expectations and runtime availability checks) and document rollback/fallback behavior in change artifacts; verify by running `npx cap sync ios` from `apps/web` and confirming plugin registration files are generated/updated without errors.
