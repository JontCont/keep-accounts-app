## Why

Hardcoded string literals for `localStorage` keys (such as `'keep_accounts_import_history'`, `'keep_accounts_groups'`, and `'keep_accounts_transactions'`) are scattered across multiple services and hooks. Extracting these keys into domain-grouped constant namespaces under `STORAGE_KEYS` (such as `ACCOUNTS`, `SYSTEM`, and `SETTINGS`) eliminates typo risks, improves IDE autocompletion, and makes key management maintainable.

## What Changes

- Define a typed, domain-grouped `STORAGE_KEYS` constant object in `libs/shared/domain/src/lib/constants.ts` (exporting `STORAGE_KEYS.ACCOUNTS`, `STORAGE_KEYS.SYSTEM`, and `STORAGE_KEYS.SETTINGS`).
- Refactor all direct string accesses of `localStorage` keys in `backup.ts`, `use-keep-accounts.ts`, `persistence.ts`, `app.tsx`, and test files to use `STORAGE_KEYS`.

## Non-Goals

- Changing actual string key values in `localStorage` or breaking data backward compatibility.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: (none)
- Affected code:
  - Modified: `libs/shared/domain/src/lib/constants.ts`
  - Modified: `apps/web/src/app/services/backup.ts`
  - Modified: `libs/shared/state/src/lib/use-keep-accounts.ts`
  - Modified: `libs/shared/sqlite/src/lib/persistence.ts`
  - Modified: `apps/web/src/app/app.tsx`
  - Modified: `apps/web/src/app/services/backup.spec.ts`
  - Modified: `apps/web/src/app/app.spec.tsx`
  - Modified: `libs/shared/state/src/lib/persistence.spec.ts`
