## Why

 iOS 裝置上的交易記帳頁有三個阻礙完成記帳的問題：日期選擇器的月曆日期可能不可見、分期表單在虛擬鍵盤開啟或可視高度不足時後續欄位與儲存操作可能被裁切，以及使用者在輸入文字後無法可靠地回到分類選擇。這會讓使用者無法確認交易日期或完成分期記帳。

## What Changes

- 確保交易日期與時間選擇器在目前主題下清楚呈現月曆日期、週別、已選取日期與時間。
- 讓交易記帳頁在小螢幕及虛擬鍵盤顯示時，將表單限制在可視區域內並提供內容捲動。
- 保持取消與儲存操作在安全區域內可見且可操作，包含內容較長的分期記帳表單。
- 在 iOS 原生 App 使用 Ionic keyboard resize，並在自訂帳戶或分類選單開啟時收起鍵盤，確保選單可見且可點選。
- 將所有新建記帳改為 modal 呈現，第一步合併交易類型與帳戶／分類／日期設定，第二步輸入名稱與金額的 Details；支出分期在 Details 額外顯示期數與通知設定，既有交易編輯維持單頁。
- 為日期選擇器可見性與行動版分期表單可達性加入元件或端對端驗證。

## Capabilities

### New Capabilities

- `transaction-entry-mobile-visibility`: 交易記帳頁的日期選擇器與長表單在行動可視區內保持可讀、可捲動與可提交。

### Modified Capabilities

- `mobile-keyboard-viewport`: 擴充虛擬鍵盤調整視窗後，交易記帳工作流程仍可操作的要求。

## Impact

- Affected specs: transaction-entry-mobile-visibility, mobile-keyboard-viewport
- Affected code:
  - Modified: apps/web/src/main.tsx
  - Modified: apps/web/src/styles.css
  - Modified: apps/web/src/app/components/TransactionModal.tsx
  - Modified: apps/web/src/app/components/TransactionEntryPage.tsx
  - Modified: apps/web/src/app/components/TransactionEntryPage.spec.tsx
  - Modified: apps/web/src/app/components/TransactionModal.spec.tsx
  - Modified: apps/web-e2e/src/module-history.spec.ts
  - Modified: apps/web/capacitor.config.ts
  - Modified: apps/web/package.json
  - Modified: package-lock.json
  - Modified: apps/web/ios/App/Podfile
  - Modified: apps/web/android/app/src/main/AndroidManifest.xml
  - New: none
  - Removed: none
