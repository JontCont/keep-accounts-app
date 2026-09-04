## Context

目前底部導覽列由 `navPresentation` 追蹤捲動方向，並在 expanded 與 compact class 間切換。expanded 顯示四個圖示與文字，compact 收合文字並改變容器與按鈕尺寸。這使同一個固定位置的導覽列在向下捲動時產生不必要的尺寸變動。

## Goals / Non-Goals

**Goals:**

- 讓總覽、明細、分析與設定只顯示既有 AppIcon 圖示。
- 讓導覽容器、按鈕與圖示尺寸在任何捲動位置和方向皆固定。
- 讓每個圖示按鈕持有可存取名稱，並以 aria-current 公開目前頁籤。

**Non-Goals:**

- 不變更四個頁籤、其圖示、導覽順序或點擊後的頁面行為。
- 不更換 AppIcon 或新增外部圖示套件。
- 不變更交易輸入 modal 開啟時隱藏底部導覽的行為。

## Decisions

### Render icon-only controls with accessible names

移除按鈕內的可見文字節點，並在四個既有按鈕設定對應的 aria-label。啟用頁籤設定 aria-current="page"。這保留純圖示介面的可辨識性，且不需要視覺隱藏文字造成額外 DOM 與 CSS 狀態。

### Remove scroll-driven navigation presentation

移除僅用於切換 compact 與 expanded 的 state、scroll handler 及 class 分支，並讓導覽永遠使用一套固定的 container、button 與 icon tokens。相較於保留兩個 class 卻對齊尺寸，刪除不需要的狀態可避免每次 scroll event 都觸發 React state 更新，符合 rerender-move-effect-to-event 與 rerender-derived-state-no-effect 的精簡原則。

## Implementation Contract

**Behavior**

- 底部導覽 SHALL 顯示四個純圖示按鈕，且不渲染總覽、明細、分析或設定的可見文字標籤。
- 使用者向上或向下捲動時，導覽列的外部寬度、高度、邊距、圓角、按鈕尺寸與圖示尺寸 SHALL 保持不變。
- 使用者以螢幕閱讀器或鍵盤操作時，四個按鈕 SHALL 分別公開總覽、明細、分析與設定的名稱；啟用中的頁籤 SHALL 有 aria-current="page"。
- 記帳 modal 開啟時，導覽列 SHALL 依現有行為保持隱藏。

**Implementation shape**

- `App` SHALL 不再持有僅服務底部導覽收合的 state、refs 或 scroll handler。
- 底部導覽 SHALL 使用固定 class 與一致的 CSS tokens，而非 expanded 或 compact 修飾 class。
- 既有 AppIcon 名稱與 tab state SHALL 繼續驅動圖示和啟用樣式。

**Failure modes**

- 若 CSS transition 在支援 reduced motion 的環境被停用，導覽尺寸與 active state SHALL 仍維持可辨識且固定。
- 若按鈕僅有圖示，aria-label SHALL 作為文字標籤的唯一可存取替代，且不得為空。

**Acceptance criteria**

- `app.spec.tsx` SHALL 驗證向下與向上捲動後，導覽沒有 compact class、尺寸相同且四個 label 文字不在 DOM。
- `app.spec.tsx` SHALL 驗證四個 icon button 的 accessible name 與啟用頁籤的 aria-current。
- 瀏覽器手動檢查 SHALL 確認向下捲動後，導覽列仍為 icon-only 且尺寸沒有跳動。
- `spectra analyze stabilize-bottom-navigation --json` SHALL 在 Coverage、Consistency 與 Gaps 維度沒有 finding。

**Scope boundaries**

- In scope: 底部導覽 JSX、捲動相關 presentation state、底部導覽 CSS 與 App 元件測試。
- Out of scope: 頁籤路由、全域捲動行為、AppIcon 實作、交易輸入流程與其他頁面版面。

## Risks / Trade-offs

- [純圖示降低初次辨識度] → 每個按鈕保留語意化 aria-label、可見 active state 與至少 44px 的觸控目標。
- [移除 scroll handler 可能誤移除其他捲動邏輯] → 僅刪除被 navPresentation 專用的 state 和條件，並以 App focused tests 驗證頁籤操作與 modal 隱藏行為。
