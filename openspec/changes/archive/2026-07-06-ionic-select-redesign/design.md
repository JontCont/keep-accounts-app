## Context

The Keep Accounts App currently uses native HTML `<select>` elements for selection fields (such as account groups and categories) and transaction filters. These native browser dropdowns cannot be styled uniformly, creating visual friction on desktop browsers with the application's premium glassmorphism dark-mode UI. This design details the integration of Ionic UI components to solve this.

## Goals / Non-Goals

**Goals:**
- Install `@ionic/react` and `ionicons` packages.
- Replace all native HTML select fields in the transaction modal and the history page with Ionic's select components.
- Configure all Ionic select fields to display as Action Sheets (sliding up from the bottom).
- Style the select triggers and the action sheet overlays to match the application's dark glassmorphism theme.

**Non-Goals:**
- Replacing other inputs (like text inputs, number fields, or buttons) with Ionic components.
- Using Ionic's full page router or layout grids; styling is strictly scoped to select elements.

## Decisions

### Decision: Install and Initialize Ionic React Package
We will add `@ionic/react` and `ionicons` dependencies in `package.json`. In the web app entrypoint `apps/web/src/main.tsx`, we will import `@ionic/react/css/core.css` and initialize `@ionic/react` by calling `setupIonicReact()`.

*Alternatives considered:*
- Writing a custom dropdown from scratch: Writing custom accessibility, keyboard navigation, popover overlays, and click-outside behavior in React would be complex and duplicate existing framework capabilities.

### Decision: Replace HTML Select with IonSelect using Action Sheet Interface
All native HTML `<select>` and `<option>` elements in `apps/web/src/app/app.tsx` will be replaced with `<IonSelect>` and `<IonSelectOption>`. They will be configured with `interface="action-sheet"` to make them slide up from the bottom on both desktop and mobile devices.

*Alternatives considered:*
- `interface="popover"`: Decided against because the user explicitly preferred the bottom-sliding Action Sheet layout for a consistent mobile-first selection experience.

### Decision: Apply Glassmorphism Styling via Ionic CSS Variables
We will customize the action sheet overlay colors and backgrounds using Ionic CSS variables. In `apps/web/src/styles.css`, we will define variables targeting Ionic components (e.g. `--background`, `--color` of `.action-sheet-wrapper`) to match the dark glassmorphism styling (`rgba(22, 22, 33, 0.65)` background with blur).

*Alternatives considered:*
- Direct CSS element overrides: Decided against since Ionic elements render inside Shadow DOM, making direct element targeting difficult without custom Ionic CSS variables.

## Implementation Contract

- **Observable Behavior**:
  - The transaction form and filter selects render with styled Ionic trigger buttons.
  - Clicking any select input slides up a premium dark-themed Action Sheet from the bottom containing the selection options.
  - Clicking outside the Action Sheet or selecting an option closes it.

- **Interface / Data Shape**:
  - Ionic integration: `@ionic/react` imported in `apps/web/src/main.tsx` and initialized via `setupIonicReact()`.
  - Component replacement: `<IonSelect>` used with properties `interface="action-sheet"`, `value`, and `onIonChange`.

- **Failure Modes**:
  - Uninitialized Ionic React: If `setupIonicReact()` is omitted, components may render incorrectly or fail to trigger popups.
  - Shadow DOM leakage: CSS styles not targeting custom Ionic properties will fail to apply to popups. We must use the documented Ionic CSS variables.

- **Acceptance Criteria**:
  - Application builds successfully via Vite.
  - All native dropdowns are replaced by Action Sheets.
  - Emojis and text labels render clearly within the action sheet options.

- **Scope Boundaries**:
  - In Scope: Installation, main.tsx initialization, CSS customization, and select replacement in app.tsx.
  - Out of Scope: Overriding global text styles or body styles with Ionic's default typography stylesheets.
