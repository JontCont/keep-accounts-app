## Context

新增記帳的 Setup 已將交易類型、付款方式、帳戶、分類和日期放在同一個步驟。交易類型與基本／分期目前都以相同的 segmented button 容器呈現，使用者無法從外觀快速分辨主決策與支出限定的付款安排。

## Goals / Non-Goals

**Goals:**

- 讓「交易類型」以具語意顏色、圖示和明確文字 label 的主要選擇卡呈現。
- 讓「付款方式」以具明確文字 label 的次要基本／分期切換呈現。
- 保留所有既有類型切換、收入鎖定、分期適用範圍、可存取名稱及 `aria-pressed` 狀態。

**Non-Goals:**

- 不改變交易類型、分類、帳戶或分期的資料與儲存邏輯。
- 不改變新增交易的兩步流程或既有交易的單頁編輯流程。
- 不新增第三方圖示或樣式相依套件。

## Decisions

### Use labeled transaction type cards

將支出、收入與不計損益呈現為三個等寬按鈕卡，卡片內同時提供既有 AppIcon 與交易類型文字。選取狀態以類型對應的色彩、淡色背景與框線呈現；未選取狀態維持乾淨的中性背景。這讓決定交易意圖的控制項在 Setup 中具有最高視覺權重。

不採用原本的單一 segmented 容器，因為它與付款方式控制項過於相似；也不只使用顏色或圖示，因為文字 label 是可掃讀且可存取的主要訊號。

### Use a labeled secondary payment mode control

新建支出時顯示「付款方式」label，再呈現基本／分期的緊湊切換。付款方式使用較低對比的中性容器與主色選取狀態，明確從交易類型卡中退居次要。

不在收入與不計損益顯示付款方式，因為分期只適用於新建支出，顯示不可用選項會增加認知負擔。

### Use content-fit modal without payment mode

收入與不計損益的新增交易 Setup 沒有付款方式時，modal 使用內容所需高度並保留動態 viewport 最大高度。支出 Setup 與所有 Details 繼續使用固定高度，讓分期與鍵盤情境仍有可預期且可捲動的欄位區。

不在所有 modal 狀態使用內容高度，因為分期 Details 需要固定的可捲動區域；也不以空白撐開交易類型卡，因為那會使主選擇卡的高度隨交易類型改變。

### Preserve control interfaces and behavior

既有按鈕持續以可見文字與 `aria-pressed` 提供狀態，收入鎖定維持 disabled 行為，現有事件處理與表單 state 不變。僅新增結構 class 與 AppIcon 呈現所需的語意標記。

不將按鈕改為 radio input，避免在不改變行為的視覺調整中改變鍵盤互動與現有測試定位。

## Implementation Contract

在新增交易的 Setup 中，使用者 SHALL 看到「交易類型」label 與支出、收入、不計損益三個有可見文字的主要選擇卡；每個選項具有圖示，選取的選項具有對應類型的明確視覺狀態。新建支出 SHALL 額外看到「付款方式」label 與基本、分期兩個次要切換；收入與不計損益 SHALL 不顯示付款方式，並使用內容高度的 modal 且不超過動態 viewport。所有按鈕 SHALL 保留可見文字、`aria-pressed` 與既有收入鎖定／分期切換行為。

以 TransactionModal focused test 確認兩個 label、按鈕文字、狀態和分期限制；以 web focused test 與瀏覽器短視窗檢查確認第一步可讀且不改變流程。範圍只限於交易設定控制項的 JSX 與 CSS。

## Risks / Trade-offs

- [三張卡在窄螢幕文字擁擠] → 使用等寬 grid、受控字級與不換行規則，並在極窄 viewport 降低內距。
- [顏色成為唯一狀態訊號] → 同時保留文字、圖示、框線與 `aria-pressed`。
- [視覺重構影響點擊行為] → 保持既有 button、onClick 和 state transition，並執行 focused tests。
