## Context

`AppIcon.tsx` currently contains an internal `iconMap` dictionary mapping icon names (such as `bar-chart` -> `BarChart2` and `close` -> `X`). Moving this mapping into the shared `@keep-accounts-app/domain` library aligns with SRP by separating domain data from React presentation components.

## Goals / Non-Goals

**Goals:**
- Extract icon alias dictionary `ICON_ALIAS_MAP` and list `AVAILABLE_ICONS` into `libs/shared/domain/src/lib/icons.ts`.
- Update `AppIcon.tsx` to import `ICON_ALIAS_MAP` from `@keep-accounts-app/domain`.

**Non-Goals:**
- Removing SVG rendering logic from `AppIcon.tsx`.

## Decisions

### 1. Extract Icon Registry into Domain Library

- **Decision**: Define `ICON_ALIAS_MAP` and `AVAILABLE_ICONS` in `libs/shared/domain/src/lib/icons.ts` and export them from the domain index.
- **Rationale**: Provides a Single Source of Truth (SSOT) accessible across all applications and components.

## Implementation Contract

- **Behavior**: Icon rendering behavior is preserved; `AppIcon` looks up aliases in `ICON_ALIAS_MAP` before converting to PascalCase.
- **Interface / Data Shape**: Export `ICON_ALIAS_MAP: Record<string, string>` and `AVAILABLE_ICONS: string[]` from `@keep-accounts-app/domain`.
- **Failure Modes**: N/A
- **Acceptance Criteria**: All existing unit tests pass and `AppIcon.tsx` delegates alias mapping to `@keep-accounts-app/domain`.
- **Scope Boundaries**: In scope: `icons.ts`, `domain/src/index.ts`, `AppIcon.tsx`.

## Risks / Trade-offs

- [Risk: Missing icon mapping] → Mitigation: Retain PascalCase and Emoji fallback chains in `AppIcon.tsx`.
