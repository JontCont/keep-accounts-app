## Why

目前專案的網頁應用程式（`apps/web`）所有的狀態管理、本機儲存、業務運算與 UI 呈現皆塞在單一檔案 `apps/web/src/app/app.tsx` 中，檔案長度超過 2000 行，導致難以維護、程式碼冗餘度高，且無法獨立進行商業邏輯的單元測試。此變更旨在重構專案架構，將其拆分為領域層（domain）、狀態管理層（state）與視圖層（components）。

## What Changes

1. **建立共享 Libraries**：
   - 新增 `@keep-accounts-app/domain` 共享程式庫，用以集中管理型別定義、預設資料常數以及商業邏輯運算。
   - 新增 `@keep-accounts-app/state` 共享程式庫，用以封裝資料流管理 Hook `useKeepAccounts` 與 `localStorage` 的同步與版本遷移邏輯。
2. **重構 Web 應用程式**：
   - 拆分 [app.tsx](file:///apps/web/src/app/app.tsx)，將 Dashboard、歷史紀錄、統計等視圖移至 `apps/web/src/app/components/` 資料夾下作為獨立的子元件。
   - 移除未使用的 Nx 歡迎樣板檔案 [nx-welcome.tsx](file:///apps/web/src/app/nx-welcome.tsx)。

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected code:
  - New:
    - `libs/shared/domain/src/index.ts`
    - `libs/shared/domain/src/lib/types.ts`
    - `libs/shared/domain/src/lib/constants.ts`
    - `libs/shared/domain/src/lib/utils.ts`
    - `libs/shared/state/src/index.ts`
    - `libs/shared/state/src/lib/use-keep-accounts.ts`
    - `apps/web/src/app/components/DashboardTab.tsx`
    - `apps/web/src/app/components/HistoryTab.tsx`
    - `apps/web/src/app/components/StatsTab.tsx`
    - `apps/web/src/app/components/TransactionModal.tsx`
    - `apps/web/src/app/components/GroupSettingsModal.tsx`
  - Modified:
    - `apps/web/src/app/app.tsx`
  - Removed:
    - `apps/web/src/app/nx-welcome.tsx`
