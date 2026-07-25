# mobile-keyboard-viewport Specification

## Purpose

TBD - created by archiving change 'fix-mobile-keyboard-viewport'. Update Purpose after archive.

## Requirements

### Requirement: Interactive Virtual Keyboard Viewport Behavior

The web application SHALL configure the HTML viewport meta tag to resize content when an interactive virtual keyboard is displayed on mobile devices.

#### Scenario: Viewport resizes on virtual keyboard display
- **WHEN** a user focuses an input element triggering the virtual keyboard on a mobile device
- **THEN** the browser visual viewport SHALL resize content bounds without shifting the root document upward out of view

<!-- @trace
source: fix-mobile-keyboard-viewport
updated: 2026-07-25
code:
  - libs/shared/domain/src/lib/types.ts
  - libs/shared/domain/src/lib/utils.ts
  - apps/web/index.html
-->