## 1. Domain Model and Calculations

- [x] 1.1 Implement **Use immutable trade facts and replay-derived holdings** by exporting `StockTrade`, `StockPosition`, `GainDisposition`, and `TransactionEffect` from the shared domain, including symbol normalization and deterministic trade ordering; verify with `npx vitest run libs/shared/domain/src/lib/stocks.spec.ts` tests for **Record stock trades independently of cash settlement** and equal-date tie-breaking.
- [x] 1.2 Implement moving-average replay in `libs/shared/domain/src/lib/stocks.ts` so **Derive holdings using moving-average cost** includes buy charges, partial-sale cost removal, remaining average cost, and cumulative realized results; verify with domain tests using the 100-at-10, 100-at-14, sell-100-at-15 example.
- [x] 1.3 Implement typed timeline validation so **Validate the complete symbol timeline before committing mutations** and **Prevent invalid stock timelines** reject empty symbols, invalid numeric fields, negative net proceeds, direct oversells, and historical edits or deletes that invalidate later sales; verify mutation-failure tests assert the original projection is unchanged.
- [x] 1.4 Implement ledger projection so **Separate cash and profit-and-loss transaction effects**, **Calculate realized profit and loss from net proceeds**, and **Model gain disposition as a projection of realized gain** produce cash-only settlement rows plus P&L-only retained, allocated, split, or loss rows without double-counting; verify domain tests for fees, tax, zero gain, loss, 0/30/100 percent allocation, and currency-rounding remainder.

## 2. State Coordination and Reporting

- [ ] 2.1 Extend `useKeepAccounts` with `stockTrades`, `saveStockTrade`, and `deleteStockTrade` so **Rebuild linked ledger effects after trade changes** validates first and atomically replaces the affected symbol's trade and `stockTradeId`-linked rows; verify `npx vitest run libs/shared/state/src/lib/use-keep-accounts.spec.ts` tests for create, edit, delete, rejection rollback, and optional settlement.
- [ ] 2.2 Centralize cash/P&L effect predicates and apply them to Dashboard balances, income, expenses, budgets, allocation totals, balance adjustment, and Stats aggregates so principal and cash settlements never contaminate P&L while P&L-only rows never alter cash balances; verify targeted `npx nx test @keep-accounts-app/web` DashboardTab, StatsTab, and app balance tests.
- [ ] 2.3 Connect allocated gain projection to the existing bound-category allocation state so **Configure positive realized gain disposition** includes only the allocated portion in the current month and defaults all new sales to retain; verify state and Dashboard tests for retained 200, allocated 200, and split 60/140 results.

## 3. Persistence, Migration, and Backup

- [ ] 3.1 Implement **Persist stock trades as first-class snapshot data** in browser persistence with `stockTrades` and `keep_accounts_stock_trades`, preserving missing transaction `effect` as `both`; verify `npx vitest run libs/shared/state/src/lib/persistence.spec.ts` round-trip and legacy-state tests.
- [ ] 3.2 Add idempotent native SQLite schema migration, stock-trade CRUD/snapshot support, and transaction effect/link mapping in `libs/shared/sqlite/src/lib/persistence.ts`; verify `npx vitest run libs/shared/sqlite/src/lib/persistence.spec.ts` tests demonstrate repeated initialization, new-schema round trips, and legacy transaction compatibility.
- [ ] 3.3 Extend backup export, import, and restore so **Persist and back up stock data** round-trips valid stock trades, treats an absent legacy field as an empty list, and rejects malformed or invalid present data before overwriting state; verify `npx nx test @keep-accounts-app/web -- src/app/services/backup.spec.ts`.

## 4. Stock Trading User Interface

- [ ] 4.1 Build `StockTradeModal` with buy/sell fields, optional settlement account, default-retain gain disposition, split percentage controls, computed proceeds and gain preview, and surfaced domain validation errors; verify `npx nx test @keep-accounts-app/web` component tests cover valid submission, no-account submission, oversell, loss behavior, and split input boundaries.
- [ ] 4.2 Build and integrate `StockPortfolio` so **Display stock positions and realized performance** shows open symbols with shares, remaining cost, average cost, and cumulative realized P&L while retaining closed-symbol trade history and edit/delete actions; verify component tests for partial and fully closed positions.
- [ ] 4.3 Replace the ordinary stock-expense entry path with navigation to the stock trade flow while leaving unrelated income, expense, transfer, and installment entry behavior unchanged; verify existing `TransactionModal` and `TransactionEntryPage` tests plus a stock-navigation regression test.

## 5. Implementation Contract Verification

- [ ] 5.1 Verify the complete **Implementation Contract** and scope boundaries by running `npx vitest run libs/shared/domain/src/lib/stocks.spec.ts libs/shared/state/src/lib/use-keep-accounts.spec.ts libs/shared/state/src/lib/persistence.spec.ts libs/shared/sqlite/src/lib/persistence.spec.ts`, `npx nx test @keep-accounts-app/web`, and `npx nx run-many -t lint -p @keep-accounts-app/domain @keep-accounts-app/state @keep-accounts-app/sqlite @keep-accounts-app/web`; then manually assert the 2330 example produces 100 shares at cost 1,000 after buy and principal 1,000 plus realized gain 200 after selling at 12, with e財庫 omitted and selected in separate checks.
