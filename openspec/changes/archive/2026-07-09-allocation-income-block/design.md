## Context

To make target ratio calculations and distributions transparent, we need to show the total income to be allocated (e.g., total salary) as a separate block on the Dashboard. Below this block, the account group target percentages are translated into actual dollar values (e.g. "目標 30% ($15,000)"), helping users distribute their incoming flows accurately.

## Goals / Non-Goals

**Goals:**
- Render a dedicated "本月待分配總額" card at the top of the account list on the Dashboard.
- Translate target percentages into actual dollar amounts (e.g. `目標 30% ($15,000)`) and show them on card subtexts.
- Show actual allocated dollar amounts next to actual percentages.

**Non-Goals:**
- No database schema or state persistence modifications needed.
- No changes to transfer flow transactions.

## Decisions

### Decision 1: Render Top Allocation Income Block
- **Choice**: Display a card at the top of the account list styled with a light green background `rgba(34, 197, 94, 0.08)` and border, featuring a briefcase icon and showing the total bound monthly income.
- **Rationale**: Keeps the layout premium and distinguishes the "income flow source" from the envelope accounts.

### Decision 2: Display Target and Actual Dollar Ratios on Subtexts
- **Choice**: Compute `targetAmount = Math.round(totalMonthlyBoundIncome * (group.targetRatio / 100))` and `actualAmount = getGroupMonthlyBoundIncome(group.id)`. Render these in the card subtexts.
- **Rationale**: Providing actual dollar numbers makes the envelopes much easier to manage than raw percentages alone.

## Implementation Contract

### Behavior
- The "本月待分配總額" card appears below the account list header and above the stacked progress bar when `totalMonthlyBoundIncome > 0`.
- Card subtext displays target and actual ratios with their dollar values:
  - `目標 {targetRatio}% (${targetAmount})`
  - `已分 {actualPct}% (${actualAmount})`

### Acceptance Criteria
- Unit tests pass.
- Displayed numbers are mathematically accurate.
