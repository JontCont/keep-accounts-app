## Why

Icon mappings and alias resolution were privately hardcoded inside the `AppIcon.tsx` UI component. In accordance with the Single Responsibility Principle (SRP) and Single Source of Truth (SSOT), icon dictionary mappings (`ICON_ALIAS_MAP`) and available icon selections (`AVAILABLE_ICONS`) should be extracted into `@keep-accounts-app/domain`, allowing any component, page, or modal to share a unified icon registry without duplication.

## What Changes

- Create `libs/shared/domain/src/lib/icons.ts` exporting `ICON_ALIAS_MAP` and `AVAILABLE_ICONS`.
- Export `icons.ts` from `@keep-accounts-app/domain` index.
- Refactor `AppIcon.tsx` to consume `ICON_ALIAS_MAP` from `@keep-accounts-app/domain`.

## Non-Goals

- Changing visual appearance of rendered icons or altering Lucide icon library dependencies.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: (none)
- Affected code:
  - New: `libs/shared/domain/src/lib/icons.ts`
  - Modified: `libs/shared/domain/src/index.ts`
  - Modified: `apps/web/src/app/components/AppIcon.tsx`
