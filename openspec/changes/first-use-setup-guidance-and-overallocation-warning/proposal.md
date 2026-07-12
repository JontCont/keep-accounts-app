## Why

New users currently start from an empty workspace and can record income before setting up account-group allocation context, which causes confusing dashboard feedback in the first session. The current hard block that requires non-source target ratios to equal 100% also creates unnecessary friction during first-time setup.

## What Changes

- Add a first-use setup guidance flow that leads users through initial setup in a stable order: total-asset baseline input, then major account-group allocation setup, then income recording.
- Change allocation ratio validation behavior from hard blocking to soft warning: saving remains allowed when total ratio exceeds 100%, and the UI shows an over-allocation hint.
- Keep sum less than or equal to 100% as a valid state without warning, representing intentionally unallocated ratio.

## Non-Goals (optional)

- No backend or storage engine migration in this change.
- No automatic normalization of ratios to 100% during save.
- No redesign of unrelated tabs or chart logic.

## Capabilities

### New Capabilities

- first-use-setup-guidance: Provide first-session setup guidance that ensures users configure baseline and major allocation before relying on income-driven allocation feedback.
- allocation-ratio-warning-policy: Define non-blocking ratio-save policy with warning only when total non-source ratio is greater than 100%.

### Modified Capabilities

- allocation-income-block: Clarify behavior when non-source ratio total is less than 100% or greater than 100%, including warning semantics and no hard save lock.

## Impact

- Affected specs: first-use-setup-guidance, allocation-ratio-warning-policy, allocation-income-block
- Affected code:
  - New: openspec/changes/first-use-setup-guidance-and-overallocation-warning/specs/first-use-setup-guidance/spec.md, openspec/changes/first-use-setup-guidance-and-overallocation-warning/specs/allocation-ratio-warning-policy/spec.md
  - Modified: apps/web/src/app/components/GroupSettingsModal.tsx, libs/shared/state/src/lib/use-keep-accounts.ts, apps/web/src/app/components/DashboardTab.tsx, apps/web/src/app/app.tsx, openspec/specs/allocation-income-block/spec.md
  - Removed: none
