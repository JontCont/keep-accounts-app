## Why

The transaction list rows on the Dashboard tab currently use raw Unicode emojis (✏️ and 🗑️) for editing and deleting transactions. To maintain visual consistency with the History tab which uses Lucide outlines, these buttons should be updated to use flat outline-based SVG icons.

## What Changes

- Update the transaction item action buttons in `DashboardTab.tsx` to render the Lucide `edit` and `trash-2` icons via `<AppIcon>` instead of Unicode emoji characters.
- Align the styling (display, alignment, padding, cursor) of the Dashboard transaction action buttons with the styling used on the History page.

## Capabilities

### New Capabilities

- `flat-transaction-action-icons`: The system SHALL render transaction row edit and delete actions using consistent flat outline icons on both the Dashboard and History tabs.

### Modified Capabilities

(none)

## Impact

- Affected specs: `flat-transaction-action-icons`
- Affected code:
  - Modified:
    - `apps/web/src/app/components/DashboardTab.tsx`
