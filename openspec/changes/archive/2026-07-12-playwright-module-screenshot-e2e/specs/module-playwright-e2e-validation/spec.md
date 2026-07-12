## ADDED Requirements

### Requirement: Module-based Playwright coverage for core tabs
The test system MUST define Playwright E2E scenarios that validate Dashboard, History, Stats, and Settings module flows as independent module checkpoints.

#### Scenario: Dashboard module flow is validated
- **WHEN** the E2E suite runs the Dashboard module scenario
- **THEN** the scenario SHALL add a transaction through the UI flow and verify the resulting dashboard state before completion

#### Scenario: History module flow is validated
- **WHEN** the E2E suite runs the History module scenario
- **THEN** the scenario SHALL apply a history filter and verify the filtered list behavior before completion

#### Scenario: Stats module flow is validated
- **WHEN** the E2E suite runs the Stats module scenario
- **THEN** the scenario SHALL switch account group scope and verify that statistics view content updates accordingly

#### Scenario: Settings module flow is validated
- **WHEN** the E2E suite runs the Settings module scenario
- **THEN** the scenario SHALL execute the backup action flow and verify the action outcome state before completion

### Requirement: Module failures remain isolated and attributable
The test system SHALL keep module scenarios independently identifiable so a failing module does not hide pass/fail status of other modules.

#### Scenario: One module fails while others remain reportable
- **WHEN** one module scenario fails during execution
- **THEN** the report SHALL identify the failed module scenario by name
- **AND** other module scenarios SHALL still report their own pass/fail outcomes
