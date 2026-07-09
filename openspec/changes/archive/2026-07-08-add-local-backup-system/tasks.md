## 1. Setup and Dependencies

- [x] 1.1 Install dependencies `@capacitor/filesystem`, `@capacitor/share`, and `fflate`. Verify by inspecting `package.json` to ensure the libraries are added to the dependency list.

## 2. Core Backup and Restore Service Implementation

- [x] 2.1 Implement platform detection logic to support "Decision 2: Capacitor Filesystem for Native and HTML Link for Web" and "Platform-Specific Export and Import" requirements. Verify that calling the backup module returns the correct environment flags on Web and Native (iOS/Android).
- [x] 2.2 Implement zip compression and decompression utility to satisfy "Decision 1: Compressed Standard ZIP Format with fflate" and "Backup Data Compression" requirements. Verify by unit testing or manual testing that compressing and decompressing the groups and transactions JSON payload results in the exact same original JSON content.
- [x] 2.3 Implement the import history logger to satisfy "Decision 3: Import History Log in localStorage" and "Import History Logging" requirements. Verify that calling the import logger creates, updates, and reads records from the `keep_accounts_import_history` key in `localStorage` successfully.
- [x] 2.4 Implement native background file saving to satisfy "Decision 4: Automatic Background Backup Trigger" and "Platform-Specific Export and Import" requirements. Verify that file writing functions correctly write the compressed backup to the native documents directory on native platforms.

## 3. UI Settings Integration

- [x] 3.1 Integrate backup, restore, auto-backup toggle, and import history logs UI into settings page inside `apps/web/src/app/app.tsx`. Verify that clicking "Export Backup" triggers file download on Web / share sheet on Native, toggling automatic backup auto-saves records on change, and import logs are displayed correctly on the screen.
