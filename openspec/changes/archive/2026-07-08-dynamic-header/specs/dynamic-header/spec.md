## ADDED Requirements

### Requirement: Tab-Specific Header Titles
The system SHALL dynamically update the header title in the application layout based on the active navigation tab.
When the user switches tabs:
- For the 'dashboard' tab, the system SHALL display the main title 'Keep Accounts' and subtitle '精緻微型記帳系統'.
- For the 'history' tab, the system SHALL display the title '歷史交易明細'.
- For the 'stats' tab, the system SHALL display the title '支出統計分析'.
- For the 'settings' tab, the system SHALL display the title '系統設定'.

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

### Requirement: Conditional Date Visibility
The system SHALL conditionally display the current date and day of the week in the header based on the active tab.
- For the 'dashboard' tab, the current date and day of the week SHALL be visible on the right side of the header.
- For all other tabs ('history', 'stats', 'settings'), the date and day of the week SHALL be hidden.

#### Scenario: Date display on Dashboard
- **WHEN** user views the 'dashboard' tab
- **THEN** header displays the current date and day of the week on the right side

#### Scenario: Date hidden on non-Dashboard tabs
- **WHEN** user views any tab other than 'dashboard'
- **THEN** header does not display the date and day of the week on the right side

### Requirement: Removal of Redundant Sub-Tab Headers
The system SHALL NOT render redundant page/section headers inside the sub-tab component views (`HistoryTab`, `StatsTab`, and the settings pane in `app.tsx`), as these are now provided dynamically by the main header.

#### Scenario: Clean sub-tab viewport
- **WHEN** user views 'history', 'stats', or 'settings' tabs
- **THEN** no duplicate titles are rendered within the tab content area
