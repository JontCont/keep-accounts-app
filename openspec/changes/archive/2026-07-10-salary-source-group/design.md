## Context

The Dashboard models money as account groups (大項), each with bound categories and a `targetRatio`. Income — including salary — is a `Transaction` filed under exactly one `accountGroupId`. The prior change added a visual "source card" and a global `allocationCategories` list to define which income counts as the allocation pool. Because a paycheck lives in one group, the actual-inflow comparison was structurally degenerate. This redesign makes the salary a dedicated source group and distributes it virtually.

## Goals / Non-Goals

**Goals:**

- Make 當月薪資 a protected, highlighted, first-positioned source group whose income defines the pool.
- Distribute the pool to other groups by target ratio using virtual computation (no generated transactions).
- Remove the redundant bound-category checklist and its global state.

**Non-Goals:**

- No split-transaction generation (option b).
- No change to the 當日可消費 daily-allowance widget behavior.
- No hard six-jar isolation.

## Decisions

### Decision: Mark the source group with an isSource flag

Add `isSource?: boolean` to `AccountGroup`. The source group is identified by this flag, NOT by a hardcoded id. Delete-guard, highlight styling, first-position sort, salary-category ownership, and target-ratio exclusion all key off `isSource`. Alternative considered: keep hardcoding `id === '1'` — rejected because the protected role is moving and id-coupling is already fragile across the codebase.

### Decision: Virtual distribution by target ratio

Each non-source group's allocated income = `round(sourcePool * targetRatio / 100)` where `sourcePool` is current-month income summed over the source group. The group's displayed balance credits this allocated amount as income. No `Transaction` records are created. Alternative considered: generate N split transactions (option b) — rejected to keep the ledger clean and allow instant re-computation when ratios change.

### Decision: Collapse the card comparison to allocated-vs-spent

Because virtual distribution forces 計畫分配 to equal 實際流入, the two-line planned/actual display is replaced by a single 分配額 line plus 已用/餘額 (current-month expense vs allocated). Alternative considered: keep both lines — rejected because they would always show identical numbers.

### Decision: Exclude the source group from target-ratio validation

Target ratios of non-source groups SHALL sum to 100%; the source group carries no target ratio and is excluded from the sum check in settings. Alternative considered: give the source a ratio — rejected because the source is the numerator base, not a distribution target.

### Decision: One-time migration for existing users

On load, if no source group exists, inject 當月薪資 (isSource) with the salary income categories, remove those categories from 日常開銷, rename 長期儲蓄 to 儲蓄資金, and delete the persisted `keep_accounts_allocation_categories` key. Alternative considered: force a reset to defaults — rejected because it would discard user transactions and custom groups.

## Implementation Contract

**Behavior**

- The Dashboard renders the 當月薪資 group first, visually highlighted, with no delete control in edit mode. All other groups render a delete control.
- The source group card shows the current-month source pool total (sum of its income transactions).
- Each non-source group card shows 分配額 = `round(sourcePool * targetRatio / 100)` and 已用/餘額 relative to that allocated amount.
- Group Settings no longer renders the 配比基準分類設定 checklist.
- Saving groups in settings validates that the sum of non-source `targetRatio` values equals 100%.

**Data shape**

- `AccountGroup` gains `isSource?: boolean`.
- Default groups: `當月薪資` (isSource, salary income categories, no targetRatio), `儲蓄資金` (40), `日常開銷` (30, salary categories removed), `投資理財` (30).
- The `allocationCategories` state, its `localStorage` key `keep_accounts_allocation_categories`, and the `onUpdateAllocationCategories` wiring are removed.

**Failure modes**

- A group set with no `isSource` group (e.g. user-imported legacy data) triggers migration to inject one; migration is idempotent (runs only when absent).
- If the source pool is 0, allocated amounts are 0 and cards render `$0` without error.

**Acceptance criteria**

- `npx nx test web` passes, including updated tests: source group is non-deletable while others are deletable, allocated amounts equal `sourcePool * ratio`, and the removed checklist no longer renders.

**Scope boundaries**

- In scope: source group model, virtual distribution, card display collapse, settings delete-guard and validation, migration, checklist removal.
- Out of scope: daily-allowance widget, backup format, split-transaction generation.

## Risks / Trade-offs

- [Losing the bound-category flexibility] → Categories under 當月薪資 fully replace it; users add/remove income categories there instead.
- [Migration corrupts custom user groups] → Migration only injects the source group and renames/relocates known defaults; it never deletes user groups or transactions.
- [Existing tests assume id 1 is the protected group] → Update tests to key off the source group role.
