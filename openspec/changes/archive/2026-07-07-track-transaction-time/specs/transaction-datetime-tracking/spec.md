## ADDED Requirements

### Requirement: Datetime Selection in Transaction Entry
The system SHALL allow users to select both date and time (minute resolution) when creating or editing a transaction. The stored timestamp MUST be formatted as a standard ISO 8601 string.

#### Scenario: Display popup datetime picker
- **WHEN** the user opens the transaction creation or editing modal
- **THEN** the system SHALL render an Ionic datetime button that triggers a popup datetime picker in a modal
- **AND** the picker presentation mode SHALL be set to date-time

#### Scenario: Storing selected datetime
- **WHEN** the user selects "2026-07-07" at "19:30" in the datetime picker and saves
- **THEN** the transaction date field SHALL store the local offset timestamp "2026-07-07T19:30:00+08:00"

### Requirement: Chronological Sorting in Ledger
The system SHALL sort transactions chronologically based on their full datetime timestamp, with the newest transaction appearing first.

#### Scenario: Sort transactions on the same day
- **WHEN** multiple transactions are recorded on the same day but at different times
- **THEN** the system SHALL display them in descending chronological order

##### Example: Chronological order of three transactions
- **GIVEN** three transactions on "2026-07-07":
  - Transaction A: Lunch ($150) at 12:30 (`2026-07-07T12:30:00+08:00`)
  - Transaction B: Coffee ($80) at 09:15 (`2026-07-07T09:15:00+08:00`)
  - Transaction C: Dinner ($350) at 19:45 (`2026-07-07T19:45:00+08:00`)
- **WHEN** the user views the ledger
- **THEN** the transactions SHALL appear in the order: Transaction C, Transaction A, Transaction B

### Requirement: Date Comparison and Calculations compatibility
The system SHALL correctly identify current day and month transactions by extracting the date portion of the ISO 8601 timestamp.

#### Scenario: Retrieve today's transactions
- **WHEN** the user views today's dashboard on "2026-07-07"
- **THEN** all transactions whose timestamps start with "2026-07-07" MUST be included in the calculation of today's totals
