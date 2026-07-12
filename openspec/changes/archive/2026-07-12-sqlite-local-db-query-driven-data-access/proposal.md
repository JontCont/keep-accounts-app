## Why

Current data handling relies on full-array JSON persistence and in-memory filtering, which cannot scale to very large ledgers (for example, 1GB-class transaction datasets). We need a local database-backed access pattern now so mobile/web clients remain responsive without architecture breakage.

## What Changes

- Introduce native-local SQLite persistence as the primary storage path, with compatibility fallback for non-native environments.
- Replace full-list History data access with query-driven pagination (50 rows per page, incremental fetch).
- Replace Stats computation from full in-memory arrays with query-driven aggregation for category and trend views.
- Keep existing transaction/account-group business rules and UI semantics while changing storage/read strategy.

## Non-Goals (optional)

- Redesigning Dashboard, Settings, or Transaction modal UX flows unrelated to storage/query behavior.
- Changing accounting domain rules (installment semantics, budget rule logic, category naming rules).
- Migrating backup file format in this change.

## Capabilities

### New Capabilities

- `sqlite-native-persistence`: Persist account groups and transactions in local SQLite storage on native platforms.
- `history-db-pagination-query`: Load History data through paginated DB queries instead of full in-memory filtering.
- `stats-db-aggregation-query`: Load Stats totals, category ratios, and trend data through DB-side aggregation queries.

### Modified Capabilities

- `dashboard-period-detail-filter`: Preserve period-filter correctness while transaction data access transitions away from full-array processing.

## Impact

- Affected specs: `sqlite-native-persistence`, `history-db-pagination-query`, `stats-db-aggregation-query`, `dashboard-period-detail-filter`
- Affected code:
  - New: `libs/shared/state/src/lib/persistence.ts`, `libs/shared/state/src/lib/query-store.ts`, `apps/web/src/app/components/StatsTabQuery.tsx`
  - Modified: `libs/shared/state/src/lib/use-keep-accounts.ts`, `apps/web/src/app/components/HistoryTab.tsx`, `apps/web/src/app/components/StatsTab.tsx`, `apps/web/src/app/app.tsx`, `apps/web/src/app/services/backup.ts`, `apps/web/ios/App/Podfile`, `package.json`
  - Removed: (none)
