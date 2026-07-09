## ADDED Requirements

### Requirement: Scrollable Transaction Modal
The transaction modal container SHALL support vertical scrolling when the height of its content exceeds the viewport height.

#### Scenario: Transaction Modal Content Overflow
- **WHEN** the user opens the transaction modal on a device with limited vertical resolution
- **THEN** the modal body SHALL display a scrollbar allowing the user to scroll down to view and interact with the date buttons and submit actions

### Requirement: Styled Input Components
Input fields in the transaction modal SHALL render without default browser focus outlines and without native browser number adjustment arrows.

#### Scenario: Focus on Input Field
- **WHEN** the user focuses on a transaction modal input field
- **THEN** the element SHALL display a custom styled focus border matching the active primary color without default blue browser outlines
- **AND** the number input field SHALL NOT show native spin-button adjusting arrows

### Requirement: FAB Scroll Hiding
The Floating Action Button (FAB) on the History tab SHALL dynamically show and hide based on the scroll direction of the main content container.

#### Scenario: Scrolling Down the History List
- **WHEN** the user scrolls down on the history list
- **THEN** the FAB SHALL hide from view with a smooth transition

#### Scenario: Scrolling Up the History List
- **WHEN** the user scrolls up on the history list
- **THEN** the FAB SHALL reappear in its configured position
