## Why

The just-shipped visual allocation (change `salary-allocation-source-card`) exposed a structural flaw: a paycheck can only be filed under ONE spending group, so "實際流入" is permanently degenerate (one group ~100%, the rest 0%) regardless of how the user spends. The user wants the salary to be a first-class **source account** that money is distributed *out of* into the other groups, matching the 先存再花 / 631 philosophy. The bound-category checklist (配比基準分類設定) is redundant once the salary source is its own group whose income categories ARE the source.

## What Changes

- Introduce a **當月薪資** account group flagged as the income source (`isSource: true`). It is pinned first, visually highlighted, and NOT deletable. Its income categories (薪資收入…) define the allocation pool — there is no separate bound-category list.
- **BREAKING**: Remove the "配比基準分類設定" checklist and the global `allocationCategories` state/persistence entirely. The source pool is derived from current-month income recorded under the 當月薪資 group.
- Move salary income categories OFF 日常開銷 and onto 當月薪資.
- Rename 長期儲蓄 → **儲蓄資金**. All non-source groups (儲蓄資金 / 日常開銷 / 投資理財…) become deletable; only 當月薪資 is protected.
- Distribution is **virtual (option a)**: each non-source group's allocated amount = `round(sourcePool * targetRatio / 100)`, credited to that group's balance on the fly. No split transactions are generated.
- Since virtual distribution makes 計畫分配 equal 實際流入, collapse each group card to a single **分配額** plus **已用/餘額** (allocated vs spent) — the genuinely useful comparison.
- `targetRatio` validation covers only non-source groups (their sum SHALL be 100%); the source group is excluded.
- Migration upgrades existing 30/30/40 users: inject the 當月薪資 source group, relocate salary categories, rename 長期儲蓄, and drop the persisted allocationCategories key.

## Non-Goals (optional)

- NOT generating per-group split transactions (option b rejected in favor of virtual computation).
- NOT changing the "當日可消費" daily-allowance widget, which stays bound to the 日常開銷 group when present.
- NOT six-jar hard isolation; balances remain freely spendable.

## Capabilities

### New Capabilities

- `salary-source-group`: A protected, highlighted, first-positioned 當月薪資 account group that acts as the income source, plus virtual per-group distribution of its pool by target ratio and an allocated-vs-spent card display.

### Modified Capabilities

- `allocation-income-block`: The total-to-allocate and per-group figures derive from the 當月薪資 source group instead of a bound-category list.
- `allocation-mode-switch`: Remove the bound allocation-source-category checklist requirements.

## Impact

- Affected specs: `salary-source-group` (new), `allocation-income-block`, `allocation-mode-switch`
- Affected code:
  - Modified: libs/shared/domain/src/lib/constants.ts
  - Modified: libs/shared/domain/src/lib/types.ts
  - Modified: libs/shared/state/src/lib/use-keep-accounts.ts
  - Modified: apps/web/src/app/components/DashboardTab.tsx
  - Modified: apps/web/src/app/components/GroupSettingsModal.tsx
  - Modified: apps/web/src/app/app.tsx
  - Tests: apps/web/src/app/app.spec.tsx
