## ADDED Requirements

### Requirement: Icon-only accessible bottom navigation
The system SHALL render the dashboard, history, statistics, and settings navigation tabs as icon-only buttons. Each button SHALL expose its tab name through an accessible name, and the active tab SHALL expose `aria-current="page"`.

#### Scenario: Viewing the bottom navigation
- **WHEN** a user views the bottom navigation
- **THEN** the dashboard, history, statistics, and settings controls render their corresponding icons without visible tab-label text.

#### Scenario: Identifying the active tab
- **WHEN** a user navigates to a tab
- **THEN** that tab button exposes its tab name and `aria-current="page"`, while the other icon buttons expose their respective tab names without `aria-current`.

### Requirement: Stable bottom navigation dimensions
The system SHALL keep the bottom navigation container, button targets, and icon dimensions unchanged across upward and downward content scrolling.

#### Scenario: Scrolling downward
- **WHEN** a user scrolls content downward
- **THEN** the bottom navigation retains the same class-free presentation, width, height, padding, button target dimensions, and icon dimensions that it had before scrolling.

#### Scenario: Scrolling upward
- **WHEN** a user scrolls content upward after scrolling downward
- **THEN** the bottom navigation retains the same dimensions and does not render a compact or expanded presentation variant.
