## 1. Domain Library Extraction

- [x] 1.1 Create the `@keep-accounts-app/domain` library in the workspace. Verify that it initializes a new library structure inside `libs/shared/domain/` with standard tsconfig mapping by running `npx nx show project shared-domain`.
- [x] 1.2 Move types, constants, and calculations to satisfy the decision "Extract Pure Types and Logic into `@keep-accounts-app/domain`". Move the definitions of interfaces (`Category`, `AccountGroup`, `Transaction`), constants (`DEFAULT_ACCOUNT_GROUPS`, `ACCOUNT_EMOJIS`, `ACCOUNT_COLORS`), and helper functions (`getCurrentMonthExpenseForGroup`, `getDefaultCategoriesForNewGroup`) into `libs/shared/domain/src/lib/`. Verify that the library compiles successfully by running `npx nx build shared-domain`.

## 2. State Library Extraction

- [x] 2.1 Create the `@keep-accounts-app/state` library in the workspace. Verify that it initializes a new library structure inside `libs/shared/state/` with React and tsconfig configurations by running `npx nx show project shared-state`.
- [x] 2.2 Extract the state Hook to satisfy the decision "Extract React Hook State into `@keep-accounts-app/state`". Extract the core state Hook `useKeepAccounts` (managing lists of transactions, account groups, and persistence side effects) into `libs/shared/state/src/lib/use-keep-accounts.ts`. Verify that the library compiles successfully by running `npx nx build shared-state`.
- [x] 2.3 Apply defensive checks in state hook to satisfy the decision "Mitigate Security Sharp Edges (Domain / State Refactoring Audit)". Implement strict input validations (rejecting negative transaction amounts) and loud failures for corrupted data/invalid settings, ensuring no silent failures occur. Verify this by running tests with corrupt data mock profiles in unit tests.

## 3. Web UI Component Modularization

- [x] 3.1 Keep transient form input values and tab state local to satisfy the decision "Separate Transient UI State from Persistent Core State". Ensure forms (description, amount, date, type, category) and active tab state are declared locally in rendering components rather than inside the global Hook. Verify by ensuring no unnecessary React re-renders are triggered in parent components during text input.
- [x] 3.2 Move sub-views and modal dialogues from the main [app.tsx](file:///apps/web/src/app/app.tsx) into the `apps/web/src/app/components/` directory (e.g. `DashboardTab.tsx`, `HistoryTab.tsx`, `StatsTab.tsx`, `TransactionModal.tsx`, `GroupSettingsModal.tsx`). Verify that these components compile successfully and can be imported into [app.tsx](file:///apps/web/src/app/app.tsx).
- [x] 3.3 Delete the unused [nx-welcome.tsx](file:///apps/web/src/app/nx-welcome.tsx) file. Verify that the file does not exist in the workspace and builds are unaffected.

## 4. Integration and Verification

- [x] 4.1 Update [app.tsx](file:///apps/web/src/app/app.tsx) imports to retrieve shared models and state from `@keep-accounts-app/domain` and `@keep-accounts-app/state`. Verify that the web application builds successfully without compilation errors by running `npx nx build web`.
- [x] 4.2 Run existing tests in [app.spec.tsx](file:///apps/web/src/app/app.spec.tsx). Verify that all tests pass successfully without regression using `npx nx test web`.
