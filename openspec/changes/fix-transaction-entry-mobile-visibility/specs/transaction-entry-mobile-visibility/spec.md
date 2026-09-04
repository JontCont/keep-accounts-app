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
The system SHALL constrain the page-presented transaction entry form to the available viewport and provide a vertically scrollable field region when its content exceeds that height.

#### Scenario: Viewing an installment form in a short viewport
- **WHEN** a user opens the installment transaction form in a viewport shorter than the complete form
- **THEN** the user can scroll from the transaction name through notification settings to the cancel and save actions without content being clipped.

#### Scenario: Keeping actions reachable
- **WHEN** the transaction entry form is scrollable
- **THEN** the cancel and save actions remain visible at the bottom of the entry card and are not covered by the device safe-area inset.
