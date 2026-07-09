## Why

Clicking text or number input fields in mobile packaged web applications (like Capacitor on iOS) causes the screen to automatically zoom in if the input's font size is less than 16px. Once zoomed in, the viewport does not return to its original scale, distorting the layout and preventing user interaction.

## What Changes

- Add `maximum-scale=1, user-scalable=no` to the viewport meta tag in `apps/web/index.html` to disable user scaling and automatic browser auto-zooming.
- Replace native `<input>` elements in `apps/web/src/app/app.tsx` with Ionic's `<IonInput>` component.
- Ensure all custom styled input fields in `apps/web/src/app/app.tsx` have a font size of at least `16px` (`1rem`).

## Capabilities

### New Capabilities

- `fix-input-zoom`: Restrict viewport scaling on mobile packaged screens and use standard Ionic inputs with a minimum font size of 16px to prevent automatic zooming on input focus.

### Modified Capabilities

(none)

## Impact

- Affected specs: `fix-input-zoom`
- Affected code:
  - Modified:
    - `apps/web/index.html`
    - `apps/web/src/app/app.tsx`
