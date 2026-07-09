## Why

The application is a local-only app storing account groups and transactions in `localStorage`. Without a backup system, reinstalling the app or clearing local browser data results in permanent data loss. A secure, compressed, and offline backup/restore mechanism is required to prevent data loss.

## What Changes

- Add platform detection to differentiate between web development and native environments (iOS/Android).
- Introduce a manual backup and restore feature using compressed `.zip` files (containing the groups and transactions JSON) with `fflate`.
- Integrate `@capacitor/filesystem` to write backups to the native `Documents` directory, and `@capacitor/share` to allow sharing the backup file.
- Provide an automatic background backup option on native platforms that triggers on every data change.
- Implement an import history logger to record all import/restore actions in `localStorage`.

## Capabilities

### New Capabilities

- `local-backup`: Encapsulates local backup generation, file compression, native share/save operations, restore mechanisms, and import log tracking.

### Modified Capabilities

(none)

## Impact

- Affected specs: `local-backup`
- Affected code:
  - New:
    - `apps/web/src/app/services/backup.ts`
  - Modified:
    - `package.json`
    - `apps/web/src/app/app.tsx`
