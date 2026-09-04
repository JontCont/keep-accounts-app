# mobile-keyboard-viewport Specification

## Purpose

TBD - created by archiving change 'fix-mobile-keyboard-viewport'. Update Purpose after archive.

## Requirements

### Requirement: Interactive Virtual Keyboard Viewport Behavior
The web application SHALL configure the HTML viewport meta tag to resize content when an interactive virtual keyboard is displayed on mobile devices and configure the Capacitor iOS Keyboard plugin to resize the Ionic app. When the browser or native keyboard reduces the visual viewport, the transaction entry workflow SHALL retain a scrollable field region and reachable cancel and save actions without shifting the root document upward out of view.

#### Scenario: Viewport resizes on virtual keyboard display
- **WHEN** a user focuses an input element triggering the virtual keyboard on a mobile device
- **THEN** the browser visual viewport SHALL resize content bounds without shifting the root document upward out of view.

#### Scenario: Transaction entry remains operable after viewport resize
- **WHEN** a user focuses a field in the page-presented transaction entry form and the virtual keyboard reduces the visual viewport
- **THEN** the user can scroll to every form field and reach the cancel and save actions within the resized viewport.

#### Scenario: iOS native keyboard resizes the Ionic app
- **WHEN** a user focuses an Ionic input in the iOS native application
- **THEN** the Capacitor Keyboard plugin resizes the Ionic app, and the entry title, current step, and focused field remain above the keyboard or can be reached by scrolling.

#### Scenario: Opening a custom transaction selector while typing
- **WHEN** a user opens an account group or category selector while a text keyboard is visible
- **THEN** the keyboard is dismissed before the selector options appear, and the user can select an option.

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