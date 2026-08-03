## 1. Implementation

- [x] 1.1 Export domain-grouped `STORAGE_KEYS` in `libs/shared/domain/src/lib/constants.ts` by applying decision `Group Storage Keys by Feature Domain`. Verified by inspecting exported `STORAGE_KEYS` constant in `constants.ts`.
- [x] 1.2 Refactor `apps/web/src/app/services/backup.ts`, `libs/shared/state/src/lib/use-keep-accounts.ts`, `libs/shared/sqlite/src/lib/persistence.ts`, and test files to consume `STORAGE_KEYS`. Verified by running `npx nx test web`.
