## 1. Nav State Orchestration

- [x] 1.1 Implement **Bottom navigation auto-compacts on downward scroll** using the **Decision: Automatic state machine with hysteresis thresholds** in apps/web/src/app/app.tsx so downward threshold crossing transitions nav state to compact; verify with a Vitest assertion in apps/web/src/app/app.spec.tsx that simulates downward scroll progression and observes compact-state rendering.
- [x] 1.2 Implement **Bottom navigation auto-expands on upward scroll** in the same state machine so upward threshold crossing restores expanded state; verify with a paired Vitest assertion in apps/web/src/app/app.spec.tsx that compact state returns to expanded after upward scroll input.

## 2. Compact Presentation and Interaction Safety

- [x] 2.1 Implement **Compact mode preserves navigation usability** according to the **Decision: Compact mode instead of hidden mode** by applying compact-specific style/state bindings in apps/web/src/app/app.tsx and apps/web/src/styles.css while keeping icon visibility and active-state clarity; verify with a UI assertion in tests that compact nav still exposes all tab targets and active indicator.
- [x] 2.2 Implement **Safety overrides keep nav expanded during high-priority interactions** using the **Decision: Safety-first override conditions** so modal/action-sheet/input-focus scenarios force expanded nav regardless of scroll direction; verify with a test in apps/web/src/app/app.spec.tsx that opens an overlay after compacting and confirms expanded fallback.

## 3. Layout Consistency and Contract Verification

- [x] 3.1 Implement **Tab-Specific Header Titles** stability during nav presentation transitions using the **Decision: Keep layout ownership centralized** so header title/subtitle behavior remains unchanged when nav toggles between compact and expanded states; verify with a regression test in apps/web/src/app/app.spec.tsx that tab titles stay correct before and after nav state transitions.
- [x] 3.2 Verify full Implementation Contract coverage for **observable behavior**, **interface and state shape**, **failure and fallback behavior**, **acceptance criteria**, and **scope boundaries** by running `npx nx test web -- --run src/app/app.spec.tsx` and recording a manual long-scroll checklist for dashboard/history compact-expand behavior without flicker.
