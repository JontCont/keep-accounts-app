## Context

The Keep Accounts application needs a more polished and flexible user interface. Currently, there are layout bottlenecks on small screen heights (e.g. modals cut off), browser-default focus outlines and number spinners on Ionic inputs, flat list display in history page, FAB button overlaying controls during scroll, and lack of system/light/dark theme configurations.

## Goals / Non-Goals

**Goals:**
- Provide scrollable modal overlay by modifying card styling.
- Remove default webkit styles and focus outline bugs for `IonInput` components.
- Implement Year/Month/Day grouping inside `HistoryTab` with sub-summaries.
- Enable FAB button toggle based on scroll events.
- Allow theme configuration in Settings (System/Light/Dark) using CSS variable injection.

**Non-Goals:**
- Redesigning the core domain logic.
- Adding custom dashboard stats panels.

## Decisions

### Modal Scroll Support
Use CSS `max-height: 90vh` and `overflow-y: auto` on the `glass-card` within `TransactionModal`. Avoid full screen modal rewrite to keep the custom card aesthetic.

### Input Styling Clean Up
Use CSS variables on `ion-input` directly:
- `--background`, `--color`, `--border-color`, `--padding-start`, etc.
Disable default focus outline in Chrome/Safari via CSS reset and hide webkit-inner-spin-button.

### Grouping Mechanism
State variables: `groupBy: 'year' | 'month' | 'day'`. Use existing `getGroupKey`, `formatGroupHeader` and `getGroupTotals` methods in `app.tsx` and pass grouping information down to `HistoryTab` (or redefine local helper functions).
Group the array using `reduce` or mapping, sort groups descendingly, then render header card with sub-summaries, then map child transactions.

### FAB Scroll Behavior
Listen to `ionScroll` events from the parent `<IonContent>` (enable `scrollEvents={true}`). Maintain a `showFab` boolean state in `HistoryTab` or `App` component. Compute difference between current scroll position and previous scroll position to check direction. If scrolling down (deltaY > 0), hide FAB; if scrolling up (deltaY < 0), show FAB.

### Theme CSS Structure
Set `data-theme` attribute on `document.documentElement` based on settings. Maintain theme setting in localStorage.
In `styles.css`:
- Map default colors to dark mode.
- Under `:root[data-theme="light"]`, override variables:
  - `--bg-color` to `#f3f4f6`
  - `--card-bg` to `rgba(255, 255, 255, 0.7)`
  - `--card-border` to `rgba(0, 0, 0, 0.08)`
  - `--text-primary` to `#111827`
  - `--text-secondary` to `#4b5563`
  - `--text-tertiary` to `#9ca3af`

## Implementation Contract
- **Behavior**: User can toggle theme in settings; modal scrolls on small screens; input focus border matches theme; history groups update immediately on switch; FAB hides on scroll.
- **Interface / data shape**: LocalStorage key: `keep_accounts_theme` (`'system' | 'light' | 'dark'`). State variables: `groupBy` (`'year' | 'month' | 'day'`).
- **Failure modes**: Fallback to system theme if query fails or theme undefined.
- **Acceptance criteria**: Verify theme switches correctly; modal scrolls successfully; FAB transitions correctly when scrolling list.
- **Scope boundaries**: Limited to `TransactionModal`, `HistoryTab`, `app.tsx`, `styles.css`.

## Risks / Trade-offs
- [Risk] Recharts color styling in light mode could be unreadable → Mitigation: Recharts components in `StatsTab` should use custom dynamic colors derived from CSS variables.
