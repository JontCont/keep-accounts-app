## ADDED Requirements

### Requirement: Platform-Specific Export and Import
The system SHALL support backup export and import on both web and native platforms.
On web platforms, the system SHALL trigger browser-based file downloads and uploads.
On native platforms (iOS and Android), the system SHALL read and write backup files to the native documents directory, and trigger the native sharing sheet for manual backups.

#### Scenario: Manual export on web
- **WHEN** user clicks export on web
- **THEN** browser downloads a zip file containing the data

#### Scenario: Manual export on native
- **WHEN** user clicks export on native
- **THEN** system writes a zip file to native documents directory and triggers native sharing sheet

#### Scenario: Automatic backup on native
- **WHEN** automatic backup is enabled and database records change
- **THEN** system writes a zip file to the native documents directory in the background

### Requirement: Backup Data Compression
The system MUST compress the backup data using `fflate` into standard `.zip` format.
The compressed `.zip` file SHALL contain the serialized JSON of account groups and transactions.

#### Scenario: Backup file creation
- **WHEN** backup is generated
- **THEN** system packages 'keep_accounts_groups' and 'keep_accounts_transactions' data into a zip file

### Requirement: Import History Logging
The system SHALL log all import attempts in local storage under `keep_accounts_import_history`.
Each log entry MUST record the timestamp, file name, file size, groups count, transactions count, status, and any error message.

#### Scenario: Success log on valid import
- **WHEN** user imports a valid zip backup
- **THEN** system restores database, adds a success log entry to history, and reloads the application

#### Scenario: Error log on invalid import
- **WHEN** user imports an invalid file
- **THEN** system aborts restore, shows error message, and adds a failure log entry to history
