## ADDED Requirements

### Requirement: Non-Blocking Ratio Save Policy
The system SHALL allow saving account-group target ratios for any non-source total value and SHALL NOT enforce a hard failure when totals are not exactly 100.

#### Scenario: Save with ratio total less than 100
- **WHEN** the non-source target-ratio sum is 90
- **THEN** the system SHALL save successfully without warning

##### Example: Under-allocation is accepted
- **GIVEN** three non-source groups with ratios 40, 30, and 20
- **WHEN** the user saves group settings
- **THEN** save succeeds and no warning message is shown

#### Scenario: Save with ratio total greater than 100
- **WHEN** the non-source target-ratio sum is 110
- **THEN** the system SHALL save successfully and SHALL display an over-allocation warning indicating overflow of 10

##### Example: Over-allocation warning value
- **GIVEN** three non-source groups with ratios 50, 35, and 25
- **WHEN** the user saves group settings
- **THEN** save succeeds and warning text indicates over-allocation by 10 percent points

### Requirement: Ratio values remain user-authored
The system SHALL persist ratio values exactly as entered by the user and SHALL NOT auto-normalize them to 100 during save.

#### Scenario: Save without normalization
- **WHEN** the user saves non-source ratios that sum to 110
- **THEN** persisted ratios SHALL remain unchanged from user input values
