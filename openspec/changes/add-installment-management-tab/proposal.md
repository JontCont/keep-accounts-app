## Why

分期交易本身不是單筆一般交易，而是會展開成多筆具關聯的紀錄。現在把分期混在「全部 / 收入 / 支出」清單裡，只能把它當成普通交易處理，容易讓使用者誤刪、誤改單期，也讓分期的管理責任分散到不該承擔它的頁面。

## What Changes

- 將交易明細頁的分頁調整為 `全部 / 收入 / 支出 / 分期`。
- 保留 `全部 / 收入 / 支出` 為一般交易清單，只顯示分期交易的唯讀資訊，不提供分期層級的編輯或刪除。
- 新增 `分期` 分頁作為分期管理入口，將同一組分期以群組方式呈現。
- 在分期分頁中提供整組分期的管理動作，例如查看群組內容、刪除單期、刪除整組、提前結清。
- 讓分期相關的操作從一般交易列表中移除，避免一般清單同時承擔展示與管理兩種職責。

## Non-Goals (optional)

- 不重新設計一般收支交易的新增流程。
- 不引入新的分期儲存格式或獨立資料表。
- 不在 `全部 / 收入 / 支出` 分頁中保留分期的編輯或刪除入口。
- 不把分期管理擴充成通用的多層群組系統；這次只處理分期群組。

## Capabilities

### New Capabilities

- `installment-management-tab`: provide a dedicated installment tab that groups installment transactions and supports installment-specific management actions.

### Modified Capabilities

(none)

## Impact

- Affected specs: `installment-management-tab`
- Affected code:
  - Modified: `apps/web/src/app/components/HistoryTab.tsx`
  - Modified: `apps/web/src/app/components/DashboardTab.tsx`
  - Modified: `apps/web/src/app/components/TransactionModal.tsx`
  - Modified: `libs/shared/state/src/lib/use-keep-accounts.ts`
  - Modified: `apps/web/src/app/app.spec.tsx`
  - Modified: `apps/web/src/app/installments.spec.ts`
