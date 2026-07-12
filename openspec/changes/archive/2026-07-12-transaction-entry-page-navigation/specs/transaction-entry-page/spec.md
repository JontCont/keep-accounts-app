## ADDED Requirements

### Requirement: Dedicated Transaction Entry Page
The system SHALL provide a dedicated transaction entry page for creating and editing transactions instead of presenting the transaction form in a modal.

#### Scenario: Open create flow from dashboard
- **WHEN** the user triggers add transaction from the dashboard context
- **THEN** the system SHALL navigate to the transaction entry page in create mode
- **AND** the page SHALL display editable fields for transaction type, account group, category, description, amount, and date

#### Scenario: Open edit flow from history
- **WHEN** the user triggers edit on an existing transaction from history
- **THEN** the system SHALL navigate to the transaction entry page in edit mode
- **AND** the page SHALL prefill all editable fields with the selected transaction values

### Requirement: Transaction Entry Back Navigation
The transaction entry page SHALL expose a visible back action that returns the user to the invoking context.

#### Scenario: Return to dashboard context
- **WHEN** the transaction entry page was opened from dashboard and the user selects back
- **THEN** the system SHALL return to dashboard context

#### Scenario: Return to history context
- **WHEN** the transaction entry page was opened from history and the user selects back
- **THEN** the system SHALL return to history context

### Requirement: Form Behavior Parity With Existing Entry Flow
The transaction entry page MUST preserve current transaction form behavior semantics that users rely on.

#### Scenario: Save success in create mode
- **WHEN** the user submits valid create-form data
- **THEN** the system SHALL persist the transaction with the same validation and normalization behavior as the previous entry flow

#### Scenario: Installment configuration remains available
- **WHEN** the user enters create mode with expense type
- **THEN** the system SHALL provide installment configuration controls with the same per-period splitting behavior as before
