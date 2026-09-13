## 1. Domain 契約與計算

- [x] 1.1 在 `libs/shared/domain/src/lib/types.ts` 與 `libs/shared/domain/src/index.ts` 落實「分配群組與金融帳戶維持正交」及「交易使用明確帳戶參照」：匯出 `FinancialAccountType`、`FinancialAccount`、帳戶摘要型別與三個 optional 交易參照，讓既有交易仍可型別檢查、新交易能同時表達用途與金融帳戶；以 domain typecheck 及相容 fixture 測試驗證 `Income and expense account linkage`。
- [x] 1.2 在 `libs/shared/domain/src/lib/financial-accounts.ts` 實作「餘額由起始金額與交易重播衍生」的純函式，涵蓋銀行／現金、信用卡、收入／支出、雙邊轉帳、溢繳、未指定與不存在帳戶；以 `libs/shared/domain/src/lib/financial-accounts.spec.ts` 的國泰 20000／台新刷卡 500／繳款 500 案例及矩陣測試驗證 `Derived account amounts`。

## 2. Persistence 與相容遷移

- [x] 2.1 在 snapshot、storage keys 與備份還原路徑落實「舊資料以未指定金融帳戶相容」：`financialAccounts` 可 round-trip，缺少集合時正規化為空陣列，舊交易不猜測帳戶；以 `libs/shared/state/src/lib/persistence.spec.ts` 的 legacy snapshot 與新版 round-trip 測試驗證 `Financial account persistence compatibility`。
- [x] 2.2 在 `libs/shared/sqlite/src/lib/persistence.ts` 建立金融帳戶表與三個 nullable 交易欄位的冪等 migration，完整 mapping CRUD、交易讀寫及備份還原；以 native persistence 測試重開舊 schema 後資料不遺失且新欄位可 round-trip，驗證 `Financial account persistence compatibility`。
- [x] 2.3 在 `libs/shared/sqlite/src/lib/query-store.ts` 提供使用完整 SQLite 歷史的帳戶摘要查詢，禁止以 200 筆 React 快取計算 native 餘額；以 `libs/shared/state/src/lib/query-store.spec.ts` 建立超過 200 筆資料並核對全量結果，驗證 `Derived account amounts`。

## 3. State 操作與交易規則

- [x] 3.1 在 `libs/shared/state/src/lib/use-keep-accounts.ts` 實作金融帳戶新增、編輯、刪除與封存，落實「以帳戶類型衍生固定群組，不持久化第二層群組」；空白名稱、非法類型及非有限起始金額不得改變 state 或 persistence，已被參照帳戶只能封存，以 hook 測試驗證 `Financial account management` 與 `Referenced account lifecycle`。
- [x] 3.2 在交易保存流程落實「移轉採單筆交易與原子持久化」：收入／支出要求 active `financialAccountId`，轉帳要求不同的有效來源與目的且不參與損益／預算；以 state 測試驗證成功寫入、相同帳戶拒絕、缺漏帳戶拒絕及失敗時無部分 state，覆蓋 `Financial account transfer`。
- [x] 3.3 讓新增、編輯、刪除及分期展開保留正確帳戶參照，分期各列只在既有日期影響摘要；以 state/domain 測試驗證三期 3000 產生三筆各 1000 且使用同一信用卡，覆蓋 `Installment account linkage`。

## 4. 使用者介面

- [x] 4.1 建立 `apps/web/src/app/components/FinancialAccountSettingsModal.tsx` 並接入 `apps/web/src/app/app.tsx`，讓使用者在銀行帳戶、信用卡、現金固定群組中新增、編輯、刪除或封存帳戶，並顯示餘額／未繳／溢繳；以 `FinancialAccountSettingsModal.spec.tsx` 驗證分組、輸入錯誤、刪除與封存流程，覆蓋 `Financial account management` 與 `Referenced account lifecycle`。
- [x] 4.2 更新 `TransactionModal` 與 `TransactionEntryPage` 以實作 `Labeled Transaction Entry Control Hierarchy`：一般／分期改稱「付款型態」並顯示「一次付清／分期」，收入／支出分開選分配群組、分類及金融帳戶，轉帳只選來源與目的帳戶；以既有兩份 component specs 驗證欄位可見性、`aria-pressed`、必填訊息及無帳戶時的建立入口。
- [x] 4.3 更新 `TransactionLedgerRow` 與 `HistoryTab`，讓收入／支出顯示金融帳戶名稱、轉帳顯示「來源 → 目的」、無效或舊參照顯示「未指定帳戶」且頁面不中斷；以 History/ledger component tests 驗證 `Financial account identity in history`。
- [x] 4.4 串接 `apps/web/src/app/app.tsx` 的金融帳戶 state、設定入口、帳戶摘要與交易 callback，確認交易新增、編輯、刪除後畫面立即反映衍生結果；以 `apps/web/src/app/app.spec.tsx` 驗證刷卡、繳款及重新渲染後支出不重複。

## 5. 整合驗證與發行

- [x] 5.1 執行 domain、state、sqlite 與 web 的 Nx test targets 及 web build，修正僅由本變更造成的失敗；以所有命令 exit code 0 驗證型別、計算、持久化與 UI 契約可共同運作。
- [x] 5.2 在 `apps/web-e2e/src/module-history.spec.ts` 加入建立國泰銀行與台新信用卡、刷卡 500、銀行繳款 500、重新載入的端對端流程；以 Playwright 驗證銀行餘額 19500、信用卡未繳 0、支出總額仍為 500。
- [x] 5.3 依 release policy 檢查 `.github/workflows/build-app.yml` 的 `APP_VERSION` 與 `master`，若尚未高於 `master` 則採最小 minor 增量且保留 date-SHA build identifier；以 git diff 與版本比較驗證 develop-to-master 的 `Verify release version` 條件成立。
