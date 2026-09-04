## ADDED Requirements

### Requirement: Readable Transaction Date and Time Picker
The system SHALL render the transaction date and time picker with visible weekday labels, enabled calendar dates, selected-date state, and time value in both supported application themes.

#### Scenario: Opening the date and time picker
- **WHEN** a user activates the transaction date and time picker
- **THEN** the current month calendar displays readable weekday labels and enabled date values, and the selected date and time are distinguishable from the picker background.

#### Scenario: Selecting a transaction date
- **WHEN** a user selects an enabled calendar date and confirms the picker
- **THEN** the transaction form displays the selected date and preserves the selected date-time value for saving.

### Requirement: Scrollable Long Transaction Entry Form
The system SHALL constrain the transaction entry form to the available viewport and provide a vertically scrollable field region when its content exceeds that height.

#### Scenario: Viewing an installment form in a short viewport
- **WHEN** a user opens the installment transaction form in a viewport shorter than the complete form
- **THEN** the user can scroll from the transaction name through notification settings to the cancel and save actions without content being clipped.

#### Scenario: Keeping actions reachable
- **WHEN** the transaction entry form is scrollable
- **THEN** the cancel and save actions remain visible at the bottom of the entry card and are not covered by the device safe-area inset.

### Requirement: Guided New Transaction Entry
The system SHALL open every new transaction entry in a modal and divide it into a combined Setup step for transaction type, account, category, mode, and date selection, and a Details step for text and amount inputs. When a new expense uses installment mode, Details SHALL also include installment and notification inputs. Existing transaction editing SHALL remain a single-page flow.

#### Scenario: Starting a new transaction entry
- **WHEN** a user activates the add transaction action
- **THEN** the system opens a modal containing the Setup step with expense, income, transfer, account group, category, transaction mode, and transaction date controls, and no text input is automatically focused.

#### Scenario: Continuing to basic details
- **WHEN** a user selects a transaction type and basic mode in Setup and continues to Details
- **THEN** the system displays the name and amount inputs while preserving the selected account group, category, and date.

#### Scenario: Continuing to installment details
- **WHEN** a user selects an expense transaction type and installment mode in Setup and continues to Details
- **THEN** the system displays the name, total amount, period count, start month, per-period preview, and notification controls while preserving the selected account group, category, and date.

#### Scenario: Returning to a previous transaction step
- **WHEN** a user returns from Details to Setup and then continues to Details
- **THEN** the system retains all entered values and does not save a transaction.
