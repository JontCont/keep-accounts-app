## Why

分期已經被整理成獨立流程，但現在新增入口還是和一般記帳混在一起，使用者需要先進 modal 才知道該走哪條路，容易在後續分期限制上產生誤用。把入口收斂到「歷史交易明細」的 create icon 上，可以先分流成一般與分期，再保留原本新增按鈕的位置與視覺，降低操作成本。

## What Changes

- 只在「歷史交易明細」頁面的 create icon 上提供一個選單，讓使用者先選擇新增一般記帳或新增分期。
- 保留 create icon 的原本位置與外觀，不改動頁面上的按鈕布局。
- 讓「一般」仍維持現有新增流程，「分期」則直接進入分期模式。
- 其他頁面不新增這個分流選單，仍維持原本的 create 行為。
- **BREAKING**: 歷史頁的新增入口行為會從單一步驟改成先選型別再進入表單。

## Non-Goals (optional)

- 不改動歷史頁以外的 create icon 行為。
- 不重新設計一般交易表單內容。
- 不在 modal 內新增額外的分期 / 一般切換入口。
- 不變更分期資料結構或帳務計算方式。

## Capabilities

### New Capabilities

- `history-create-menu`: provide a history-page-only create menu that routes the user to either a normal transaction flow or an installment flow while preserving the original button location.

### Modified Capabilities

(none)

## Impact

- Affected specs: `history-create-menu`
- Affected code:
  - Modified: `apps/web/src/app/app.tsx`
  - Modified: `apps/web/src/app/components/HistoryTab.tsx`
  - Modified: `apps/web/src/app/components/TransactionModal.tsx`
  - Modified: `apps/web/src/app/app.spec.tsx`
