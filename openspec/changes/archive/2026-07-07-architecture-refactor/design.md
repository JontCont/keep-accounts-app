## Context

Currently, the entire React front-end application logic is bundled in a single monolithic file [app.tsx](file:///apps/web/src/app/app.tsx) of over 2000 lines. This includes types, constants, local storage synchronization, business calculations, budget limits, page components, charts, and form validations. This refactor splits this monolith into discrete layers utilizing Nx monorepo library structures.

## Goals / Non-Goals

**Goals:**
* Split the monolithic file into modular React components in `apps/web/src/app/components/`.
* Extract core types, constant default data, and pure functions into a pure TypeScript library `@keep-accounts-app/domain`.
* Extract React state management, state hook, budget validations, and local storage sync into a React-dependent library `@keep-accounts-app/state`.
* Remove unused Nx boilerplate files like [nx-welcome.tsx](file:///apps/web/src/app/nx-welcome.tsx).
* Maintain 100% feature parity and ensure all unit tests pass.

**Non-Goals:**
* Changing the app UI styling or layouts.
* Upgrading React, Ionic, or other major dependencies beyond configuration tweaks.
* Replacing local storage with a backend service or SQLite database in this phase.

## Decisions

### 1. Extract Pure Types and Logic into `@keep-accounts-app/domain`
* **Rationale**: Types like `Transaction`, `Category`, `AccountGroup` and pure helper functions like `getCurrentMonthExpenseForGroup` do not depend on React or Ionic. Moving them to a pure TypeScript library allows potential non-web/CLI tools (like the Swift CLI) to share data structures and logic.
* **Alternatives Considered**: Keeping them in `apps/web/src/types` and `apps/web/src/utils`. However, this violates monorepo sharing benefits.

### 2. Extract React Hook State into `@keep-accounts-app/state`
* **Rationale**: React state logic (managing lists of transactions, account groups, and persistence side effects) should be separated from presentation components. Extracting this into a React library allows isolated unit testing of the state machine.
* **Alternatives Considered**: Keeping the hook inside the `apps/web` app. This is simpler but does not allow clean division of workspace packages. We prefer complete architectural decoupling.

### 3. Separate Transient UI State from Persistent Core State
* **Rationale**: The state hook `useKeepAccounts` will manage persistent state (transactions, groups) and their related validations (budget rules). Transient form inputs (e.g. current draft description, amount) and UI navigation state (active tab) will remain in local component states to prevent unnecessary rerenders of the hook and keep the hook interface clean.
* **Alternatives Considered**: Storing all form states inside `useKeepAccounts`. This makes the hook overly complex and tightly bound to specific form inputs.

### 4. Mitigate Security Sharp Edges (Domain / State Refactoring Audit)
* **Rationale**: Decoupling the data layer into separate libraries could expose the system to silent failures (e.g., corrupt LocalStorage JSON) or swappable primitives. To prevent these security and usability traps:
  - **Confused Developer**: Use strict TypeScript union typings (e.g., `'income' | 'expense'`) instead of generic strings to prevent parameter mismatches at compilation.
  - **Lazy Developer**: Fall back to safe, hardcoded defaults (`DEFAULT_ACCOUNT_GROUPS`) on parsing failures, and trigger schema migrations automatically within the custom state Hook.
  - **Scoundrel**: Fail loudly and halt writes if transaction values are negative or if account group allocation target ratios do not sum to exactly 100%.
* **Alternatives Considered**: Permitting the UI components to execute validation individually. However, centering validation inside the `@keep-accounts-app/state` library ensures the data layer is safe-by-default for any consumer.

## Implementation Contract

#### Behavior
The application must remain functionally identical. Budget warning alerts and data migrations on mount must trigger under the exact same conditions.

#### Interface & Data Shape
1. **`@keep-accounts-app/domain`**:
   - `Category`, `AccountGroup`, `Transaction` interfaces.
   - Constants: `DEFAULT_ACCOUNT_GROUPS`, `INITIAL_TRANSACTIONS`, `ACCOUNT_EMOJIS`, `ACCOUNT_COLORS`.
   - Functions:
     - `getDefaultCategoriesForNewGroup(): Category[]`
     - `getCurrentMonthExpenseForGroup(groupId: string, txs: Transaction[], referenceDate?: Date): number`

2. **`@keep-accounts-app/state`**:
   - React hook `useKeepAccounts` returning:
     - `accountGroups`: `AccountGroup[]`
     - `setAccountGroups`: `React.Dispatch<React.SetStateAction<AccountGroup[]>>`
     - `transactions`: `Transaction[]`
     - `setTransactions`: `React.Dispatch<React.SetStateAction<Transaction[]>>`
     - Methods for CRUD:
       - `saveTransaction(description: string, amount: string, type: 'income'|'expense', category: string, date: string, accountGroupId: string, editingTx: Transaction | null): void`
       - `deleteTransaction(id: string): void`
       - `saveAccountGroups(groups: AccountGroup[]): boolean` (returns false and triggers alert if target ratios do not sum to 100%)

#### Failure Modes
* **LocalStorage Parsing Errors**: Catch parsing exceptions silently, log to `console.error`, and fall back to default groups/transactions.
* **Invalid Ratios Sum**: Return `false` and alert the user if group target ratios do not sum to 100%.

#### Acceptance Criteria
* The TypeScript packages `@keep-accounts-app/domain` and `@keep-accounts-app/state` build cleanly.
* Unit tests in `apps/web/src/app/app.spec.tsx` are updated to mock or use the new shared library imports and must pass.
* The application runs successfully locally with identical behavior.

#### Scope Boundaries
* **In Scope**: Creation of two libraries, relocation of source files, component modularization inside `apps/web/src/app/components`, importing from paths `@keep-accounts-app/domain` and `@keep-accounts-app/state`.
* **Out of Scope**: Database adapters, new screens, UI changes.

## Risks / Trade-offs

* **Risk: Import Path Mapping Issues**
  * Mitigation: Configure `tsconfig.base.json` and Nx workspace project targets properly to resolve paths `@keep-accounts-app/domain` and `@keep-accounts-app/state`.
* **Risk: LocalStorage Migration regression**
  * Mitigation: Ensure the custom hook run-once migration `useEffect` performs the exact same legacy data detection and migrations.
