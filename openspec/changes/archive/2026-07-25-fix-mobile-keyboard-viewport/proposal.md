## Why

When opening the virtual keyboard on mobile devices, the default browser behavior shifts the viewport upward, hiding top page sections and modal headers.

## What Changes

Update the viewport meta tag in `apps/web/index.html` to include `interactive-widget=resizes-content`, ensuring mobile browsers adjust the visual viewport height instead of shifting the layout frame upward.

## Capabilities

### New Capabilities

- `mobile-keyboard-viewport`: Configure mobile viewport to resize content when interactive virtual keyboard appears.

### Modified Capabilities

(none)

## Impact

- Affected specs: specs/mobile-keyboard-viewport/spec.md
- Affected code:
  - Modified: apps/web/index.html
