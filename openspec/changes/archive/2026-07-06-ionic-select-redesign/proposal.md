## Why

Native HTML select elements lack custom styling capability for their option list popups, resulting in default browser dropdown UI that conflicts with the application's premium glassmorphism dark-mode theme. Replacing them with Ionic select components styled as Action Sheets delivers a premium, highly accessible, mobile-first, and styled selection interface.

## What Changes

- Install `@ionic/react` and `ionicons` as project dependencies.
- Import Ionic core CSS stylesheets and initialize the `@ionic/react` library in the web app entrypoint.
- Replace all native HTML select inputs (account group selection, category selection, and transaction filters) with `@ionic/react` `<IonSelect>` components configured with `interface="action-sheet"`.
- Apply custom CSS variables to style the select component wrapper and the action-sheet overlays, matching the glassmorphism dark-mode theme.

## Capabilities

### New Capabilities

- `ionic-select-dropdown`: Replaces native HTML select elements with `@ionic/react` select components styled with a custom Action Sheet interface.

### Modified Capabilities

(none)

## Impact

- Affected specs: `ionic-select-dropdown`
- Affected code:
  - Modified:
    - `package.json`
    - `apps/web/src/main.tsx`
    - `apps/web/src/app/app.tsx`
    - `apps/web/src/app/app.spec.tsx`
