## 1. Setup and Library Integration

- [x] 1.1 Install dependency `lucide-react`. Verify by inspecting package.json to satisfy "Decision 1: Lucide React Integration".

## 2. Icon Wrapper Component

- [x] 2.1 Implement `<AppIcon>` component in `apps/web/src/app/components/AppIcon.tsx` to support "Decision 2: AppIcon Wrapper for Emoji Fallback" and "AppIcon Component Integration" requirements. Verify by unit testing or content review that calling `<AppIcon name="home" />` returns the Lucide Home SVG and `<AppIcon name="💳" />` falls back to the emoji text.

## 3. UI and Mock Data Migration

- [x] 3.1 Migrate default mock data in `libs/shared/domain/src/lib/domain.ts` to satisfy "Decision 3: Default Data Migration" and "UI Emoji Migration to Flat Icons" requirements. Verify that default account groups and categories use Lucide icon strings by verifying all unit tests pass.
- [x] 3.2 Update navigation tabs and headers in `apps/web/src/app/app.tsx` to satisfy "UI Emoji Migration to Flat Icons" and "Decision 4: Color Neutral Styling" requirements. Verify by rendering the app and inspecting bottom navigation buttons to ensure outline line icons are visible and color-neutral.
- [x] 3.3 Update mock icons selection modal in `apps/web/src/app/components/GroupSettingsModal.tsx` and tab views in `DashboardTab.tsx`, `HistoryTab.tsx`, `StatsTab.tsx`. Verify by rendering accounts list to ensure the Lucide icons render correctly.
