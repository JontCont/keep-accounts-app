## ADDED Requirements

### Requirement: Installment period rows SHALL support direct item editing
The system SHALL provide an edit action on each installment period row in installment view so a user can correct that specific period without leaving installment management context.

#### Scenario: Open period edit from installment view
- **WHEN** the user clicks edit on period 3 in an installment group
- **THEN** the system SHALL open transaction edit mode for that exact period record id

##### Example: Period-targeted edit entry
- **GIVEN** installment group A has period ids A-1, A-2, A-3
- **WHEN** the user chooses edit on A-2
- **THEN** edit mode target id SHALL be A-2 and SHALL NOT be A-1 or A-3

### Requirement: Editing one installment period SHALL be isolated to that period
When a user saves an edit for one installment period, the system SHALL update only that period entry and SHALL keep sibling periods unchanged unless explicitly edited later.

#### Scenario: Update one period amount
- **WHEN** the user changes period 5 amount from 2003 to 1999 and saves
- **THEN** only period 5 amount SHALL change and periods 1-4 SHALL keep their original amounts and dates

#### Scenario: Update one period date
- **WHEN** the user changes period 2 due date and saves
- **THEN** only period 2 date SHALL change and installment linkage fields (installmentId, installmentPeriod, installmentCount) SHALL remain intact for all periods

### Requirement: Installment group summary SHALL reflect edited period data
The installment group summary in installment view SHALL be recalculated from persisted period rows after any item edit.

#### Scenario: Aggregate values refresh after edit
- **WHEN** a user saves an installment period edit
- **THEN** total amount and remaining amount in the group summary SHALL reflect the latest stored period amounts and dates

##### Example: Remaining amount recomputation
- **GIVEN** a 5-period group with amounts 1999, 1999, 1999, 1999, 2003 and 0 paid periods
- **WHEN** period 5 amount is edited to 1999
- **THEN** group total SHALL update from 9999 to 9995 and remaining amount SHALL update from 9999 to 9995
