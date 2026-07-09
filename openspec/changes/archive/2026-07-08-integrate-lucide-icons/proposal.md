## Why

The application currently uses Unicode emojis for navigation, accounts, and categories. These emojis look too colorful and 3D, which conflicts with a modern, flat, minimal visual style. A flat, color-neutral, outline-based icon system is needed.

## What Changes

- Install `lucide-react` to provide minimal flat outline SVG icons.
- Implement a reusable `<AppIcon name={name} />` wrapper component. It will map icon names (like "home", "wallet") to Lucide icons and fallback to rendering the raw string if it's a Unicode emoji (for backward compatibility).
- Replace hardcoded emojis in the main header, bottom navigation bar, tabs, and buttons with `<AppIcon>` components.
- Update default account groups and categories emoji indicators to use Lucide icon identifier strings.

## Capabilities

### New Capabilities

- `flat-icons`: Provides a flat, color-neutral outline icon component mapping and UI rendering.

### Modified Capabilities

(none)

## Impact

- Affected specs: `flat-icons`
- Affected code:
  - New:
    - `apps/web/src/app/components/AppIcon.tsx`
  - Modified:
    - `package.json`
    - `apps/web/src/app/app.tsx`
    - `apps/web/src/app/components/DashboardTab.tsx`
    - `apps/web/src/app/components/HistoryTab.tsx`
    - `apps/web/src/app/components/StatsTab.tsx`
    - `apps/web/src/app/components/GroupSettingsModal.tsx`
    - `libs/shared/domain/src/lib/domain.ts`
