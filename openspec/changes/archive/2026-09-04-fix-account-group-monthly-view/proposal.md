## Why

Account group cards on the Dashboard tab currently compute lifetime cumulative net balance (`getGroupBalance`), causing sub-account groups (such as Daily Expenses and Savings) to show large negative balances (e.g., `$-19,256` or `$-139,286`) when past transactions and installment entries accumulate without explicit income transfers to those groups. Account group cards should reflect current period (monthly) budget allocation and usage rather than lifetime net totals.

## What Changes

- Change account group card display metrics on DashboardTab to focus on current month budget allocation, current month expense usage, and current month remaining balance.
- Prevent historical transactions and past installment entries from inflating or reducing current month account group card balances.
- Retain total net wealth summary in the top header ("目前總餘額"), ensuring lifetime balance logic is preserved for total assets while account group cards reflect current month budgeting.

## Non-Goals

- Changing historical ledger transaction storage or data structures.
- Altering the calculation of the overall lifetime total net balance in the top header card.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `allocation-income-block`: Update account group card subtext and balance display requirements to mandate current month budget, used amount, and remaining balance calculations.

## Impact

- Affected specs: `allocation-income-block`
- Affected code:
  - Modified: `apps/web/src/app/components/DashboardTab.tsx`
  - Modified: `apps/web/src/app/components/DashboardTab.spec.tsx`
