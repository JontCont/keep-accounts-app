## Why

底部導覽目前同時顯示文字標籤，且會在向下捲動時縮小為不同尺寸，造成畫面佔用空間與點擊目標不一致。行動記帳使用者需要穩定、簡潔的純圖示導覽。

## What Changes

- 將四個底部導覽頁籤改為純圖示按鈕，不再渲染可見文字標籤。
- 停止依捲動方向壓縮或展開導覽列，所有捲動位置皆維持相同的外觀尺寸與按鈕尺寸。
- 為每個純圖示按鈕保留可存取名稱與目前頁籤狀態，維持鍵盤與輔助技術操作。

## Capabilities

### New Capabilities

- `stable-icon-bottom-navigation`: 提供純圖示、固定尺寸且具可存取名稱的底部導覽。

### Modified Capabilities

(none)

## Impact

- Affected specs: stable-icon-bottom-navigation
- Affected code:
  - Modified: apps/web/src/app/app.tsx
  - Modified: apps/web/src/styles.css
  - Modified: apps/web/src/app/app.spec.tsx
