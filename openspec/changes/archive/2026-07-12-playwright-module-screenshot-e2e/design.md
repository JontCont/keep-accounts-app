## Context

The current Playwright coverage in `apps/web-e2e` is a placeholder smoke test that does not validate production user workflows. The application now has four user-facing modules (Dashboard, History, Stats, Settings) with concrete UI contracts and business interactions. Stakeholders requested module-by-module validation with screenshots as human-readable evidence of pass conditions.

## Goals / Non-Goals

**Goals:**

- Define a stable E2E test architecture that maps one scenario group per module: Dashboard, History, Stats, and Settings.
- Require deterministic assertions before screenshots so screenshots are evidence of verified states, not arbitrary captures.
- Preserve compatibility with the existing Nx + Playwright execution flow and report directories.
- Keep selectors resilient by preferring existing `data-testid` anchors and stable module labels.

**Non-Goals:**

- Replacing unit/integration tests with E2E tests.
- Introducing native-device automation for iOS/Android packaging in this change.
- Reworking functional product behavior solely for test convenience beyond minimal selector hardening.

## Decisions

### Decision: Organize Playwright scripts by module
Create explicit module-oriented specs under `apps/web-e2e/src/` so failures map directly to one user-facing module.

Alternatives considered:
- Single monolithic scenario file: rejected because triage becomes slower and screenshots become harder to map to responsibilities.
- Keep only placeholder smoke test: rejected because it does not validate real flows.

### Decision: Capture screenshots only after assertion checkpoints
Each module script SHALL assert expected UI state first, then capture one screenshot at the agreed checkpoint:
- Dashboard: after adding a transaction
- History: after applying filter
- Stats: after switching account group
- Settings: after backup action flow

Alternatives considered:
- Screenshot at every step: rejected due to noisy artifacts and slower runtime.
- Screenshot only on failure: rejected because stakeholders requested explicit pass evidence.

### Decision: Use existing Nx e2e target and Playwright outputs
The change SHALL reuse `@keep-accounts-app/web-e2e:e2e` execution and keep artifact outputs under existing Playwright report/output directories.

Alternatives considered:
- Introduce a separate runner or custom report pipeline: rejected as unnecessary complexity for this scope.

## Implementation Contract

### Behavior
- Running `npx nx e2e @keep-accounts-app/web-e2e` SHALL execute module-based Playwright tests covering Dashboard, History, Stats, and Settings.
- Each module test SHALL produce at least one screenshot after a successful assertion checkpoint.
- Screenshots SHALL be named to reveal module and checkpoint intent for auditability.

### Interface / data shape
- Test files SHALL live in `apps/web-e2e/src/` and use Playwright `test`/`expect` APIs.
- Screenshot files SHALL be created through Playwright `page.screenshot(...)` calls and attached to the existing Playwright output/report structure.
- Module checkpoints SHALL correspond to concrete module actions:
  - Dashboard add transaction flow
  - History filter flow
  - Stats account-group switch flow
  - Settings backup action flow

### Failure modes
- If a module checkpoint assertion fails, the test SHALL fail before screenshot capture and surface the failing assertion.
- If screenshot write fails, the test SHALL fail with Playwright file/output error instead of silently skipping evidence.

### Acceptance criteria
- E2E run completes with all module tests passing via existing Nx target.
- Generated output includes module checkpoint screenshots for all four modules.
- Removing or breaking a module checkpoint behavior causes that module test to fail deterministically.

### Scope boundaries
**In scope:**
- Module-oriented Playwright scripts
- Assertion checkpoints and screenshot evidence requirements
- Minor selector hardening needed to keep module tests stable

**Out of scope:**
- Native-device E2E (XCUITest/Espresso/Appium)
- Performance/load benchmarking
- Feature behavior redesign unrelated to testability

## Risks / Trade-offs

- **Risk: UI text changes can break selectors** → Mitigation: prefer existing `data-testid` anchors and use text selectors only where labels are intentionally stable.
- **Risk: Screenshot assertions increase CI artifact size** → Mitigation: limit to one checkpoint screenshot per module and avoid per-step captures.
- **Risk: Shared state between module tests may cause flakiness** → Mitigation: keep tests isolated with explicit setup per scenario and avoid cross-test ordering assumptions.
