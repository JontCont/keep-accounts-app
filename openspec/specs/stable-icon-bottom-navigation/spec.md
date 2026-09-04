# stable-icon-bottom-navigation Specification

## Purpose

Define an accessible icon-only bottom navigation that does not change geometry while scrolling.

## Requirements

### Requirement: Icon-only accessible bottom navigation
The system SHALL render the dashboard, history, statistics, and settings navigation tabs as icon-only buttons. Each button SHALL expose its tab name through an accessible name, and the active tab SHALL expose `aria-current="page"`.

#### Scenario: Viewing the bottom navigation
- **WHEN** a user views the bottom navigation
- **THEN** the dashboard, history, statistics, and settings controls render their corresponding icons without visible tab-label text.

#### Scenario: Identifying the active tab
- **WHEN** a user navigates to a tab
- **THEN** that tab button exposes its tab name and `aria-current="page"`, while the other icon buttons expose their respective tab names without `aria-current`.


<!-- @trace
source: stabilize-bottom-navigation
updated: 2026-09-04
code:
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - apps/web/package.json
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - apps/web/src/styles.css
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - apps/web/ios/App/Podfile
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - apps/web/src/app/components/TransactionModal.tsx
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
tests:
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/components/TransactionModal.spec.tsx
  - apps/web-e2e/src/module-history.spec.ts
  - apps/web/src/app/app.spec.tsx
-->

---
### Requirement: Stable bottom navigation dimensions
The system SHALL keep the bottom navigation container, button targets, and icon dimensions unchanged across upward and downward content scrolling.

#### Scenario: Scrolling downward
- **WHEN** a user scrolls content downward
- **THEN** the bottom navigation retains the same class-free presentation, width, height, padding, button target dimensions, and icon dimensions that it had before scrolling.

#### Scenario: Scrolling upward
- **WHEN** a user scrolls content upward after scrolling downward
- **THEN** the bottom navigation retains the same dimensions and does not render a compact or expanded presentation variant.

<!-- @trace
source: stabilize-bottom-navigation
updated: 2026-09-04
code:
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - apps/web/package.json
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - apps/web/src/styles.css
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - apps/web/ios/App/Podfile
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - apps/web/src/app/components/TransactionModal.tsx
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
tests:
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/components/TransactionModal.spec.tsx
  - apps/web-e2e/src/module-history.spec.ts
  - apps/web/src/app/app.spec.tsx
-->