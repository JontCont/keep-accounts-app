## 1. 交易設定控制項階層

- [x] 1.1 實作 Labeled Transaction Entry Control Hierarchy：遵循 Use labeled transaction type cards，將新增交易 Setup 的交易類型呈現為含 AppIcon 與可見文字的三個主要選擇卡；遵循 Use a labeled secondary payment mode control，將基本／分期呈現為有「付款方式」label 的次要切換且僅在新建支出顯示；遵循 Preserve control interfaces and behavior，保留 `aria-pressed`、收入鎖定與既有 state transition，以 `npx nx test web -- --run src/app/components/TransactionModal.spec.tsx` 及短行動 viewport 視覺檢查驗證。
- [x] 1.2 實作 Use content-fit modal without payment mode：收入與不計損益的新增交易 Setup 在付款方式不適用時，以內容高度收合 modal 且不超過動態 viewport；支出與 Details 維持原有固定、可捲動高度，以 `npx nx test web -- --run src/app/components/TransactionModal.spec.tsx` 與收入 Setup 的瀏覽器視覺檢查驗證。
