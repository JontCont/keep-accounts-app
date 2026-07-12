## Context

The web app currently starts with empty groups and transactions for first-time users. Users can immediately enter income before finishing account-group setup, which weakens trust in allocation feedback because source-pool and target-ratio context is not yet established. The current save path enforces a strict sum-equals-100 rule for non-source target ratios, which blocks onboarding progress even when users intentionally want unallocated ratio during early setup.

## Goals / Non-Goals

**Goals:**

- Introduce a first-use guidance flow that enforces a clear setup order: total-asset baseline, major account-group setup, then income entry.
- Replace hard ratio-save blocking with warning-only behavior when non-source ratio total is greater than 100.
- Preserve user-entered ratios exactly as provided, without automatic normalization.

**Non-Goals:**

- No new backend service, IPC seam, or persistence engine migration.
- No redesign of unrelated screens outside first-use setup and allocation warning touchpoints.
- No change to chart aggregation formulas beyond consuming stored ratios as-is.

## Decisions

### First-use guidance gates income entry until setup prerequisites are complete
Use a first-session guidance state in the app shell that marks setup checkpoints and controls when income entry affordances become primary. This keeps user actions aligned with allocation model assumptions.

Alternatives considered:
- Passive tooltip-only hints were rejected because they do not prevent invalid sequence and were likely to be skipped.
- Hard lock on the entire app was rejected as too rigid; guidance should focus on setup-critical actions only.

### Ratio validation changes from blocking rule to warning policy
Move ratio policy from throw-on-save to warning semantics. Save SHALL remain available for all totals; warning SHALL appear only when total non-source ratio is greater than 100.

Alternatives considered:
- Keep strict 100% lock was rejected due to onboarding friction.
- Auto-normalize to 100% was rejected because it mutates user intent silently.

### Dashboard allocation reads raw stored ratios without hidden normalization
Allocation display SHALL continue to compute amounts directly from source-pool and each group ratio. When total ratio is less than or equal to 100, no warning is required. When greater than 100, warning messaging belongs to setup/editor surfaces, not hidden recomputation.

Alternatives considered:
- Runtime normalization in dashboard was rejected because it creates mismatch between settings and displayed behavior.

## Implementation Contract

- Behavior:
  - First-use users SHALL see a guided setup sequence before income-driven allocation feedback is relied upon.
  - Non-source ratio totals less than or equal to 100 SHALL save without warning.
  - Non-source ratio totals greater than 100 SHALL save and SHALL display an over-allocation warning with overflow value.

- Interface / data shape:
  - Account-group ratio data remains the existing numeric targetRatio per non-source group.
  - Setup guidance state is UI-level flow state; no schema change is required for core storage objects in this change.

- Failure modes:
  - Corrupted local storage fallback remains unchanged: app recovers to empty state.
  - If guidance state cannot be restored, app SHALL default to showing setup guidance for safety.

- Acceptance criteria:
  - Manual verification: first session can complete baseline and group setup before income entry becomes primary.
  - Manual verification: ratio sum 90 saves with no warning; ratio sum 110 saves with warning "over-allocated by 10%".
  - Analyzer verification: specs, tasks, and proposal remain consistent on warning-only policy.

- Scope boundaries:
  - In scope: first-use flow ordering, ratio warning policy, save behavior changes, related UI messaging.
  - Out of scope: backend APIs, cross-platform native backup behavior, unrelated visualization redesign.

## Risks / Trade-offs

- [Risk] Guidance is perceived as extra friction by returning users after data reset. → Mitigation: show guidance only when first-use conditions are detected.
- [Risk] Allowing greater-than-100 ratios can confuse users about allocation totals. → Mitigation: display explicit over-allocation warning with numeric overflow.
- [Risk] Existing tests expect throw-on-save behavior. → Mitigation: update tests to assert warning semantics and continued save success.
