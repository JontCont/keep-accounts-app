## ADDED Requirements

### Requirement: Edit Transaction Trigger in History Tab
The system SHALL display an edit button (using the Lucide `edit` icon) next to the delete button on each transaction row in the History tab.
When the user clicks the edit button, the system SHALL open the Transaction Modal populated with the transaction's existing details.
Saving the edited transaction MUST correctly update the transaction record in the application state and persist it.

#### Scenario: Populate and edit transaction
- **WHEN** user clicks the edit button on a transaction in the History list
- **THEN** standard Transaction Modal opens populated with that transaction's description, amount, type, category, date, and account group

### Requirement: Add Transaction FAB in History Tab
The system SHALL display a Floating Action Button (FAB) using a `plus` icon in the bottom-right corner of the History tab.
The FAB MUST be styled with a glassmorphism theme and positioned so it does not cover list content or overlap bottom navigation.
When the user clicks the FAB, the system SHALL open the Transaction Modal in creation mode.

#### Scenario: Open empty modal from FAB
- **WHEN** user clicks the FAB in the History tab
- **THEN** standard Transaction Modal opens in creation mode (empty fields/default values)
