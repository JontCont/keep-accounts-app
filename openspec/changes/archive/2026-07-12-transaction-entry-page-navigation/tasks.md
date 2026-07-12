## 1. View State and Navigation Contract

- [x] 1.1 Implement "Use app-level transaction-entry view state instead of modal visibility state" so Dedicated Transaction Entry Page renders as a full-page context (not modal), verified by app behavior review and updated app-level tests that assert page context is shown after add or edit actions.
- [x] 1.2 Implement "Make back navigation origin-aware" so Transaction Entry Back Navigation always returns to the invoking dashboard or history context, verified by tests that open from each origin and assert correct return target on back.

## 2. Transaction Entry Page Behavior

- [x] 2.1 Implement Dedicated Transaction Entry Page create and edit rendering contract with mode-specific prefill behavior, verified by component tests that assert empty defaults in create mode and field prefill in edit mode.
- [x] 2.2 Implement "Preserve form behavior by reusing existing transaction form logic" so Form Behavior Parity With Existing Entry Flow remains true for validation, save payloads, and installment rules, verified by existing and updated transaction-form tests covering expense installment and invalid-input blocking.

## 3. Header Context Behavior

- [x] 3.1 Implement Tab-Specific Header Titles for transaction-entry create and edit contexts with visible back action while preserving existing tab titles, verified by app-level header rendering tests for dashboard, history, stats, settings, create, and edit entry contexts.
- [x] 3.2 Implement Conditional Date Visibility so date remains visible only on dashboard and hidden on transaction-entry and other non-dashboard contexts, verified by tests asserting date visibility matrix across all contexts.

## 4. Integration and Regression Verification

- [x] 4.1 Replace modal invocation wiring in dashboard and history entry points with page navigation while preserving save and cancel flows, verified by manual scenario checks: add from dashboard -> back/save returns to dashboard, edit from history -> back/save returns to history.
- [x] 4.2 Run regression verification for transaction and navigation behavior using project tests and analyzer checks, verified by successful execution of nx test web focused suites plus spectra analyze and spectra validate without Critical errors.
