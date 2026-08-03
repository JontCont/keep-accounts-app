## 1. Implementation

- [x] 1.1 Export `ICON_NAMES_ZH` in `libs/shared/domain/src/lib/icons.ts` by applying decision `Extract Icon Label Metadata to Domain Lib`. Verified by inspecting exported `ICON_NAMES_ZH` from `@keep-accounts-app/domain`.
- [x] 1.2 Refactor `apps/web/src/app/components/GroupSettingsModal.tsx` to consume `ICON_NAMES_ZH` from `@keep-accounts-app/domain` and clean up `import React`. Verified by running `npx tsc --noEmit` and `npx nx test web`.
