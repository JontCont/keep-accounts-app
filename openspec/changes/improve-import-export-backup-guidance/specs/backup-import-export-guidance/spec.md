## ADDED Requirements

### Requirement: Backup import/export guidance is consistent and explicit

The system SHALL present consistent user guidance for backup export and import/restore across the Settings UI and README documentation. The guidance SHALL explicitly describe that restore/import overwrites current account and transaction data.

#### Scenario: User reads export and restore instructions in Settings

- **WHEN** the user opens the Settings backup section
- **THEN** the system SHALL show export backup guidance and import/restore guidance using consistent terminology
- **AND** the system SHALL include an overwrite-risk warning for restore/import actions

#### Scenario: User reads setup documentation

- **WHEN** a user reads README setup notes for backup operations
- **THEN** the documentation SHALL describe the same export and import/restore flow as the Settings UI
- **AND** the documentation SHALL state that restore/import replaces current account and transaction data

### Requirement: Backup payload contract is documented for operators

The system SHALL document backup archive validity expectations for operators and reviewers. The documented contract SHALL state that the archive contains `backup_data.json` with `keep_accounts_groups` and `keep_accounts_transactions`.

#### Scenario: Operator validates backup format expectations

- **WHEN** an operator follows backup troubleshooting guidance
- **THEN** the guidance SHALL identify `backup_data.json` as the required payload file
- **AND** the guidance SHALL identify both required top-level keys used for restore

### Requirement: Verification targets are documented and executable

The system SHALL provide concrete verification commands for backup service behavior and persistence compatibility behavior in setup guidance.

#### Scenario: Reviewer executes documented verification commands

- **WHEN** a reviewer runs the documented verification commands
- **THEN** the commands SHALL target backup service tests and persistence fallback tests
- **AND** the commands SHALL be directly executable in the workspace without additional undocumented flags
