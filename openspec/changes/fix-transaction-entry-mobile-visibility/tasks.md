## 1. Ionic 日期元件

- [x] 1.1 Complete Ionic base styles：在 `apps/web/src/main.tsx` 載入 Ionic 的基礎 reset、結構與排版樣式，使 Readable Transaction Date and Time Picker 在兩種主題下顯示週別、可選日期、選取狀態與時間；以開啟 `IonDatetimeButton` 的行動尺寸視覺檢查確認日曆日期可讀。

## 2. 交易輸入可視高度

- [x] 2.1 Bound transaction entry form viewport：為 `apps/web/src/app/components/TransactionModal.tsx` 的 page 呈現建立容器、可捲動欄位與操作列 class，並在 `apps/web/src/styles.css` 以動態 viewport height、安全區域與 fallback 規則限制版面，使 Scrollable Long Transaction Entry Form 可捲至全部分期欄位與取消/儲存按鈕；以短行動 viewport 手動檢查內容不被裁切。
- [x] 2.2 保持 Interactive Virtual Keyboard Viewport Behavior：在虛擬鍵盤縮小可視區後，確保交易輸入欄位區可捲動且取消/儲存操作保持可到達，並不改變交易儲存回呼、日期值或分期展開；以聚焦分期輸入欄位後捲至儲存操作並提交的行動端流程驗證。

## 3. 回歸驗證

- [x] 3.1 擴充 `apps/web/src/app/components/TransactionModal.spec.tsx`，確認日期選擇器關聯與 page 分期表單的可捲動容器/操作列 class，並以 `nx test web -- --run src/app/components/TransactionModal.spec.tsx` 驗證。
- [ ] 3.2 擴充 `apps/web-e2e/src/module-history.spec.ts` 的行動尺寸流程，開啟分期記帳、聚焦欄位、捲至操作列並完成儲存，且擷取日期選擇器可見性檢查；以 `nx e2e web-e2e -- --project=chromium` 驗證。
