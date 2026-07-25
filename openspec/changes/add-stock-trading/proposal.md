## Why

Stock purchases are currently recorded as ordinary expenses and retain only their total amount, so the app cannot represent holdings, distinguish returned principal from profit, or calculate realized gains when shares are sold. Users need stock trades to behave as asset movements while keeping the funding account optional.

## What Changes

- Add stock holdings and stock trade records with symbol, side, shares, unit price, fees, taxes, and trade date.
- Calculate holding quantity and moving-average cost from completed buys and sells.
- Calculate realized gain or loss from the sale net proceeds minus the moving-average cost of sold shares.
- Keep the funding or settlement account optional; when selected, buying deducts the cash outflow and selling credits the net proceeds.
- Let users keep positive realized gains in investment funds, include them in the current month's allocation source, or split the gain between those destinations.
- Exclude returned principal from income and allocation calculations.
- Persist and back up stock data in browser and native SQLite storage.

## Capabilities

### New Capabilities

- `stock-trading`: Record stock buys and sells, maintain holdings using moving-average cost, calculate realized gains and losses, optionally settle cash through an account, and choose how positive gains participate in allocation.

### Modified Capabilities

(none)

## Impact

- Affected specs: stock-trading
- Affected code:
  - New:
    - libs/shared/domain/src/lib/stocks.ts
    - apps/web/src/app/components/StockTradeModal.tsx
    - apps/web/src/app/components/StockPortfolio.tsx
  - Modified:
    - libs/shared/domain/src/lib/types.ts
    - libs/shared/domain/src/index.ts
    - libs/shared/state/src/lib/use-keep-accounts.ts
    - libs/shared/sqlite/src/lib/persistence.ts
    - apps/web/src/app/app.tsx
    - apps/web/src/app/services/backup.ts
    - apps/web/src/app/components/DashboardTab.tsx
    - apps/web/src/app/components/StatsTab.tsx
  - Removed: none
