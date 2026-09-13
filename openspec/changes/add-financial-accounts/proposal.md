## Why

目前交易只記錄分配群組與分類，無法指出款項實際由哪個銀行帳戶扣除或由哪張信用卡支付。使用者因此無法分辨消費發生、信用卡負債增加與銀行帳戶實際扣款，也無法得到可信的帳戶餘額與未繳卡款。

## What Changes

- 新增可管理的金融帳戶，至少支援銀行帳戶、信用卡與現金，並允許設定初始餘額或初始欠款。
- 讓收入與支出交易同時保留分配群組／分類及金融帳戶；兩者是獨立維度。
- 依交易紀錄衍生銀行／現金餘額與信用卡未繳金額。
- 將信用卡繳款記為銀行帳戶至信用卡的移轉，更新雙方餘額但不重複計入損益或預算支出。
- 調整交易輸入控制的詞彙與階層，避免目前代表「一般／分期」的「付款方式」與新金融帳戶選擇混淆。
- 對既有交易維持相容：缺少金融帳戶時仍可讀取、顯示及編輯，但不納入任何特定金融帳戶餘額。

## Capabilities

### New Capabilities

- `financial-accounts`: 管理銀行帳戶、信用卡與現金，將交易連結至金融帳戶，並以不重複計入支出的移轉規則計算餘額及信用卡未繳金額。

### Modified Capabilities

- `transaction-entry-control-hierarchy`: 區分一般／分期的付款型態控制與實際金融帳戶選擇，並定義各交易類型應呈現的帳戶欄位。

## Impact

- Affected specs: financial-accounts, transaction-entry-control-hierarchy
- Affected code:
  - New:
    - apps/web/src/app/components/FinancialAccountSettingsModal.tsx
    - apps/web/src/app/components/FinancialAccountSettingsModal.spec.tsx
    - libs/shared/domain/src/lib/financial-accounts.ts
    - libs/shared/domain/src/lib/financial-accounts.spec.ts
  - Modified:
    - libs/shared/domain/src/lib/types.ts
    - libs/shared/domain/src/index.ts
    - libs/shared/state/src/lib/use-keep-accounts.ts
    - libs/shared/sqlite/src/lib/persistence.ts
    - libs/shared/sqlite/src/lib/query-store.ts
    - apps/web/src/app/app.tsx
    - apps/web/src/app/components/TransactionModal.tsx
    - apps/web/src/app/components/TransactionModal.spec.tsx
    - apps/web/src/app/components/TransactionLedgerRow.tsx
    - apps/web/src/app/components/HistoryTab.tsx
    - apps/web-e2e/src/module-history.spec.ts
    - .github/workflows/build-app.yml
  - Removed: none
