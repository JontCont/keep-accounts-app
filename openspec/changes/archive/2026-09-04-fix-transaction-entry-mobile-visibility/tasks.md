## 1. Ionic 日期元件

- [x] 1.1 Complete Ionic base styles：在 `apps/web/src/main.tsx` 載入 Ionic 的基礎 reset、結構與排版樣式，使 Readable Transaction Date and Time Picker 在兩種主題下顯示週別、可選日期、選取狀態與時間；以開啟 `IonDatetimeButton` 的行動尺寸視覺檢查確認日曆日期可讀。

## 2. 交易輸入可視高度

- [x] 2.1 Bound transaction entry form viewport：為 `apps/web/src/app/components/TransactionModal.tsx` 的 page 呈現建立容器、可捲動欄位與操作列 class，並在 `apps/web/src/styles.css` 以動態 viewport height、安全區域與 fallback 規則限制版面，使 Scrollable Long Transaction Entry Form 可捲至全部分期欄位與取消/儲存按鈕；以短行動 viewport 手動檢查內容不被裁切。
- [x] 2.2 保持 Interactive Virtual Keyboard Viewport Behavior：在虛擬鍵盤縮小可視區後，確保交易輸入欄位區可捲動且取消/儲存操作保持可到達，並不改變交易儲存回呼、日期值或分期展開；以聚焦分期輸入欄位後捲至儲存操作並提交的行動端流程驗證。

## 3. 回歸驗證

- [x] 3.1 擴充 `apps/web/src/app/components/TransactionModal.spec.tsx`，確認日期選擇器關聯與 page 分期表單的可捲動容器/操作列 class，並以 `nx test web -- --run src/app/components/TransactionModal.spec.tsx` 驗證。
- [x] 3.2 擴充 `apps/web-e2e/src/module-history.spec.ts` 的行動尺寸流程，完成分期 Setup 後進入 Details、聚焦欄位、捲至操作列並完成儲存，且擷取日期選擇器可見性檢查；以 `nx e2e web-e2e -- --project=chromium` 驗證。

## 4. 原生鍵盤與分期步驟

- [x] 4.1 Configure native keyboard resizing：在 `apps/web/capacitor.config.ts` 與 iOS Podfile 設定 Capacitor Keyboard 的 Ionic resize，使 iOS 鍵盤出現時 `ion-app` 高度縮小，並在 Android `MainActivity` 設定 `adjustResize`；以 `npx cap sync ios` 確認 iOS 偵測 `@capacitor/keyboard`，並以 manifest 靜態檢查確認 Android 設定。
- [x] 4.2 Guide new installment entry：在 `TransactionModal` 將新增支出的分期模式拆為不自動開啟鍵盤的 Setup 與包含文字、金額和分期細節的 Details，讓返回及繼續都保留表單 state，且基本記帳與既有交易編輯維持單頁；以 `TransactionModal.spec.tsx` 的步驟轉換與儲存參數測試驗證。
- [x] 4.3 Guided New Installment Transaction Entry：擴充 `TransactionModal.spec.tsx`，確認 Setup 顯示帳戶、分類與日期並不自動聚焦文字輸入，Details 顯示完整分期欄位，返回不會儲存或清除已輸入值；以 `nx test web -- --run src/app/components/TransactionModal.spec.tsx` 驗證。

## 5. 新建記帳 modal 步驟流程

- [x] 5.1 Guided New Transaction Entry：在 `TransactionModal` 完成 Combine transaction type and setup in a modal，將所有新建交易改為兩步 modal，第一步 Setup 同頁顯示支出／收入／不計損益、基本／分期、帳戶、分類與日期，第一步的「下一步」不儲存，第二步 Details 依基本或分期模式顯示對應內容；由 Details 返回 Setup 再繼續時保留已填 state，既有交易編輯維持單頁；以 `TransactionModal.spec.tsx` 驗證。
- [x] 5.2 Modal new transaction entry：讓 `TransactionEntryPage` 使用 modal 呈現，確保 Dashboard 的「新增記帳明細」一開啟即顯示 Step 1，並保留既有一般與分期入口的初始模式；以 `TransactionEntryPage.spec.tsx` 及 `app.spec.tsx` 驗證。
- [x] 5.3 行動端 modal guided flow：擴充 `module-history.spec.ts`，確認行動尺寸從含交易類型與設定的新增記帳 modal Step 1 前往 Details、捲至操作列並儲存；以 `nx e2e web-e2e -- --project=chromium src/module-history.spec.ts` 驗證。
