## Why

The bottom navigation currently stays fully expanded at all times, which consumes vertical space during scrolling and can reduce content focus on mobile-sized screens. We need an automatic, predictable compact/expand behavior that improves readability without introducing manual UI state conflicts.

## What Changes

- Add automatic bottom-nav compact/expand behavior driven by scroll direction and thresholds.
- Keep navigation always accessible by using compact mode (not full hide) when collapsed.
- Introduce guard conditions so nav stays expanded during high-priority interactions (e.g., modal/action-sheet/keyboard focus scenarios).
- Ensure interaction safety by preserving touch targets and active-state visibility in both expanded and compact states.

## Non-Goals (optional)

- Add a manual "collapse/expand" toggle or persistent user preference for nav size.
- Redesign tab information architecture (labels, ordering, destination routing).
- Change business logic in dashboard/history/stats/settings content modules.

## Capabilities

### New Capabilities

- `bottom-nav-auto-collapse`: Automatically compacts and expands the bottom tab bar based on interaction-safe scroll behavior.

### Modified Capabilities

- `dynamic-header`: Clarify layout-level behavior so header/title updates remain stable while bottom nav changes between expanded and compact states.

## Impact

- Affected specs: bottom-nav-auto-collapse (new), dynamic-header (modified)
- Affected code:
  - Modified: apps/web/src/app/app.tsx
  - Modified: apps/web/src/styles.css
  - Modified: apps/web/src/app/app.spec.tsx
  - Modified: apps/web/src/app/components/HistoryTab.tsx
  - Modified: apps/web/src/app/components/DashboardTab.tsx
  - New: apps/web/src/app/components/BottomNav.tsx
