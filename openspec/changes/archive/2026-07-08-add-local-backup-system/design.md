## Context

The application runs locally in a webview using Ionic and Capacitor. Data is persisted in `localStorage` under `keep_accounts_groups` and `keep_accounts_transactions`. To prevent data loss when reinstalling the app or clearing local browser storage, we will implement a secure, local-only backup and restore system that compresses files as `.zip` containing the database JSON.

## Goals / Non-Goals

**Goals:**
- Implement a `BackupService` to encapsulate platform detection, compression, filesystem operations, and log tracking.
- Package backup JSON data into standard `.zip` files using `fflate`.
- Integrate `@capacitor/filesystem` for native automatic background backup and native file writing.
- Integrate `@capacitor/share` to allow sharing the backup file.
- Maintain an import history list in `localStorage` to audit all successful and failed import attempts.
- Build UI settings in `app.tsx` to toggle automatic backup, trigger manual backup/restore, and display the import history.

**Non-Goals:**
- Syncing backup files to external cloud storage providers directly from application code.
- Automating data restore on startup without user confirmation.

## Decisions

### Decision 1: Compressed Standard ZIP Format with fflate
- **Rationale**: Standard ZIP format is widely supported and can be unzipped by the user on any device if needed. `fflate` is a tiny, high-performance compression library (less than 8KB gzipped) and works in both Web and Native environments.
- **Alternatives Considered**: Using base64 string compression (`lz-string`). While simpler, a standard `.zip` file is easier for users to identify and manage as a backup file.

### Decision 2: Capacitor Filesystem for Native and HTML Link for Web
- **Rationale**: Using `@capacitor/filesystem` allows direct writing to the device's native `Documents` folder. On web platforms, standard browser `<a download>` is used.
- **Alternatives Considered**: Relying on web download in WebViews. This is unreliable on native iOS/Android, making native filesystem writing necessary.

### Decision 3: Import History Log in localStorage
- **Rationale**: An audit log of all imports stored locally ensures users can see when and what they restored, reducing confusion.
- **Alternatives Considered**: Logging to console only. Console logs are not accessible to end-users, rendering them useless for debugging restore issues.

### Decision 4: Automatic Background Backup Trigger
- **Rationale**: Native platforms can write backups to the persistent `Documents` folder in the background. Triggering this on data change ensures the local backup is always fresh.
- **Alternatives Considered**: Scheduled time-based backups (e.g. daily). This requires background service workers which add complexity and battery consumption. On-change backup is simpler and more reliable.

## Implementation Contract

- **Behavior**:
  - Users see a "Backup & Restore" section in the settings.
  - Clicking "Export Backup" downloads a compressed `.zip` file (Web) or writes it to the Documents folder and opens the share panel (Native).
  - Clicking "Import Backup" prompts for a `.zip` file, validates its structure, restores groups and transactions, adds an entry to the import log, and reloads the UI.
  - Toggling "Automatic Backup" (Native only) auto-saves a compressed database JSON file to `Documents/keep_accounts_backup.json.zip` on every data change.
  - Users can view a list of past import attempts with timestamps and filenames.

- **Interface / Data Shape**:
  - Backup File JSON payload format:
    ```json
    {
      "keep_accounts_groups": [...],
      "keep_accounts_transactions": [...]
    }
    ```
  - Import Log shape in `localStorage` (`keep_accounts_import_history`):
    ```typescript
    interface ImportRecord {
      id: string;
      timestamp: string;
      fileName: string;
      fileSize: number;
      groupsCount: number;
      transactionsCount: number;
      status: 'success' | 'failed';
      errorMessage?: string;
    }
    ```

- **Failure Modes**:
  - If the uploaded zip is corrupted or invalid, the system SHALL display an alert with "Invalid backup file", log a `failed` import entry with the error message, and NOT modify `localStorage` database keys.
  - If filesystem permission is denied on native, automatic backup is gracefully disabled and a warning toast is displayed.

- **Acceptance Criteria**:
  - Manual export produces a valid `.zip` containing a `backup_data.json` file.
  - Importing this `.zip` restores the exact transactions and groups.
  - Success and failure import attempts are logged in the history.
  - The code handles invalid/corrupt zips without crashing.

- **Scope boundaries**:
  - Only transactions and groups data are exported/imported. App settings (like theme) are out of scope.

## Risks / Trade-offs

- **[Risk] Disk space consumption of auto-backups** → *Mitigation*: Keep only the latest auto-backup in the Documents folder by overwriting it (`keep_accounts_backup.json.zip`), rather than creating new files every time.
- **[Risk] Large databases cause slow zip generation** → *Mitigation*: Zip operations are performed asynchronously to prevent blocking the UI thread.
