## Problem

首頁的「今日 / 本月」切換只影響上方摘要數字，下面的記帳明細仍固定只顯示今天的資料。使用者在選擇「本月」時，會看到本月金額，但明細卻只剩今天的紀錄，畫面前後不一致。

## Root Cause

Dashboard 明細清單的資料來源目前直接以今天日期做硬編碼篩選，沒有共用上方 period 切換的條件。

## Proposed Solution

讓 Dashboard 的 period 狀態同時控制摘要與明細清單：
- 選「今日」時，明細只顯示今天的交易
- 選「本月」時，明細顯示當月全部交易
- 保持目前「本月」的定義為曆月，不改成最近 30 天

## Non-Goals

- 不修改 History 頁面的篩選與分組行為
- 不改交易資料結構或日期儲存格式
- 不變更「本月」的定義為 rolling 30 days

## Success Criteria

- 切到「今日」時，首頁明細只出現今天的交易
- 切到「本月」時，首頁明細出現當月所有交易
- 上方摘要與下方明細使用同一個 period 狀態，不會再出現今天 / 本月不一致
- 現有的 period 金額統計仍保持正確

## Impact

- Affected code:
  - Modified: `apps/web/src/app/components/DashboardTab.tsx`
  - Modified: `apps/web/src/app/app.spec.tsx`
