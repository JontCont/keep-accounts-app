## 1. Reuse shared default allocation shape as the starter preset source

- [x] 1.1 Implement **Requirement: Starter allocation preset is available for first-time users** and **Decision: Reuse the shared default allocation shape as the starter preset source** by exposing a reusable starter preset definition from the existing shared default allocation data, with target ratios and groups that remain the canonical starter setup; verify by a focused unit or content test that the starter preset structure still contains the expected source group and non-source ratios summing to 100.

## 2. Trigger the starter experience from empty configuration state, not a persisted onboarding flag

- [x] 2.1 Implement **Requirement: Starter allocation preset is available for first-time users** and **Decision: Trigger the starter experience from empty configuration state, not a persisted onboarding flag** by surfacing the starter preset action only when the app has no usable allocation setup and by keeping the prompt derived from current state rather than a saved onboarding boolean; verify with a UI regression test that the action appears on empty state and stays hidden or inactive after a custom setup exists.

## 3. Keep the preset editable immediately after application

- [x] 3.1 Implement **Requirement: Applying the starter preset creates a complete editable allocation setup** and **Decision: Keep the preset editable immediately after application** by wiring the applied starter configuration into the existing group settings workflow so users can rename groups, change ratios, and adjust categories after applying the preset; verify with a component test that the editor remains usable after the preset is applied.

## 4. Treat preset application as a one-step initialization of groups and ratios

- [x] 4.1 Implement **Requirement: Applying the starter preset creates a complete editable allocation setup** and **Requirement: Starter preset does not silently replace existing custom allocation data** plus **Decision: Treat preset application as a one-step initialization of groups and ratios** by making the preset action create the complete starter account-group layout in a single operation while preserving non-empty custom data unless the user explicitly confirms replacement; verify with a regression test covering one-step initialization and overwrite protection.
