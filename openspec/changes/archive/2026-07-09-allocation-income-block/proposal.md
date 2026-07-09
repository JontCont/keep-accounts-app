## Why

To make target ratio calculations and distributions transparent, we need to show the total income to be allocated (e.g., total salary) as a separate block on the Dashboard. Below this block, the account group target percentages are translated into actual dollar values (e.g. "目標 30% ($15,000)"), helping users distribute their incoming flows accurately.

## What Changes

- Add a dedicated "本月待分配總額" (Total Income to Allocate) card at the top of the account list on the Dashboard. This displays the sum of current month's income from the selected allocation categories.
- On each account group card, display the computed target amount next to the target ratio (e.g. `目標 30% ($15,000)`) and display the actual allocated amount next to the actual ratio (e.g. `已分 100% ($50,000)`).
- Keep card main balances showing cumulative net balances.

## Capabilities

### New Capabilities

- `allocation-income-block`: Introduces the "Total Income to Allocate" block and displays target vs. actual dollar amounts on Dashboard cards.

### Modified Capabilities

None.

## Impact

- `apps/web/src/app/components/DashboardTab.tsx`: Render the new block, calculate target/actual amounts for each group, and update subtexts on cards.
