## ADDED Requirements

### Requirement: First-Use Guided Setup Sequence
The application SHALL provide a first-use guided setup sequence that establishes setup prerequisites before users rely on income-driven allocation feedback.

#### Scenario: New user starts with no persisted groups
- **WHEN** the app detects a first-use state with no persisted account groups
- **THEN** it SHALL present setup guidance that prioritizes total-asset baseline and major account-group setup before income entry becomes primary

##### Example: Guided order for first session
- **GIVEN** a brand new installation with empty persisted data
- **WHEN** the user opens the app for the first time
- **THEN** guidance order SHALL be: total-asset baseline, account-group allocation setup, income entry

### Requirement: Setup completion state controls guidance visibility
The application SHALL hide first-use guidance after required setup checkpoints are completed for the current user state.

#### Scenario: User completes setup checkpoints
- **WHEN** baseline setup and major account-group setup checkpoints are complete
- **THEN** first-use guidance SHALL be marked complete and no longer block the normal entry flow
