## Context

The history page already owns the transaction browsing surface and the floating create button. The current modal supports both general entry and installment entry, but the user now wants the choice to happen before the modal opens, and only on the history page. The create button must stay in the same visual location so the page layout does not shift.

This is a UI-flow change only. No transaction data model changes are required.

## Goals / Non-Goals

**Goals:**

- Add a history-page-only create menu that lets the user choose between a normal transaction flow and an installment flow.
- Preserve the create button's existing position and visual treatment.
- Keep non-history pages on the current single-action create behavior.
- Make the chosen entry mode explicit before the transaction modal opens.

**Non-Goals:**

- Do not change the transaction storage model or installment expansion logic.
- Do not redesign the full transaction modal.
- Do not add the create menu to tabs other than history.
- Do not move the create button to a different screen region or navigation area.

## Decisions

### History page create menu only

Use a small Ionic menu or action sheet from the existing create icon on the history page. This keeps the icon in place while adding one extra choice before the modal opens.

**Alternatives considered:**
- Put the choice inside the modal. Rejected because it forces the modal to carry entry-mode selection and downstream installment restrictions.
- Add a separate button next to the icon. Rejected because it changes the layout and makes the history page visually busier.

### Preserve original position and layout

Keep the button anchored where it already lives so the user learns one stable location for creating records. The only change is what happens after the click.

**Alternatives considered:**
- Move the create action into a toolbar dropdown. Rejected because it would relocate a control that users already know.
- Add a modal launcher in the navigation bar. Rejected because the history page already owns this action and should keep doing so.

### Explicit entry mode handoff to the modal

Pass the selected entry mode into the modal so the modal can open directly in general or installment mode without showing a second chooser.

**Alternatives considered:**
- Infer the mode from the current tab after the modal opens. Rejected because it is fragile and keeps the modal coupled to page context.
- Keep a shared global flag for entry mode. Rejected because the mode is a one-shot UI choice, not application state.

## Implementation Contract

The change SHALL produce the following observable behavior:

- On the history page, clicking the existing create icon SHALL open a two-option menu with general and installment entry choices.
- The create icon SHALL remain in its original position and SHALL not shift the surrounding layout.
- Choosing the general option SHALL open the existing normal transaction modal flow.
- Choosing the installment option SHALL open the transaction modal directly in installment mode.
- On non-history pages, the create action SHALL keep its current behavior and SHALL NOT expose the history-only menu.

Acceptance criteria:

- Browser verification on the history page shows the create menu from the existing icon position.
- Browser verification on non-history pages shows the original create behavior unchanged.
- `npx nx test @keep-accounts-app/web` passes.

Scope boundaries:

- In scope: create-entry interaction on the history page, menu presentation, and modal entry-mode handoff.
- Out of scope: transaction persistence, installment calculations, and unrelated tab navigation behavior.

## Risks / Trade-offs

[Risk] A menu can add one more click for the common general-entry flow → Mitigation: keep the menu compact and anchored to the existing icon so the trade-off is only one tap.

[Risk] Entry mode could drift between the chooser and the modal if state is passed loosely → Mitigation: pass the selected mode as a one-shot value when opening the modal.

[Risk] Only history page gets the new menu, which could confuse users who expect the same icon everywhere → Mitigation: keep non-history behavior unchanged and document the history-page-only affordance in the implementation tests.
