# allocation-income-block Specification

## Purpose

TBD - created by archiving change 'allocation-income-block'. Update Purpose after archive.

## Requirements

### Requirement: Total Income to Allocate Block
The Dashboard Tab MUST render a dedicated card at the top of the account groups list displaying the total allocation source income of the current month. The card SHALL display the title "本月待分配總額" and the subtext "已勾選之基準分類（如薪資）收入加總" alongside the formatted green sum prefixed with "+$".

#### Scenario: Display total allocation source income
- **WHEN** the Dashboard Tab is loaded
- **THEN** it SHALL render the "本月待分配總額" block
- **AND** the displayed amount SHALL match the sum of current month's income transactions from bound categories


---
### Requirement: Account Group Target and Reached Dollar Amount Display
Each account group card MUST display the computed current-month target dollar amount, the current-month used expense amount, and the current-month remaining balance. The target amount is calculated as `totalMonthlyBoundIncome * (targetRatio / 100)`. The used expense amount is the sum of current month's expenses for that group. The remaining balance SHALL be `targetAmount - usedExpenseAmount`.

#### Scenario: Display current month budget and remaining balance on card
- **WHEN** the Dashboard Tab calculates account group card statistics for the active month
- **THEN** each non-source account group card SHALL display `目標 {targetRatio}% (${targetAmount})`
- **AND** the card SHALL display the current month used expense `${usedExpense}`
- **AND** the card SHALL display the current month remaining balance `${remainingAmount}`

##### Example: Current month budget and remaining calculation
- **GIVEN** current month bound income is $100,000
- **AND** Daily Expense account group has target ratio 30% and current month expenses of $4,814
- **WHEN** rendering the Daily Expense account group card
- **THEN** target budget SHALL be $30,000
- **AND** current month used expense SHALL be $4,814
- **AND** current month remaining balance SHALL be $25,186 ($30,000 - $4,814)

<!-- @trace
source: fix-account-group-monthly-view
updated: 2026-09-04
code:
  - .agents/skills/vercel-react-best-practices/rules/async-api-routes.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-preload.md
  - .agents/skills/vercel-react-best-practices/rules/async-defer-await.md
  - .agents/skills/vercel-react-best-practices/rules/js-length-check-first.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-resource-hints.md
  - apps/web/android/app/src/main/AndroidManifest.xml
  - .agents/skills/vercel-react-best-practices/rules/rerender-no-inline-components.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-event-handler-refs.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-simple-expression-in-memo.md
  - .agents/skills/vercel-react-best-practices/rules/js-hoist-regexp.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hoist-jsx.md
  - .agents/skills/vercel-react-best-practices/README.md
  - .agents/skills/vercel-react-best-practices/rules/js-tosorted-immutable.md
  - apps/web/capacitor.config.ts
  - .agents/skills/vercel-react-best-practices/rules/server-cache-lru.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-move-effect-to-event.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-transitions.md
  - skills-lock.json
  - .agents/skills/vercel-react-best-practices/rules/server-serialization.md
  - .agents/skills/vercel-react-best-practices/rules/client-swr-dedup.md
  - .agents/skills/vercel-react-best-practices/rules/server-auth-actions.md
  - .agents/skills/vercel-react-best-practices/rules/async-parallel.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-nested-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/_template.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-activity.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-spacing-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/bundle-analyzable-paths.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit.png
  - .agents/skills/vercel-react-best-practices/rules/js-cache-function-results.md
  - .agents/skills/vercel-react-best-practices/rules/client-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-suppress-warning.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-init-once.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-usetransition-loading.md
  - .agents/skills/vercel-react-best-practices/rules/server-parallel-fetching.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-defer-third-party.md
  - .agents/skills/vercel-react-best-practices/rules/server-hoist-static-io.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-setup-step.png
  - .agents/skills/vercel-react-best-practices/rules/js-min-max-loop.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state-no-effect.md
  - .agents/skills/vercel-react-best-practices/rules/advanced-effect-event-deps.md
  - .agents/skills/vercel-react-best-practices/rules/_sections.md
  - .agents/skills/vercel-react-best-practices/rules/client-passive-event-listeners.md
  - .agents/skills/vercel-react-best-practices/rules/js-index-maps.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-functional-setstate.md
  - .agents/skills/vercel-react-best-practices/rules/server-dedup-props.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-lazy-state-init.md
  - .agents/skills/vercel-react-best-practices/AGENTS.md
  - .agents/skills/vercel-react-best-practices/rules/js-flatmap-filter.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-hydration-no-flicker.md
  - .agents/skills/vercel-react-best-practices/rules/js-set-map-lookups.md
  - .agents/skills/vercel-react-best-practices/rules/client-localstorage-schema.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-property-access.md
  - .agents/skills/vercel-react-best-practices/rules/js-early-exit.md
  - .agents/skills/vercel-react-best-practices/rules/js-request-idle-callback.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-script-defer-async.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-content-visibility.md
  - apps/web/src/app/app.tsx
  - .agents/skills/vercel-react-best-practices/rules/bundle-barrel-imports.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo.md
  - apps/web/ios/App/Podfile
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-payment-mode-button-size-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/rerender-memo-with-default-value.md
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-type-options-spacing.png
  - apps/web/src/app/components/TransactionEntryPage.tsx
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-control-hierarchy-mobile.png
  - .agents/skills/vercel-react-best-practices/rules/advanced-use-latest.md
  - .agents/skills/vercel-react-best-practices/rules/js-batch-dom-css.md
  - .agents/skills/vercel-react-best-practices/rules/server-cache-react.md
  - .agents/skills/vercel-react-best-practices/rules/async-suspense-boundaries.md
  - .agents/skills/vercel-react-best-practices/rules/server-after-nonblocking.md
  - .agents/skills/vercel-react-best-practices/rules/async-cheap-condition-before-await.md
  - apps/web/package.json
  - .agents/skills/vercel-react-best-practices/rules/async-dependencies.md
  - .agents/skills/vercel-react-best-practices/rules/js-combine-iterations.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-split-combined-hooks.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-svg-precision.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-defer-reads.md
  - apps/web/src/app/components/TransactionModal.tsx
  - apps/web/src/styles.css
  - .agents/skills/vercel-react-best-practices/rules/rerender-derived-state.md
  - .agents/skills/vercel-react-best-practices/rules/js-cache-storage.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-dynamic-imports.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-animate-svg-wrapper.md
  - .agents/skills/vercel-react-best-practices/rules/server-no-shared-module-state.md
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-ref-transient-values.md
  - .agents/skills/vercel-react-best-practices/SKILL.md
  - .agents/skills/vercel-react-best-practices/metadata.json
  - .agents/skills/vercel-react-best-practices/rules/rerender-use-deferred-value.md
  - .agents/skills/vercel-react-best-practices/rules/rendering-conditional-render.md
  - .agents/skills/vercel-react-best-practices/rules/bundle-conditional.md
  - apps/web-e2e/test-output/playwright/screenshots/fixed-icon-bottom-navigation.png
  - apps/web-e2e/test-output/playwright/screenshots/transaction-entry-income-content-fit-desktop.png
tests:
  - apps/web-e2e/src/module-history.spec.ts
  - apps/web/src/app/app.spec.tsx
  - apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - apps/web/src/app/components/TransactionModal.spec.tsx
-->