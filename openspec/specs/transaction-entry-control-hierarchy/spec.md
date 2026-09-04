# transaction-entry-control-hierarchy Specification

## Purpose

Define the labeled, type-specific controls used in the new transaction Setup step.

## Requirements

### Requirement: Labeled Transaction Entry Control Hierarchy
The system SHALL present transaction type and payment mode as visually distinct, explicitly labeled controls in the new transaction Setup step. Transaction type SHALL provide visible text and an AppIcon for expense, income, and transfer, and SHALL use a type-specific selected state. Payment mode SHALL provide the visible label "付款方式" and SHALL only be rendered for new expense transactions.

#### Scenario: Selecting a transaction type

- **WHEN** a user opens a new transaction Setup step
- **THEN** the system displays the visible label "交易類型" with expense, income, and transfer selection cards that retain visible text, icons, and `aria-pressed` state.

#### Scenario: Viewing payment mode for a new expense

- **WHEN** the selected transaction type is expense in a new transaction Setup step
- **THEN** the system displays the visible label "付款方式" with basic and installment controls that retain visible text and `aria-pressed` state.

#### Scenario: Changing to income or transfer

- **WHEN** a user selects income or transfer in a new transaction Setup step
- **THEN** the system does not display the payment mode control, uses a content-fit modal that does not exceed the visual viewport, and retains the existing type selection behavior.

<!-- @trace
source: refine-transaction-entry-hierarchy
updated: 2026-09-04
code:
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - apps/web/src/styles.css
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - apps/web/package.json
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - apps/web/ios/App/Podfile
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - apps/web/src/app/components/TransactionModal.tsx
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
tests:
  - apps/web-e2e/src/module-history.spec.ts
  - apps/web/src/app/components/TransactionModal.spec.tsx
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/app.spec.tsx
-->