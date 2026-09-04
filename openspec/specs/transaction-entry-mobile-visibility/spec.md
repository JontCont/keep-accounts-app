# transaction-entry-mobile-visibility Specification

## Purpose

Define readable, reachable, step-based transaction entry behavior on mobile viewports.

## Requirements

### Requirement: Readable Transaction Date and Time Picker
The system SHALL render the transaction date and time picker with visible weekday labels, enabled calendar dates, selected-date state, and time value in both supported application themes.

#### Scenario: Opening the date and time picker
- **WHEN** a user activates the transaction date and time picker
- **THEN** the current month calendar displays readable weekday labels and enabled date values, and the selected date and time are distinguishable from the picker background.

#### Scenario: Selecting a transaction date
- **WHEN** a user selects an enabled calendar date and confirms the picker
- **THEN** the transaction form displays the selected date and preserves the selected date-time value for saving.


<!-- @trace
source: fix-transaction-entry-mobile-visibility
updated: 2026-09-04
code:
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
  - apps/web/package.json
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - apps/web/src/app/components/TransactionModal.tsx
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - apps/web/ios/App/Podfile
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - apps/web/src/styles.css
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
tests:
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/components/TransactionModal.spec.tsx
  - apps/web/src/app/app.spec.tsx
  - apps/web-e2e/src/module-history.spec.ts
-->

---
### Requirement: Scrollable Long Transaction Entry Form
The system SHALL constrain the transaction entry form to the available viewport and provide a vertically scrollable field region when its content exceeds that height.

#### Scenario: Viewing an installment form in a short viewport
- **WHEN** a user opens the installment transaction form in a viewport shorter than the complete form
- **THEN** the user can scroll from the transaction name through notification settings to the cancel and save actions without content being clipped.

#### Scenario: Keeping actions reachable
- **WHEN** the transaction entry form is scrollable
- **THEN** the cancel and save actions remain visible at the bottom of the entry card and are not covered by the device safe-area inset.


<!-- @trace
source: fix-transaction-entry-mobile-visibility
updated: 2026-09-04
code:
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
  - apps/web/package.json
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - apps/web/src/app/components/TransactionModal.tsx
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - apps/web/ios/App/Podfile
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - apps/web/src/styles.css
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
tests:
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/components/TransactionModal.spec.tsx
  - apps/web/src/app/app.spec.tsx
  - apps/web-e2e/src/module-history.spec.ts
-->

---
### Requirement: Guided New Transaction Entry
The system SHALL open every new transaction entry in a modal and divide it into a combined Setup step for transaction type, account, category, mode, and date selection, and a Details step for text and amount inputs. When a new expense uses installment mode, Details SHALL also include installment and notification inputs. Existing transaction editing SHALL remain a single-page flow.

#### Scenario: Starting a new transaction entry
- **WHEN** a user activates the add transaction action
- **THEN** the system opens a modal containing the Setup step with expense, income, transfer, account group, category, transaction mode, and transaction date controls, and no text input is automatically focused.

#### Scenario: Continuing to basic details
- **WHEN** a user selects a transaction type and basic mode in Setup and continues to Details
- **THEN** the system displays the name and amount inputs while preserving the selected account group, category, and date.

#### Scenario: Continuing to installment details
- **WHEN** a user selects an expense transaction type and installment mode in Setup and continues to Details
- **THEN** the system displays the name, total amount, period count, start month, per-period preview, and notification controls while preserving the selected account group, category, and date.

#### Scenario: Returning to a previous transaction step
- **WHEN** a user returns from Details to Setup and then continues to Details
- **THEN** the system retains all entered values and does not save a transaction.

<!-- @trace
source: fix-transaction-entry-mobile-visibility
updated: 2026-09-04
code:
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
  - apps/web/package.json
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - apps/web/src/app/components/TransactionModal.tsx
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - apps/web/ios/App/Podfile
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - apps/web/src/styles.css
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
tests:
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/components/TransactionModal.spec.tsx
  - apps/web/src/app/app.spec.tsx
  - apps/web-e2e/src/module-history.spec.ts
-->