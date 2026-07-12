## Context

The application uses a fixed floating bottom navigation bar rendered in the root layout and shared by dashboard, history, stats, and settings. Today, the nav remains fully expanded regardless of content scroll depth or interaction mode. This causes avoidable vertical crowding on mobile-sized viewports, especially in transaction-heavy pages.

The project already tracks scroll direction to control page-level affordances, so introducing automatic nav compact/expand can reuse existing interaction signals. The design must avoid adding a manual nav-size switch because additional persistent UI state can conflict with modal states and keyboard-driven interactions.

## Goals / Non-Goals

**Goals:**

- Add automatic compact/expand behavior for the bottom navigation, driven by scroll direction and thresholds.
- Preserve navigation discoverability by keeping icons and active-state cues visible in compact mode.
- Prevent accidental interaction regressions by enforcing safe touch targets and stable behavior during overlays and input focus.
- Keep header/tab-title behavior unchanged while nav size transitions.

**Non-Goals:**

- No user-facing manual toggle for nav compact/expand.
- No changes to tab routing, tab ordering, or destination logic.
- No changes to dashboard/history/stats/settings business calculations.
- No new persistence layer for nav presentation preferences.

## Decisions

### Decision: Automatic state machine with hysteresis thresholds
Use an automatic nav presentation state machine with two scroll thresholds (collapse threshold and expand threshold) instead of a single boundary. This avoids jitter when users hover around one pixel range.

Alternatives considered:
- Single threshold: simpler, but prone to flicker and repeated re-layout.
- Time-only debounce without threshold hysteresis: can still oscillate under touch micro-scroll.

### Decision: Compact mode instead of hidden mode
Use a compact visual mode (reduced height and label emphasis) rather than fully hiding the nav. This preserves wayfinding and keeps destination switching available.

Alternatives considered:
- Fully hidden nav on downward scroll: maximizes space, but reduces discoverability and can trap users on deep content pages.

### Decision: Safety-first override conditions
Force expanded mode when high-priority interaction layers are active (modal/action sheet/input focus scenarios). This prevents collisions where nav transitions compete with overlays or keyboard-driven interactions.

Alternatives considered:
- Always follow scroll regardless of overlays: simpler implementation but creates inconsistent motion during critical interactions.

### Decision: Keep layout ownership centralized
Keep nav behavior orchestration in the shared layout container so all tabs inherit identical behavior and testing remains centralized.

Alternatives considered:
- Per-tab nav control: more flexibility but higher drift risk and duplicated behavior.

## Implementation Contract

### Observable behavior

- The bottom nav SHALL automatically switch between expanded and compact states based on scroll direction and threshold crossings.
- Scrolling down beyond the collapse threshold SHALL compact the nav.
- Scrolling up beyond the expand threshold SHALL restore expanded nav.
- Compact state SHALL still show tab icons and active destination indication.
- The nav SHALL remain expanded while high-priority overlays or input-focus interactions are active.

### Interface and state shape

- Introduce a layout-level nav presentation state with two values: `expanded` and `compact`.
- Derive nav presentation from existing scroll signal plus threshold logic and safety overrides.
- Expose nav state to the rendered nav container through explicit class/style state binding rather than implicit DOM mutation.

### Failure and fallback behavior

- If scroll metrics are unavailable (non-scrollable content or unsupported event path), nav SHALL default to expanded.
- On state ambiguity, choose expanded as the safe fallback.
- Nav transition failures SHALL NOT block tab click interactions.

### Acceptance criteria

- Manual verification: on long scroll pages, nav compacts on downward travel and expands on upward travel without flicker.
- Manual verification: when interaction overlays are active, nav remains expanded and stable.
- Test verification: layout behavior tests assert threshold-driven compact/expand transitions and non-regression of active tab visibility.
- Test verification: compact mode keeps icon visibility and usable touch target constraints.

### Scope boundaries

In scope:
- Bottom nav visual state transitions and layout wiring.
- Related style updates for compact and expanded modes.
- Tests covering transition behavior and interaction safety.

Out of scope:
- Changes to transaction data logic or dashboard calculations.
- New settings/preferences for nav behavior.
- Re-architecture of tab routes or icon set.

## Risks / Trade-offs

- [Risk] Over-sensitive thresholds can cause rapid state flipping on short gestures. → Mitigation: hysteresis thresholds and direction-aware gating.
- [Risk] Compact visuals may reduce readability on very small devices. → Mitigation: keep icons prominent and preserve active-state contrast.
- [Risk] Overlay detection might miss edge cases. → Mitigation: default to expanded on uncertain state and include regression checks on modal flows.
