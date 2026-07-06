## ADDED Requirements

### Requirement: Ionic Select Component Integration
The system SHALL use `@ionic/react` `<IonSelect>` and `<IonSelectOption>` components instead of standard HTML `<select>` and `<option>` elements for all dropdown selections. This covers the account group selection, category selection, and filter dropdowns.

#### Scenario: Rendering Ionic Select elements
- **WHEN** the transaction form is displayed
- **THEN** the inputs for account group and category are rendered as `<IonSelect>` components.

### Requirement: Action Sheet Display Mode
The system MUST configure `<IonSelect>` components to use the Action Sheet layout (`interface="action-sheet"`) for their selection popups.

#### Scenario: Opening selection popup
- **WHEN** the user clicks an IonSelect element
- **THEN** the selection options slide up from the bottom of the screen as an Ionic Action Sheet.

### Requirement: Glassmorphism Dark-Mode Select Styling
The system SHALL customize the appearance of `<IonSelect>` triggers and the popover action-sheets using CSS variables and theme variables to align with the application's dark-mode glassmorphism styling. The background of the Action Sheet options MUST be set to a dark, semi-transparent color matching `var(--card-bg)`.

#### Scenario: Viewing styled action sheet options
- **WHEN** the action sheet selection modal is opened
- **THEN** the options list displays with a dark semi-transparent glassmorphism style and white text.
