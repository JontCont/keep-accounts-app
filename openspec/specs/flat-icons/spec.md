# flat-icons Specification

## Purpose

TBD - created by archiving change 'integrate-lucide-icons'. Update Purpose after archive.

## Requirements

### Requirement: AppIcon Component Integration
The system SHALL provide a reusable `<AppIcon name={name} />` component.
When the `name` prop matches a registered Lucide icon identifier, the system SHALL render the corresponding Lucide React SVG icon.
When the `name` prop is a standard Unicode emoji character, the system SHALL render the raw emoji character as text to ensure backward compatibility.

#### Scenario: Render Lucide Icon
- **WHEN** name is 'home'
- **THEN** system renders the Lucide 'Home' icon

#### Scenario: Fallback to Unicode Emoji
- **WHEN** name is '💳'
- **THEN** system renders '💳' as plain text


<!-- @trace
source: integrate-lucide-icons
updated: 2026-07-08
code:
  - apps/web/src/app/components/GroupSettingsModal.tsx
  - apps/web/src/app/app.tsx
  - apps/web/src/app/components/HistoryTab.tsx
  - apps/web/src/app/components/AppIcon.tsx
  - apps/web/src/app/components/StatsTab.tsx
  - libs/shared/domain/src/lib/constants.ts
  - package.json
  - apps/web/src/app/components/DashboardTab.tsx
tests:
  - apps/web/src/app/components/AppIcon.spec.tsx
-->

---
### Requirement: UI Emoji Migration to Flat Icons
The system SHALL replace all hardcoded Unicode emojis in headers, bottom navigation, and tabs with `<AppIcon>` components using color-neutral line styles.
The default categories and account groups SHALL be updated to use Lucide icon keys instead of emojis.

#### Scenario: Navigation icon rendering
- **WHEN** settings tab is active
- **THEN** navigation bar displays the Lucide 'Settings' line icon

<!-- @trace
source: integrate-lucide-icons
updated: 2026-07-08
code:
  - apps/web/src/app/components/GroupSettingsModal.tsx
  - apps/web/src/app/app.tsx
  - apps/web/src/app/components/HistoryTab.tsx
  - apps/web/src/app/components/AppIcon.tsx
  - apps/web/src/app/components/StatsTab.tsx
  - libs/shared/domain/src/lib/constants.ts
  - package.json
  - apps/web/src/app/components/DashboardTab.tsx
tests:
  - apps/web/src/app/components/AppIcon.spec.tsx
-->