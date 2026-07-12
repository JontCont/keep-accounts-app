## ADDED Requirements

### Requirement: Checkpoint screenshot evidence is captured after validation
The Playwright module scenarios MUST capture screenshots only after assertion checkpoints confirm the module state under test.

#### Scenario: Screenshot is taken after dashboard checkpoint assertion
- **WHEN** the Dashboard module scenario confirms post-add-transaction state
- **THEN** the scenario SHALL capture a screenshot artifact for that checkpoint

#### Scenario: Screenshot is taken after history checkpoint assertion
- **WHEN** the History module scenario confirms filtered-list state
- **THEN** the scenario SHALL capture a screenshot artifact for that checkpoint

#### Scenario: Screenshot is taken after stats checkpoint assertion
- **WHEN** the Stats module scenario confirms account-group-switched statistics state
- **THEN** the scenario SHALL capture a screenshot artifact for that checkpoint

#### Scenario: Screenshot is taken after settings checkpoint assertion
- **WHEN** the Settings module scenario confirms backup-action outcome state
- **THEN** the scenario SHALL capture a screenshot artifact for that checkpoint

### Requirement: Screenshot artifacts are reviewable by module
Screenshot outputs SHALL be named and organized so reviewers can map each image to the module and checkpoint it proves.

#### Scenario: Reviewer maps artifacts to module checkpoints
- **WHEN** a reviewer inspects generated screenshot artifacts from one E2E run
- **THEN** the reviewer SHALL identify which screenshot corresponds to Dashboard, History, Stats, and Settings checkpoints without reading test source code
