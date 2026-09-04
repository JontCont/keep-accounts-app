## MODIFIED Requirements

### Requirement: Interactive Virtual Keyboard Viewport Behavior
The web application SHALL configure the HTML viewport meta tag to resize content when an interactive virtual keyboard is displayed on mobile devices. When the browser reduces the visual viewport, the transaction entry workflow SHALL retain a scrollable field region and reachable cancel and save actions without shifting the root document upward out of view.

#### Scenario: Viewport resizes on virtual keyboard display
- **WHEN** a user focuses an input element triggering the virtual keyboard on a mobile device
- **THEN** the browser visual viewport SHALL resize content bounds without shifting the root document upward out of view.

#### Scenario: Transaction entry remains operable after viewport resize
- **WHEN** a user focuses a field in the page-presented transaction entry form and the virtual keyboard reduces the visual viewport
- **THEN** the user can scroll to every form field and reach the cancel and save actions within the resized viewport.
