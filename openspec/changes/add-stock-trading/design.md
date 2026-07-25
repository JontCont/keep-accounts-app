## Context

The current transaction model stores only an amount and classifies stock purchases as expenses. The stock calculator does not persist shares or unit price. Dashboard balances and profit-and-loss totals both use the same income-minus-expense calculation, while persistence and backup currently contain only account groups and transactions. This change crosses the domain, state, SQLite, backup, and web UI layers.

## Goals / Non-Goals

**Goals:**

- Record stock buys and sells independently of whether a settlement account is selected.
- Derive holdings and realized profit or loss deterministically with moving-average cost.
- Separate cash effects from profit-and-loss effects so principal is never reported or allocated as income.
- Allow positive realized gains to remain in investment funds, enter the allocation source, or be split by a percentage.
- Keep browser storage, native SQLite storage, and exported backups behaviorally equivalent.

**Non-Goals:**

- Market-price synchronization, unrealized gain calculations, quotes, dividends, corporate actions, short selling, margin trading, foreign-exchange conversion, and tax reporting are out of scope.
- Lot selection and FIFO cost accounting are out of scope; all symbols use moving-average cost.
- Brokerage integration and automatic import are out of scope.
- Existing transaction rows categorized as stock are not converted into holdings because they lack symbol and share data.

## Decisions

### Use immutable trade facts and replay-derived holdings

Persist `StockTrade` facts containing `id`, normalized `symbol`, `side`, integer `shares`, positive `unitPrice`, non-negative `fee`, non-negative `tax`, `tradedAt`, optional `settlementAccountGroupId`, `gainDisposition`, `allocationPercent`, and `createdAt`. Derive each `StockPosition` by sorting trades by `tradedAt`, then `createdAt`, then `id` and replaying them. A buy adds `shares * unitPrice + fee + tax` to cost. A sell removes `averageCostBeforeSale * shares`; its net proceeds are `shares * unitPrice - fee - tax`, and realized gain is net proceeds minus removed cost.

This avoids a mutable holdings table drifting from trade history. Persisting only aggregate holdings was rejected because edits, deletes, import, and backup restore could leave cost and quantity inconsistent.

### Validate the complete symbol timeline before committing mutations

Create, edit, and delete operations SHALL replay the affected symbol before persistence. A mutation fails when symbol is empty, shares are not a positive integer, monetary fields are invalid, sale net proceeds are negative, or any replay step would make shares negative. Failed mutations surface a specific validation message and write neither the trade nor linked ledger entries.

Restricting edits to the latest trade was rejected because complete replay provides deterministic validation without an arbitrary UI limitation.

### Separate cash and profit-and-loss transaction effects

Extend `Transaction` with optional `effect: 'cash' | 'pnl' | 'both'` and optional `stockTradeId`; missing `effect` means `both` for backward compatibility. When a settlement account is selected, a buy creates one cash-only expense for its gross cost and a sell creates one cash-only income for its net proceeds. These entries affect account-group balances but not income, expense, budget, statistics, or allocation totals.

Every sale creates profit-and-loss-only entries for the realized result: one income entry for retained or fully allocated gain, two income entries for a split gain, or one expense entry for a loss. They affect profit-and-loss reporting but not cash balance because the sale settlement already contains the proceeds. A zero result creates no profit-and-loss entry. Stacked thin wrappers were rejected: domain stock calculations own replay and ledger projection, state coordinates one mutation, and persistence stores the resulting facts.

### Model gain disposition as a projection of realized gain

`gainDisposition` is `retain`, `allocate`, or `split`; `retain` is the default. For a positive gain, retain assigns the P&L entry to the investment group with category `投資收益`; allocate assigns it to the source group with category `投資收益配置`; split creates two P&L-only entries whose amounts sum exactly to the gain, with `allocationPercent` applied to the allocation entry and the rounding remainder retained in investment. The allocation category is added to the persisted bound allocation categories when the user chooses allocate or a non-zero split, so only the allocated portion enters the current-month allocation base.

Losses always create one `投資損失` P&L-only expense in the investment group and ignore gain disposition. Principal is represented only by the cash-only sale settlement and never enters allocation.

### Persist stock trades as first-class snapshot data

Add `stockTrades` to shared state and `KeepAccountsSnapshot`, using `keep_accounts_stock_trades` in browser storage. Native SQLite receives a `keep_accounts_stock_trades` table and effect/link columns on transactions, added idempotently for existing databases. Backup JSON adds `keep_accounts_stock_trades`; imports without that key load an empty trade list, while malformed present values fail validation.

A separate table is deeper than embedding trades into transaction JSON: deleting it would remove the source of truth for positions and realized-gain replay. The domain module is the single calculation adapter; state and persistence do not duplicate cost formulas.

## Implementation Contract

**Behavior:** The stock portfolio lists each symbol's held shares, total moving-average cost, average unit cost, and cumulative realized gain or loss. A trade form accepts buy or sell, symbol, shares, unit price, fees, taxes, date, optional settlement account, and sale gain disposition. Saving a valid trade immediately updates the position and linked ledger effects. Editing or deleting a trade recalculates the symbol timeline and all linked stock ledger entries. A sale that exceeds available shares is rejected without partial writes.

**Data shapes:** `StockTrade`, `StockPosition`, `GainDisposition`, and `TransactionEffect` are exported from the shared domain. The pure domain API exposes replay and ledger-projection functions that return either a complete result or a typed validation failure. The state hook exposes `stockTrades`, `saveStockTrade`, and `deleteStockTrade`. Snapshot and backup objects contain `stockTrades` and `keep_accounts_stock_trades` respectively.

**Failure modes:** Invalid numeric input, empty symbol, overselling, and mutations that invalidate a later sale are surfaced in the trade form. SQLite or backup persistence errors retain existing error propagation/logging behavior and MUST NOT be represented as successful saves. Import rejects a present non-array stock-trade payload. Legacy backups without stock trades remain importable.

**Acceptance criteria:** Domain unit tests verify moving-average replay, fees and taxes, partial sales, split rounding, chronological edits, and oversell rejection. State tests verify atomic trade plus ledger projection and optional settlement behavior. Persistence and backup tests verify browser/native round trips and legacy imports. Component tests verify the form and portfolio values. Existing targeted dashboard and statistics tests verify cash-only entries are excluded from P&L and P&L-only entries are excluded from cash balances.

**Scope boundaries:** In scope are manual stock trade CRUD, derived positions, realized P&L, optional account settlement, allocation disposition, persistence, backup, and existing dashboard/statistics integration. Out of scope are live prices, unrealized P&L, dividends, lot selection, brokerage sync, and conversion of legacy stock expenses.

## Risks / Trade-offs

- [Historical edits change later realized gains] -> Rebuild the complete affected-symbol projection and replace all linked ledger entries atomically.
- [Floating-point currency drift] -> Round persisted monetary results to the app's currency precision at projection boundaries and assign split remainder to retained gain.
- [SQLite schema differs across installed versions] -> Use idempotent schema inspection and migrations before reading or writing new columns and tables.
- [Cash and P&L filtering is missed in one report] -> Centralize effect predicates in the domain and reuse them across Dashboard, Stats, budgets, and allocation calculations.
- [Legacy backups omit stock trades] -> Treat a missing stock-trade key as an empty list, but reject an invalid present key.
