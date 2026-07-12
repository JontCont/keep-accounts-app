## ADDED Requirements

### Requirement: Native persistence uses local SQLite as primary storage

The system SHALL persist account groups and transactions in a local SQLite database on native platforms. On startup, the system SHALL load persisted data from SQLite before rendering data-dependent views.

#### Scenario: Native startup loads from SQLite

- **WHEN** the app starts on a native platform with existing SQLite records
- **THEN** account groups and transactions SHALL be loaded from SQLite as the primary source

#### Scenario: SQLite unavailable falls back to compatibility storage

- **WHEN** the app cannot open or query SQLite on startup
- **THEN** the app SHALL load data from compatibility storage and keep the app operational

#### Scenario: Mutation writes through SQLite persistence

- **WHEN** a transaction or account-group mutation succeeds
- **THEN** the updated dataset SHALL be persisted to SQLite
