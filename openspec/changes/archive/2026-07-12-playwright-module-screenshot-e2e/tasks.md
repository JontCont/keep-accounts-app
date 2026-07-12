## 1. Module-based Playwright coverage implementation

- [x] 1.1 Deliver **Requirement: Module-based Playwright coverage for core tabs** by replacing `apps/web-e2e/src/example.spec.ts` with a navigation smoke that confirms all four modules are reachable, and verify with `npx nx e2e @keep-accounts-app/web-e2e -- --grep "module navigation"`.
- [x] 1.2 Implement **Decision: Organize Playwright scripts by module** by creating `apps/web-e2e/src/module-dashboard.spec.ts`, `apps/web-e2e/src/module-history.spec.ts`, `apps/web-e2e/src/module-stats.spec.ts`, and `apps/web-e2e/src/module-settings.spec.ts` with independent test names, and verify by checking Playwright report entries show one suite per module.
- [x] 1.3 Implement **Behavior** and **Interface / data shape** from the Implementation Contract by asserting Dashboard add-transaction, History filter, Stats account-group switch, and Settings backup-action flows in their module specs, and verify with `npx nx e2e @keep-accounts-app/web-e2e` passing those four module scenarios.

## 2. Screenshot checkpoint evidence and attribution

- [x] 2.1 Deliver **Requirement: Checkpoint screenshot evidence is captured after validation** and **Decision: Capture screenshots only after assertion checkpoints** by adding assertion-then-screenshot order in each module spec using stable checkpoint filenames, and verify by reviewing generated screenshot files under Playwright output for all four modules.
- [x] 2.2 Deliver **Requirement: Screenshot artifacts are reviewable by module** by enforcing module+checkpoint naming conventions (dashboard/history/stats/settings) in screenshot paths, and verify with a manual content review that a reviewer can map each screenshot to a module without opening test code.
- [x] 2.3 Implement **Failure modes** and **Acceptance criteria** by ensuring each module test fails before screenshot capture when checkpoint assertions fail, and verify with a temporary negative assertion trial plus a normal green run restoring all assertions.

## 3. Runner integration and isolation guarantees

- [x] 3.1 Implement **Decision: Use existing Nx e2e target and Playwright outputs** by updating `apps/web-e2e/playwright.config.mts` only as needed for deterministic screenshot artifact output while preserving current Nx target compatibility, and verify with `npx nx show project @keep-accounts-app/web-e2e` plus a successful `npx nx e2e @keep-accounts-app/web-e2e` run.
- [x] 3.2 Deliver **Requirement: Module failures remain isolated and attributable** and satisfy **Scope boundaries** by making module tests independently reportable (no cross-test ordering dependency), and verify by observing per-module pass/fail entries in the Playwright HTML report.
