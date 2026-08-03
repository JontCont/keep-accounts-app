## Why

`GroupSettingsModal.tsx` contained hardcoded Chinese icon label mappings (`ICON_NAMES_ZH`) and an unused `React` default import triggering `ts(6133)`. Extracting `ICON_NAMES_ZH` to `@keep-accounts-app/domain` centralizes icon metadata into a Single Source of Truth (SSOT), and cleaning up unused imports removes editor warnings.

## What Changes

- Export `ICON_NAMES_ZH` in `libs/shared/domain/src/lib/icons.ts`.
- Refactor `GroupSettingsModal.tsx` to consume `ICON_NAMES_ZH` from `@keep-accounts-app/domain` and clean up `import React`.

## Non-Goals

- Modifying `GroupSettingsModal` UI functionality or layout behavior.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: (none)
- Affected code:
  - Modified: `libs/shared/domain/src/lib/icons.ts`
  - Modified: `apps/web/src/app/components/GroupSettingsModal.tsx`
