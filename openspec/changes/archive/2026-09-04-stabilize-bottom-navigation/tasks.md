## 1. 固定純圖示底部導覽

- [x] 1.1 Icon-only accessible bottom navigation 與 Stable bottom navigation dimensions：在 `App` 完成 Render icon-only controls with accessible names，移除四個可見 tab label，為總覽、明細、分析與設定保留非空的 aria-label，並將 active tab 設為 aria-current="page"；完成 Remove scroll-driven navigation presentation，移除只用於 compact/expanded 的 state、refs、scroll handler 與 CSS 變體，使所有捲動位置的導覽容器、按鈕和圖示尺寸相同，且交易 modal 開啟時仍隱藏導覽；以 `npx nx test web -- --run src/app/app.spec.tsx` 驗證 DOM、可存取名稱與捲動後固定幾何，並以瀏覽器向下捲動進行視覺檢查，最後以 `spectra analyze stabilize-bottom-navigation --json` 確認 artifacts 的 Coverage、Consistency 與 Gaps 均無 finding。
