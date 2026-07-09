## Context

When running the web application inside Capacitor on iOS or mobile browsers, tapping on native input fields with a font size below 16px causes the viewport to zoom in. This distorts the user interface and cannot be zoomed out by the user, ruining the native app experience.

We need to resolve this by configuring the viewport meta tag to restrict user scaling, replacing native inputs with `<IonInput>`, and ensuring input font sizes are at least 16px.

## Goals / Non-Goals

**Goals:**
- Prevent automatic page zooming when inputs are focused.
- Disable manual pinch-to-zoom on the PWA viewport.
- Replace native input fields with standard Ionic `<IonInput>` components in the transaction forms and group editors.

**Non-Goals:**
- Rewriting input validation logic (validation should remain identical).

## Decisions

### Decision: Restrict Viewport Scaling in index.html
- **Rationale**: Setting `maximum-scale=1, user-scalable=no` in the viewport metadata tag enforces a strict 1:1 display ratio, blocking browser zoom events.
- **Alternatives Considered**: Dynamically editing the DOM viewport tag via JS on input focus/blur, which is slow and can cause layout shifts.

### Decision: Use IonInput with a Minimum Font Size of 16px
- **Rationale**: Replacing native `<input>` tags with `<IonInput>` leverages Ionic's platform-optimized components, which default to 16px on iOS. For custom inline input styles (like the target percentage fields), we must ensure the font size is at least `1rem` or `16px`.
- **Alternatives Considered**: Using global CSS tricks like `transform: scale(0.8)` on 16px inputs to make them visually smaller. This complicates padding and text selection, so adjusting the font size to `16px` is preferred.

## Implementation Contract

- **Behavior**:
  - The viewport scale is locked at 1:1 when interacting with the application.
  - Tapping transaction text/number fields or configuration input fields does not trigger page zoom.
- **Interface / Data Shape**:
  - Viewport tag in `apps/web/index.html` matches: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`.
  - Native `<input>` components are replaced with `<IonInput>` in `apps/web/src/app/app.tsx`.
- **Failure Modes**:
  - If font-size is inadvertently set below 16px in style sheets, iOS WebKit may still attempt to zoom if scaling is not fully respected by the device.
- **Acceptance Criteria**:
  - When the app is packaged and run on an iOS simulator, focusing any input field does not alter the viewport zoom factor.
- **Scope Boundaries**:
  - **In Scope**:
    - Modifying `apps/web/index.html` viewport metadata.
    - Replacing transaction inputs in `apps/web/src/app/app.tsx` with `<IonInput>` and updating their styles to at least 16px.
  - **Out of Scope**:
    - Replacing dropdown selectors (`IonSelect` is already used) or other non-input elements.

## Risks / Trade-offs

- **[Risk] Input alignment changes** -> *Mitigation*: Adjust surrounding margins and padding when switching from native `<input>` to `<IonInput>` to preserve the dark glassmorphic card aesthetic.
