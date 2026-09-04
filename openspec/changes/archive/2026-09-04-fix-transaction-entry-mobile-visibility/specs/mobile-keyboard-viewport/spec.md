## MODIFIED Requirements

### Requirement: Interactive Virtual Keyboard Viewport Behavior
The web application SHALL configure the HTML viewport meta tag to resize content when an interactive virtual keyboard is displayed on mobile devices and configure the Capacitor iOS Keyboard plugin to resize the Ionic app. When the browser or native keyboard reduces the visual viewport, the transaction entry workflow SHALL retain a scrollable field region and reachable cancel and save actions without shifting the root document upward out of view.

#### Scenario: Viewport resizes on virtual keyboard display
- **WHEN** a user focuses an input element triggering the virtual keyboard on a mobile device
- **THEN** the browser visual viewport SHALL resize content bounds without shifting the root document upward out of view.

#### Scenario: Transaction entry remains operable after viewport resize
- **WHEN** a user focuses a field in the page-presented transaction entry form and the virtual keyboard reduces the visual viewport
- **THEN** the user can scroll to every form field and reach the cancel and save actions within the resized viewport.

#### Scenario: iOS native keyboard resizes the Ionic app
- **WHEN** a user focuses an Ionic input in the iOS native application
- **THEN** the Capacitor Keyboard plugin resizes the Ionic app, and the entry title, current step, and focused field remain above the keyboard or can be reached by scrolling.

#### Scenario: Opening a custom transaction selector while typing
- **WHEN** a user opens an account group or category selector while a text keyboard is visible
- **THEN** the keyboard is dismissed before the selector options appear, and the user can select an option.
