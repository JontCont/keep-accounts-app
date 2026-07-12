## 1. First-use flow integration

- [x] 1.1 Implement **First-use guidance gates income entry until setup prerequisites are complete** so the **First-Use Guided Setup Sequence** is observable on a fresh install, verified by adding/adjusting app integration tests in apps/web/src/app/app.spec.tsx that assert guided order before income entry.
- [x] 1.2 Implement **Setup completion state controls guidance visibility** so guidance no longer blocks normal entry after required checkpoints, verified by a manual assertion script in the PR description and a focused test case in apps/web/src/app/app.spec.tsx.

## 2. Ratio save and warning policy

- [x] 2.1 Implement **Ratio validation changes from blocking rule to warning policy** so **Non-Blocking Ratio Save Policy** allows save for totals 90 and 110 while warning only for totals greater than 100, verified by updating useKeepAccounts and GroupSettingsModal tests to assert no throw on save and warning presence only for over-allocation.
- [x] 2.2 Implement **Ratio values remain user-authored** so persisted target ratios are not normalized during save, verified by unit assertions that stored ratios after save equal submitted values for an over-100 input set.

## 3. Dashboard behavior consistency

- [x] 3.1 Implement **Dashboard allocation reads raw stored ratios without hidden normalization** so **Allocation Display Uses Stored Ratios Without Save Lock Dependency** computes target amounts directly from stored ratios for under-allocation and over-allocation, verified by dashboard rendering tests with concrete source-pool fixtures.
- [x] 3.2 Run end-to-end artifact and behavior checks by executing `spectra analyze first-use-setup-guidance-and-overallocation-warning --json`, `spectra validate first-use-setup-guidance-and-overallocation-warning`, and the relevant web test target, verifying policy and display contracts remain consistent.
