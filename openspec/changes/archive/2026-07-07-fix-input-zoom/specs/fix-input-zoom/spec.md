## ADDED Requirements

### Requirement: Viewport Scaling Restriction
The system SHALL restrict automatic and user-initiated scaling of the viewport in mobile views to keep the scale locked at 1:1.

#### Scenario: Verify viewport tag scaling properties
- **WHEN** the application is loaded on a mobile browser or webview
- **THEN** the viewport meta tag content SHALL contain `maximum-scale=1` and `user-scalable=no`

### Requirement: iOS Auto-Zoom Prevention on Input Focus
The system SHALL ensure that text and number inputs have a font size of at least 16px to prevent automatic zooming on WebKit.

#### Scenario: Input font size validation
- **WHEN** an input field is rendered in the user interface
- **THEN** the input's font-size property MUST be at least `16px` (or `1rem`)

### Requirement: Standard Ionic Inputs Integration
The system SHALL utilize standard Ionic `<IonInput>` elements for text and numeric entry fields instead of native `<input>` tags.

#### Scenario: Input focus and keyboard integration
- **WHEN** the user taps an input field to edit transaction info
- **THEN** the system SHALL display the keyboard without layout shifting or page zoom, utilizing the `<IonInput>` component
