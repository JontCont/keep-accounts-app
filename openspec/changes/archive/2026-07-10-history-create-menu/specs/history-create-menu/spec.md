## ADDED Requirements

### Requirement: History page create menu
The system SHALL expose a two-option create menu from the existing create icon on the history page.
The system SHALL keep the create icon in its original position and layout.
The menu SHALL provide options for general transaction entry and installment entry.

#### Scenario: history create icon opens the menu
- **WHEN** the user clicks the create icon on the history page
- **THEN** the system SHALL display a menu with general and installment options
- **AND THEN** the create icon SHALL remain in the same page location

### Requirement: Entry mode routes to the correct transaction flow
The system SHALL open the existing normal transaction flow when the user chooses the general option.
The system SHALL open the transaction modal in installment mode when the user chooses the installment option.
The system SHALL keep non-history pages on their current create behavior and SHALL NOT show the history-only menu there.

#### Scenario: choosing installment opens installment mode
- **WHEN** the user chooses the installment option from the history page create menu
- **THEN** the system SHALL open the transaction modal in installment mode
- **AND THEN** the modal SHALL be ready for installment entry without requiring a second mode chooser

#### Scenario: non-history pages keep the original create behavior
- **WHEN** the user clicks the create action on a non-history page
- **THEN** the system SHALL use the existing create flow
- **AND THEN** the history-only menu SHALL not appear
