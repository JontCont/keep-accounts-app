## 1. Implementation

- [x] 1.1 Create `libs/shared/domain/src/lib/icons.ts` exporting `ICON_ALIAS_MAP` and `AVAILABLE_ICONS` by applying decision `Extract Icon Registry into Domain Library`, exporting it in `libs/shared/domain/src/index.ts`. Verified by inspecting exported `ICON_ALIAS_MAP` and `AVAILABLE_ICONS` from domain.
- [x] 1.2 Refactor `apps/web/src/app/components/AppIcon.tsx` to import `ICON_ALIAS_MAP` from `@keep-accounts-app/domain`. Verified by running `npx tsc --noEmit` and `npx nx test web`.
