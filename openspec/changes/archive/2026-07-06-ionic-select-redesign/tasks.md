<!--
Each task description MUST state:
- the behavior or contract being delivered (what is observably true when the
  task is complete), and
- the verification target that proves completion (test, CLI invocation,
  analyzer check, manual assertion, or content review).

File paths are supporting context for locating the work, never the task
itself. "Edit file X" is not a valid task — it is missing both behavior and
verification.
-->

## 1. Setup and Dependency Installation

- [x] 1.1 Setup packages for Decision: Install and Initialize Ionic React Package: Add `@ionic/react` and `ionicons` to dependencies and call `setupIonicReact()` in `apps/web/src/main.tsx`. Verification: Run the compilation build or dev server and ensure the application boots without errors.

## 2. Selection Component Redesign

- [x] 2.1 Implement Decision: Replace HTML Select with IonSelect using Action Sheet Interface: Replace native `<select>` tags in `apps/web/src/app/app.tsx` with `<IonSelect interface="action-sheet">`, delivering Ionic Select Component Integration and Action Sheet Display Mode. Verification: Tapping the selection fields in the browser opens the bottom action sheet list.

## 3. Custom CSS Variable Styling

- [x] 3.1 Implement Decision: Apply Glassmorphism Styling via Ionic CSS Variables: Add CSS declarations in `apps/web/src/styles.css` using custom properties (e.g. `--background`, `--color`) to deliver Glassmorphism Dark-Mode Select Styling. Verification: Check the action sheet in the browser to ensure the background is dark and semi-transparent.

## 4. Testing and Code Quality

- [x] 4.1 Update Test Suite for Ionic Components: Update unit tests in `apps/web/src/app/app.spec.tsx` to align with the new select rendering logic. Verification: Run `npm run test` or `npx vitest run apps/web/src/app/app.spec.tsx` and confirm all tests pass.
