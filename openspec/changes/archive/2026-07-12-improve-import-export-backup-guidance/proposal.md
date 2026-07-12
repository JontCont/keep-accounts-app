## Why

Users can perform backup export and restore in the app, but the setup guidance is fragmented and does not clearly explain overwrite behavior, backup payload format, or verification steps. We need a single, durable proposal that aligns product copy, README guidance, and verification targets so future changes remain safe and understandable.

## What Changes

- Add a dedicated capability for backup import/export guidance that defines required user-facing instructions and operator verification steps.
- Standardize in-app wording for export, import/restore, overwrite warning, and import-history traceability messaging.
- Standardize README setup notes for both English and Traditional Chinese so users can complete backup export/restore without hidden assumptions.
- Define testable verification commands for backup service behavior and persistence fallback behavior.

## Non-Goals (optional)

- Replacing the underlying storage architecture or changing SQLite persistence strategy.
- Changing Playwright configuration or E2E infrastructure.
- Introducing cloud backup, account sync, or remote storage.

## Capabilities

### New Capabilities

- `backup-import-export-guidance`: Define consistent import/export user guidance, overwrite safety messaging, backup payload contract, and verification expectations across app and README.

### Modified Capabilities

(none)

## Impact

- Affected specs: backup-import-export-guidance
- Affected code:
  - New: openspec/changes/improve-import-export-backup-guidance/specs/backup-import-export-guidance/spec.md
  - Modified: apps/web/src/app/app.tsx
  - Modified: apps/web/src/app/services/backup.ts
  - Modified: README.md
  - Modified: apps/web/src/app/services/backup.spec.ts
  - Removed: none
