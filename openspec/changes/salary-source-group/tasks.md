## 1. Domain model

- [x] 1.1 Add `isSource?: boolean` to the `AccountGroup` type so the protected source group is identified by role, not id (Decision: Mark the source group with an isSource flag). Verify by type-checking that `DEFAULT_ACCOUNT_GROUPS` compiles with the new field.
- [x] 1.2 Redefine `DEFAULT_ACCOUNT_GROUPS` in libs/shared/domain/src/lib/constants.ts to satisfy the Salary Source Account Group requirement: a first 當月薪資 group with `isSource: true` owning the salary income categories, 長期儲蓄 renamed to 儲蓄資金 (ratio 40), 日常開銷 (ratio 30) with salary categories removed, 投資理財 (ratio 30). Verify with a unit assertion that the first group has `isSource` and that 日常開銷 no longer contains 薪資收入.

## 2. State and migration

- [x] 2.1 Implement the Source Group Migration in libs/shared/state/src/lib/use-keep-accounts.ts (Decision: One-time migration for existing users): when no `isSource` group exists, inject 當月薪資 with salary categories, remove salary categories from 日常開銷, rename 長期儲蓄 to 儲蓄資金, and preserve user transactions. Verify with a test that seeds legacy 30/30/40 groups and asserts a source group appears and transactions are untouched.
- [x] 2.2 Remove the `allocationCategories` state, its `keep_accounts_allocation_categories` persistence, and delete that stored key on migration. Verify with a test asserting `localStorage.getItem('keep_accounts_allocation_categories')` is null after load and that `useKeepAccounts` no longer exposes `allocationCategories`.

## 3. Dashboard distribution and display

- [x] 3.1 Implement Virtual Pool Distribution in apps/web/src/app/components/DashboardTab.tsx (Decision: Virtual distribution by target ratio): compute each non-source group allocated = `round(sourcePool * targetRatio / 100)` where sourcePool is current-month income of the source group, creating no transactions. Verify with a test asserting a $45,000 pool yields $18,000/$13,500/$13,500 for 40/30/30 and transaction count is unchanged.
- [x] 3.2 Satisfy the Total Income to Allocate Block requirement by rendering the source pool total on the highlighted first 當月薪資 card as a green +$ amount. Verify with a test asserting the source card shows the source-group income sum and excludes non-source income.
- [x] 3.3 Satisfy the Allocated versus Spent Card Display and the Account Group Target and Reached Dollar Amount Display requirements (Decision: Collapse the card comparison to allocated-vs-spent): each non-source card shows 分配額 and 已用/餘額 with no separate 實際流入 line. Verify with a test asserting 分配額 $13,500 and 已用/餘額 for a 日常開銷 group with $5,000 expenses.

## 4. Settings

- [x] 4.1 Update the delete-guard in apps/web/src/app/components/GroupSettingsModal.tsx so the Salary Source Account Group (keyed off `isSource`) has no delete control while every non-source group does. Verify with a test asserting exactly one group lacks a delete button and it is the source group.
- [x] 4.2 Implement Non-Source Target Ratio Validation excluding the source group from the 100% sum check (Decision: Exclude the source group from target-ratio validation), and remove the 配比基準分類設定 checklist that implemented the Allocation Source Category Binding and Category-Bound Target Ratio Calculations requirements. Verify with a test that the checklist no longer renders and that saving is blocked when the non-source ratio sum is not 100%.
- [x] 4.3 Remove the `allocationCategories`/`onUpdateAllocationCategories` wiring from apps/web/src/app/app.tsx and the modal props. Verify by type-checking and confirming the app renders without the removed props.

## 5. Verification

- [x] 5.1 Run the web unit tests to confirm the source group, virtual distribution, card display, settings guard/validation, and migration behaviors pass. Verify by running `npx nx test web` and confirming apps/web/src/app/app.spec.tsx is green.
