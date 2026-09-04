## Why

目前新增記帳的「交易類型」與「基本／分期」共用相同的 segmented button 外觀，讓主決策與付款安排難以區分，第一步的閱讀順序也不夠清楚。

## What Changes

- 將交易類型呈現為有明確「交易類型」label 的三個語意選項卡，讓支出、收入與不計損益成為主要選擇。
- 將基本／分期改為有明確「付款方式」label 的次要控制項，且僅在新建支出時提供。
- 在收入與不計損益的 Setup 不含付款方式時，讓 modal 依內容收合高度並維持 viewport 高度上限。
- 改用既有 AppIcon 呈現交易類型圖示，保留按鈕的可存取名稱、狀態與既有交易規則。

## Capabilities

### New Capabilities

- `transaction-entry-control-hierarchy`: 讓新增交易 Setup 中的交易類型與付款方式具有可辨識的視覺層級與明確標籤。

### Modified Capabilities

(none)

## Impact

- Affected specs: transaction-entry-control-hierarchy
- Affected code:
  - New: openspec/changes/refine-transaction-entry-hierarchy/specs/transaction-entry-control-hierarchy/spec.md
  - Modified: apps/web/src/app/components/TransactionModal.tsx
  - Modified: apps/web/src/styles.css
  - Modified: apps/web/src/app/components/TransactionModal.spec.tsx
