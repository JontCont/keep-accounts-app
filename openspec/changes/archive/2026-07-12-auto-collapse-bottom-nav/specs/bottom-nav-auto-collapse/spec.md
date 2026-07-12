## ADDED Requirements

### Requirement: Bottom navigation auto-compacts on downward scroll
The system SHALL automatically switch the bottom navigation into compact mode when the user scrolls downward beyond a configured collapse threshold.

#### Scenario: Compact after downward threshold crossing
- **WHEN** the user scrolls downward and the scroll distance crosses the collapse threshold
- **THEN** the bottom navigation SHALL transition from expanded to compact mode

### Requirement: Bottom navigation auto-expands on upward scroll
The system SHALL automatically return the bottom navigation to expanded mode when the user scrolls upward beyond a configured expand threshold.

#### Scenario: Expand after upward threshold crossing
- **WHEN** the user scrolls upward and the scroll distance crosses the expand threshold
- **THEN** the bottom navigation SHALL transition from compact to expanded mode

### Requirement: Compact mode preserves navigation usability
The system SHALL preserve navigation accessibility in compact mode by keeping tab icons visible, active-state indication visible, and touch targets usable.

#### Scenario: Compact mode remains operable
- **WHEN** the bottom navigation is in compact mode
- **THEN** users SHALL still be able to identify and activate any tab destination without expanding first

### Requirement: Safety overrides keep nav expanded during high-priority interactions
The system SHALL force expanded bottom navigation while high-priority interaction layers are active to prevent motion conflicts.

#### Scenario: Overlay keeps expanded mode
- **WHEN** a high-priority interaction layer is active (for example modal or action sheet)
- **THEN** the bottom navigation SHALL remain in expanded mode regardless of scroll direction

##### Example: modal interaction
- **GIVEN** the nav is compact after downward scrolling
- **WHEN** a modal is opened
- **THEN** the nav returns to expanded mode and stays expanded until the modal is dismissed
