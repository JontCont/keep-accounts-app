## Why

The project currently has only a placeholder Playwright test and lacks end-to-end verification for the four production modules (Dashboard, History, Stats, Settings). We need deterministic module-level E2E coverage with visual evidence so stakeholders can quickly validate pass/fail outcomes.

## What Changes

- Add module-oriented Playwright scenarios for Dashboard, History, Stats, and Settings in `apps/web-e2e`.
- Add per-module screenshot capture at validated checkpoints to provide reviewable pass evidence.
- Replace the placeholder `example.spec.ts` smoke assertion with business-flow assertions aligned to current app modules.
- Keep test execution within existing Nx Playwright target and report outputs.

## Capabilities

### New Capabilities

- `module-playwright-e2e-validation`: Defines required E2E user flows and assertions for Dashboard, History, Stats, and Settings modules.
- `module-playwright-screenshot-evidence`: Defines screenshot evidence requirements tied to module-specific verification checkpoints.

### Modified Capabilities

(none)

## Impact

- Affected specs: `module-playwright-e2e-validation`, `module-playwright-screenshot-evidence`
- Affected code:
  - New:
    - apps/web-e2e/src/module-dashboard.spec.ts
    - apps/web-e2e/src/module-history.spec.ts
    - apps/web-e2e/src/module-stats.spec.ts
    - apps/web-e2e/src/module-settings.spec.ts
  - Modified:
    - apps/web-e2e/src/example.spec.ts
    - apps/web-e2e/playwright.config.mts
    - apps/web/src/app/app.tsx
    - apps/web/src/app/components/HistoryTab.tsx
    - apps/web/src/app/components/StatsTab.tsx
  - Removed:
    - (none)
