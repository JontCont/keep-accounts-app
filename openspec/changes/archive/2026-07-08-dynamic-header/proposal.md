## Why

The global header currently displays a static title and date widget across all tabs. This is redundant on non-dashboard tabs (e.g. History, Stats, Settings) where it clashes with local section headings, wasting valuable mobile vertical space and causing visual clutter.

## What Changes

- Refactor `app.tsx` to dynamically render the header title based on the active tab (`dashboard`, `history`, `stats`, `settings`).
- For the `dashboard` tab, show "Keep Accounts" as the main title, "精緻微型記帳系統" as the subtitle, and the current date/day on the right.
- For non-dashboard tabs (`history`, `stats`, `settings`), change the header title to reflect the active tab ("歷史交易明細", "支出統計分析", "系統設定"), and hide the date on the right.
- Remove duplicate component-level headers/titles in `HistoryTab.tsx` and `StatsTab.tsx`, and adjust the layouts accordingly.
- For the `settings` tab, move the page header into the dynamic header.

## Capabilities

### New Capabilities

- `dynamic-header`: Dynamically adapts the application header title and right-side metadata according to the active navigation tab, removing redundant inner titles on sub-tabs.

### Modified Capabilities

(none)

## Impact

- Affected specs: `dynamic-header`
- Affected code:
  - Modified:
    - `apps/web/src/app/app.tsx`
    - `apps/web/src/app/components/HistoryTab.tsx`
    - `apps/web/src/app/components/StatsTab.tsx`
