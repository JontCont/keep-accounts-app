## Why

The History tab currently renders and computes over the full transaction list, which does not scale for large datasets and can degrade mobile/browser responsiveness. We need incremental loading now to keep scroll and interaction smooth as data volume grows.

## What Changes

- Load History records in pages of 50 items instead of rendering the full dataset at once.
- Add infinite-scroll pagination so additional records are fetched only when the user reaches the list end.
- Replace text-only loading feedback with animated `IonSkeletonText` transaction-card placeholders during page fetch.
- Add explicit end-of-list behavior so loading does not continue after the final page.

## Non-Goals (optional)

- Replacing storage with a new local database engine in this change.
- Redesigning non-History tabs (Dashboard, Stats, Settings).
- Changing transaction domain rules, accounting calculations, or backup format.

## Capabilities

### New Capabilities

- `history-infinite-scroll-pagination`: Incremental History loading with 50-record pages and scroll-triggered fetch.
- `history-skeleton-loading-state`: Animated skeleton placeholders for in-progress History page loads.

### Modified Capabilities

(none)

## Impact

- Affected specs: `history-infinite-scroll-pagination`, `history-skeleton-loading-state`
- Affected code:
  - New: `openspec/changes/history-infinite-scroll-skeleton-loading/specs/history-infinite-scroll-pagination/spec.md`, `openspec/changes/history-infinite-scroll-skeleton-loading/specs/history-skeleton-loading-state/spec.md`
  - Modified: `apps/web/src/app/components/HistoryTab.tsx`, `apps/web/src/app/app.tsx`
  - Removed: (none)
