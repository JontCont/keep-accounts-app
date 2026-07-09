## ADDED Requirements

### Requirement: Theme Selector Settings
The Settings page SHALL include a theme selection interface supporting "system", "light", and "dark" options.
The theme preference MUST be saved to localStorage to persist across application reloads.

#### Scenario: Selecting Light Theme
- **WHEN** the user selects the "light" theme in the Settings tab
- **THEN** the system SHALL immediately apply light theme color variables
- **AND** store the choice as "light" in localStorage

##### Example: Theme options in settings
- **GIVEN** the Settings page rendering
- **WHEN** the theme select element is rendered
- **THEN** it SHALL provide exactly the options: "跟隨系統", "淺色模式", "深色模式"

### Requirement: Light Theme Variable Overrides
The application SHALL override core CSS variables to render light colors (light backgrounds, dark texts, and transparent glass cards) when the light theme class is applied to the document root.

#### Scenario: Light theme styles applied
- **WHEN** the HTML root element class contains "light-theme"
- **THEN** the background color variables SHALL be updated to light gray shades
- **AND** text colors SHALL be updated to dark gray/black shades

##### Example: Light theme variables
| Variable | Value in Dark (default) | Value in Light (override) |
| --- | --- | --- |
| `--bg-color` | `#0b0b0f` | `#f4f4f5` |
| `--text-primary` | `#ffffff` | `#0f0f12` |
| `--card-bg` | `rgba(22, 22, 33, 0.65)` | `rgba(255, 255, 255, 0.7)` |

### Requirement: System Theme Mode Support
When the theme is set to "system", the application SHALL dynamically match and track the browser/device preference query (`prefers-color-scheme: dark`).

#### Scenario: System theme changes
- **WHEN** the theme option is set to "system"
- **THEN** the application SHALL monitor the prefers-color-scheme media query
- **AND** dynamically apply the light or dark theme class to the document root based on the active query value
