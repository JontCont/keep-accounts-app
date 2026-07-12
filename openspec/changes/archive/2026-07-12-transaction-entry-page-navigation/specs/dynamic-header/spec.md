## MODIFIED Requirements

### Requirement: Tab-Specific Header Titles
The system SHALL dynamically update the header title in the application layout based on the active navigation context.
When the user is in a top-level tab context:
- For the 'dashboard' tab, the system SHALL display the main title 'Keep Accounts' and subtitle '精緻微型記帳系統'.
- For the 'history' tab, the system SHALL display the title '歷史交易明細'.
- For the 'stats' tab, the system SHALL display the title '支出統計分析'.
- For the 'settings' tab, the system SHALL display the title '系統設定'.
When the user is in transaction entry context:
- The system SHALL display a transaction entry title that reflects mode.
- In create mode, the title SHALL indicate adding a transaction.
- In edit mode, the title SHALL indicate editing a transaction.
- The header SHALL show a back action to return to the invoking context.

#### Scenario: Switching to Dashboard tab
- **WHEN** user selects the 'dashboard' tab
- **THEN** header title displays 'Keep Accounts' and subtitle displays '精緻微型記帳系統'

#### Scenario: Switching to History tab
- **WHEN** user selects the 'history' tab
- **THEN** header title displays '歷史交易明細' and subtitle is hidden

#### Scenario: Switching to Stats tab
- **WHEN** user selects the 'stats' tab
- **THEN** header title displays '支出統計分析' and subtitle is hidden

#### Scenario: Switching to Settings tab
- **WHEN** user selects the 'settings' tab
- **THEN** header title displays '系統設定' and subtitle is hidden

#### Scenario: Entering transaction create context
- **WHEN** user opens transaction entry in create mode
- **THEN** header displays a create-transaction title
- **AND** header provides a back action

#### Scenario: Entering transaction edit context
- **WHEN** user opens transaction entry in edit mode
- **THEN** header displays an edit-transaction title
- **AND** header provides a back action

### Requirement: Conditional Date Visibility
The system SHALL conditionally display the current date and day of the week in the header based on the active context.
- For the 'dashboard' tab, the current date and day of the week SHALL be visible on the right side of the header.
- For all other top-level tabs ('history', 'stats', 'settings'), the date and day of the week SHALL be hidden.
- For transaction entry context, the date and day of the week SHALL be hidden.

#### Scenario: Date display on Dashboard
- **WHEN** user views the 'dashboard' tab
- **THEN** header displays the current date and day of the week on the right side

#### Scenario: Date hidden on non-Dashboard tabs
- **WHEN** user views any top-level tab other than 'dashboard'
- **THEN** header does not display the date and day of the week on the right side

#### Scenario: Date hidden on transaction entry context
- **WHEN** user views transaction entry context
- **THEN** header does not display the date and day of the week on the right side
