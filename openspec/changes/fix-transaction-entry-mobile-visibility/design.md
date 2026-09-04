## Context

交易輸入目前透過 `TransactionEntryPage` 使用 page 呈現，並由 `TransactionModal` 共用基本與分期欄位。日期與時間使用 Ionic 的 `IonDatetimeButton` 和 `IonDatetime`。應用程式入口目前只載入 Ionic 核心樣式，因此日期元件可能缺少完整的基礎版面與排版樣式。分期模式的欄位數量較基本模式多；當 iOS 虛擬鍵盤降低可視高度時，外層容器與表單的高度限制會使後續欄位或操作列落在不可見區。

此修正不改變交易資料、日期格式、分期計算或儲存流程。既有 `mobile-keyboard-viewport` 規格已使視窗配合虛擬鍵盤調整，本次將交易輸入工作流程的可操作性建立在該行為之上。

## Goals / Non-Goals

**Goals:**

- 讓 Ionic 日期與時間選擇器在淺色與深色主題中完整、清楚地顯示日曆內容。
- 讓基本與分期交易輸入在行動裝置可視高度縮小時仍可捲動全部欄位。
- 讓取消與儲存操作維持在可視範圍及裝置安全區域內。
- 以元件測試和行動尺寸的端對端測試覆蓋日期及分期工作流程。

**Non-Goals:**

- 不變更交易、分期提醒或日期資料的型別與儲存格式。
- 不替換 Ionic 日期選擇器，也不建立第二套自訂月曆。
- 不修改其他頁面的版面或虛擬鍵盤行為。
- 不調整分期計算、通知內容或記帳規則。

## Decisions

### Complete Ionic base styles

在應用程式入口載入 Ionic React 建議的基礎 reset、結構與排版樣式，並維持現有主題 CSS 作為顏色 token 的唯一來源。`IonDatetime` 將繼續使用 Ionic 原生元件與既有的 date-time 呈現方式。

這個決策針對自訂元素缺少所需基礎 CSS 的根因，避免以全域 selector 強制覆蓋月曆內部節點。相較於為日期格手動加上顏色或尺寸的方案，官方樣式匯入能同時維護可見、選取與無障礙狀態，並降低 Ionic 版本更新後的維護成本。

### Bound transaction entry form viewport

為交易輸入 page 與其卡片、表單、可捲動欄位區及操作列提供語意化 class，讓版面在可用高度內採用 flex 佈局。外層將以動態 viewport height 與安全區域 inset 限制高度；可捲動欄位區取得剩餘高度；取消與儲存操作列不捲動且保留在卡片底部。

這比縮小字型、刪減分期欄位或將所有內容交由文件捲動更可靠。它讓鍵盤開啟後仍可捲至每個分期欄位，並保留一致的操作位置。現有 `presentation="modal"` 的使用情境維持其現有大小策略；本決策專門處理 `presentation="page"`。

## Implementation Contract

**Behavior**

- 開啟交易日期與時間選擇器時，使用者 SHALL 看見目前月份的週別、可選日期、已選取日期與時間控制；月曆日期不得因目前主題而與背景混合至不可辨識。
- 在小螢幕、包含虛擬鍵盤已顯示而可視高度縮小的情況下，使用者 SHALL 可捲動交易輸入頁以看見並操作分期的名稱、總額、期數、開始月份、每期金額、通知設定與操作列。
- 取消與儲存按鈕 SHALL 保持在交易輸入卡片的可視底部，且不會被裝置 home indicator 或鍵盤覆蓋。
- 交易儲存回呼的參數、日期值與分期展開規則 SHALL 維持不變。

**Implementation shape**

- `apps/web/src/main.tsx` SHALL 成為 Ionic 全域基礎樣式的載入點。
- `apps/web/src/app/components/TransactionModal.tsx` SHALL 以 class 區分交易輸入容器、可捲動欄位與操作列，並根據 `presentation` 套用 page 專用佈局。
- `apps/web/src/styles.css` SHALL 將 page 專用的動態高度、safe area 與 overflow 規則集中管理，不依賴 JavaScript 監聽 viewport。

**Failure modes**

- 若裝置不支援動態 viewport 單位，CSS SHALL 以傳統 viewport 高度作為可用回退值；表單內容仍須可以垂直捲動。
- 若應用程式在不支援行動通知的環境執行，既有通知提示及儲存行為維持不變。

**Acceptance criteria**

- 元件測試確認日期選擇器關聯及分期表單的可捲動容器 class 存在。
- 行動尺寸端對端測試開啟分期記帳、聚焦輸入欄位後，確認可到達儲存操作並提交。
- 行動尺寸視覺檢查確認日期選擇器日期內容可見。

**Scope boundaries**

- In scope: Ionic 基礎樣式、交易輸入 page 佈局、日期選擇器可見性與相關測試。
- Out of scope: 自訂日期元件、交易資料遷移、分期商業規則與其他功能頁重構。

## Risks / Trade-offs

- [加入 Ionic 基礎樣式可能改變既有元素的預設間距] → 僅匯入 Ionic 官方基礎檔案，並以現有元件測試及行動視覺檢查確認交易頁沒有回歸。
- [動態 viewport 單位在舊版 WebView 的結果不同] → 先宣告傳統 viewport 高度回退值，並讓欄位區始終保留垂直捲動。
- [固定操作列可能壓縮短視窗中的欄位區] → 欄位區是唯一可捲動區，且操作列高度固定，因此每個欄位仍可到達。

## Migration Plan

此變更沒有資料遷移需求。部署後以 iOS 行動尺寸驗證日期選擇與分期記帳；若發現版面回歸，可回復入口樣式匯入與交易輸入 page 專用 class/規則，而不影響既有交易資料。

## Open Questions

無。
