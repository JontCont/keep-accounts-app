## Why

The three salary-allocation rules the user cares about (50/30/20, 631, 333) all share one idea: take one paycheck and split it into groups *first*, then spend per group. Today the Dashboard records a paycheck as a single income transaction inside one group (e.g. all $45,000 lands in 日常開銷), so the "已分" figure reads 100% for that group and 0% for the others. That conflates "which group the paycheck was filed under" with "how the paycheck is allocated", which is misleading and does not express the allocation rules.

## What Changes

- Reframe the passive "本月待分配總額" block into a first-class **薪資拆出（待分配來源）source card** that binds multiple income categories (薪資／獎金／加班費…), exactly the way a major group binds categories. Its bound categories stay configurable in Group Settings.
- On each major group card, show a **計畫分配金額** = source total × that group's target ratio. This is a purely visual split — it creates NO transactions and does NOT change any account balance.
- Keep a secondary **實際流入** figure on each group card (current-month bound-category income actually recorded into that group) so the user can see planned-vs-actual drift.
- Relabel the group card subtext from "目標 / 已分" to "計畫分配 / 實際流入" to match the source-card mental model.
- No new persisted data model: reuse the existing `allocationCategories` list and `AccountGroup.targetRatio`.

## Non-Goals (optional)

- NOT moving money between groups or generating split transactions (pure visual overlay; rejected reading ② and the "one-click distribute" option A).
- NOT enforcing six-jar hard isolation (funds remain freely spendable across groups).
- NOT changing how paychecks are entered or which group a transaction is filed under.

## Capabilities

### New Capabilities

- `salary-allocation-source-card`: A configurable salary source card that sums bound-category income, plus per-group planned-allocation amounts (source x ratio) shown alongside actual bound inflow, all as a non-mutating visual overlay.

### Modified Capabilities

(none)

## Impact

- Affected specs: `salary-allocation-source-card` (new)
- Affected code:
  - Modified: apps/web/src/app/components/DashboardTab.tsx
  - Modified: apps/web/src/app/components/GroupSettingsModal.tsx
  - Modified: apps/web/src/app/app.tsx
  - Modified: libs/shared/state/src/lib/use-keep-accounts.ts
  - Tests: apps/web/src/app/app.spec.tsx
