## Why

The current UI has several minor issues: the transaction modal lacks scroll support, making its bottom contents inaccessible on small screens; input focus outlines and spinners break the custom dark UI; history items are listed flat without time grouping; the FAB overlaps delete/edit buttons; and there is no support for a light theme. Addressing these UI issues and adding theme support will improve the mobile usability, accessibility, and visual consistency of the application.

## What Changes

- Update the transaction modal container styling to enable overflow scrolling.
- Refine Ionic input styles, removing default numeric spinners and browser focus rings.
- Add Year/Month/Day grouping controls and headers with totals inside the History Tab.
- Implement scroll listener on the History Tab to hide the FAB when scrolling down and show when scrolling up.
- Add a theme switcher (System, Light, Dark) under the Settings tab and implement custom light theme variable overrides in CSS.

## Non-Goals (optional)

(none)

## Capabilities

### New Capabilities

- ui-layout-fixes: Corrects the transaction modal scrollability, styled input elements, and scroll-hiding FAB.
- history-grouping: Grouping selector and structured headers for Year/Month/Day in History tab.
- theme-management: Theme switcher settings and runtime support for System, Light, and Dark themes.

### Modified Capabilities

(none)

## Impact

- Affected specs: ui-layout-fixes, history-grouping, theme-management
- Affected code:
  - Modified:
    - apps/web/src/app/components/TransactionModal.tsx
    - apps/web/src/app/components/HistoryTab.tsx
    - apps/web/src/app/app.tsx
    - apps/web/src/styles.css
