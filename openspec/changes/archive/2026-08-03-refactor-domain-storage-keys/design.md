## Context

Multiple files across `apps/web` and `libs/shared` use hardcoded string literals for `localStorage` items (`'keep_accounts_import_history'`, `'keep_accounts_groups'`, `'keep_accounts_transactions'`). Centralizing these into domain-grouped constant namespaces in `@keep-accounts-app/domain` improves maintainability.

## Goals / Non-Goals

**Goals:**
- Create `STORAGE_KEYS` object in `libs/shared/domain/src/lib/constants.ts` with sub-namespaces `ACCOUNTS`, `SYSTEM`, and `SETTINGS`.
- Replace all hardcoded storage key string literals with references to `STORAGE_KEYS`.

**Non-Goals:**
- Modifying underlying storage key string values or database tables.

## Decisions

### 1. Group Storage Keys by Feature Domain

- **Decision**: Define `STORAGE_KEYS` in `constants.ts` as:
  ```ts
  export const STORAGE_KEYS = {
    ACCOUNTS: {
      GROUPS: 'keep_accounts_groups',
      TRANSACTIONS: 'keep_accounts_transactions',
    },
    SYSTEM: {
      IMPORT_HISTORY: 'keep_accounts_import_history',
    },
    SETTINGS: {
      THEME: 'keep_accounts_theme',
      PERIOD_VIEW: 'keep_accounts_period_view',
    },
  } as const;
  ```
- **Rationale**: Groups keys logically by feature domain (`ACCOUNTS` vs `SYSTEM` vs `SETTINGS`), providing clean IDE autocompletion and clear ownership.

## Implementation Contract

- **Behavior**: Application logic behavior is unchanged; all `localStorage` access delegates to `STORAGE_KEYS` constants.
- **Interface / Data Shape**: `STORAGE_KEYS` constant exported from `@keep-accounts-app/domain`.
- **Failure Modes**: N/A
- **Acceptance Criteria**: All existing unit tests pass without error and no hardcoded `'keep_accounts_'` strings remain in application code.
- **Scope Boundaries**: In scope: `constants.ts`, `backup.ts`, `use-keep-accounts.ts`, `persistence.ts`, `app.tsx`, and corresponding unit tests. Out of scope: SQLite schema names or external backup ZIP keys.

## Risks / Trade-offs

- [Risk: Typo during constant refactoring] → Mitigation: Verified by running full Vitest suite (`npx nx test web`).
