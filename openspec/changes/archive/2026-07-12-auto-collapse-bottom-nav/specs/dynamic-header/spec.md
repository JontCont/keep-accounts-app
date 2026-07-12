## MODIFIED Requirements

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

#### Scenario: Header remains stable while bottom nav changes presentation
- **WHEN** the bottom navigation transitions between expanded and compact states on the same active tab
- **THEN** the header title and subtitle visibility SHALL remain unchanged for that active tab
