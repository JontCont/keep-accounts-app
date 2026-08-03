## Context

`GroupSettingsModal.tsx` defines a private `ICON_NAMES_ZH` object mapping icon names to Traditional Chinese labels. Centralizing this metadata in `@keep-accounts-app/domain` ensures consistent icon labels across all components and pages.

## Goals / Non-Goals

**Goals:**
- Move `ICON_NAMES_ZH` to `libs/shared/domain/src/lib/icons.ts`.
- Refactor `GroupSettingsModal.tsx` to import `ICON_NAMES_ZH` from `@keep-accounts-app/domain`.
- Clean up unused default `React` import in `GroupSettingsModal.tsx`.

**Non-Goals:**
- Changing existing Chinese label translations or component prop contracts.

## Decisions

### 1. Extract Icon Label Metadata to Domain Lib

- **Decision**: Export `ICON_NAMES_ZH` in `libs/shared/domain/src/lib/icons.ts`.
- **Rationale**: Centralizes icon display metadata for reuse in modals, dropdowns, and settings.

## Implementation Contract

- **Behavior**: Component behavior remains identical.
- **Interface / Data Shape**: Export `ICON_NAMES_ZH: Record<string, string>` from `@keep-accounts-app/domain`.
- **Failure Modes**: N/A
- **Acceptance Criteria**: `npx tsc --noEmit` and `npx nx test web` pass without warnings or errors.
- **Scope Boundaries**: `icons.ts` and `GroupSettingsModal.tsx`.

## Risks / Trade-offs

- [Risk: Missing translation key] → Mitigation: Retain key name fallback in `CustomSelect`.
