## Context

現有 `AccountGroup` 雖以帳戶命名，實際承擔薪資分配來源、預算用途大項與分類容器；`Transaction.accountGroupId` 因此回答的是「這筆錢屬於哪個用途」，不是「錢從哪裡來或到哪裡去」。`transfer` 目前也只有單一 `accountGroupId` 與「不計損益」分類，無法表達兩個金融帳戶之間的資金移動。

這次變更跨越 domain 型別與計算、state 操作、localStorage/SQLite 持久化及 React 交易輸入介面。既有資料必須在沒有金融帳戶參照的情況下繼續可讀，且不得因遷移而被推測分派至任一帳戶。

## Goals / Non-Goals

**Goals:**

- 將分配群組與銀行帳戶、信用卡、現金等金融帳戶拆成正交維度。
- 讓新收入與支出明確指定一個金融帳戶，讓新轉帳明確指定不同的來源與目的帳戶。
- 從起始金額與交易紀錄一致地衍生資產帳戶餘額及信用卡未繳／溢繳金額。
- 保持既有交易、備份與本機資料可讀，並讓缺少帳戶的舊交易可被補登。
- 沿用既有 state 到 persistence 路徑，不增加只轉送資料的中介層。

**Non-Goals:**

- 不串接銀行 Open API、自動匯入帳單或自動對帳。
- 不處理信用卡結帳日、繳款截止日、循環利息、回饋或信用額度。
- 不改變現有分期列的產生日期與每期金額；各期只在既有交易日期影響帳戶金額。
- 不把舊交易自動推測至特定金融帳戶。
- 不建立使用者可自訂的金融帳戶群組層級；畫面群組由帳戶類型固定衍生。

## Decisions

### 分配群組與金融帳戶維持正交

`AccountGroup` 保留現有分配、預算與分類責任；新增 `FinancialAccount` 表示實際持有資金或負債的工具。收入／支出同時保留 `accountGroupId` 與金融帳戶參照，報表及預算只讀分配群組，帳戶餘額只讀金融帳戶參照。

替代方案是把「銀行帳戶」新增為 `AccountGroup`。此方案會迫使交易在「日常開銷」與「國泰銀行」二選一，破壞現有預算統計，因此不採用。

### 以帳戶類型衍生固定群組，不持久化第二層群組

`FinancialAccount.type` 使用 `bank | credit-card | cash`。帳戶管理介面依類型顯示「銀行帳戶」「信用卡」「現金」三個群組，每個群組底下可有零至多個帳戶。群組只有呈現與篩選責任，不另存 `FinancialAccountGroup`。

替代方案是持久化可編輯群組；目前沒有自訂群組規則或跨類型群組需求，新增該實體只會成為無行為的包裝層。

### 交易使用明確帳戶參照

新增資料形狀：

```ts
type FinancialAccountType = 'bank' | 'credit-card' | 'cash';

interface FinancialAccount {
  id: string;
  name: string;
  type: FinancialAccountType;
  openingAmount: number;
  isArchived?: boolean;
}

interface Transaction {
  financialAccountId?: string;
  transferSourceFinancialAccountId?: string;
  transferDestinationFinancialAccountId?: string;
}
```

`openingAmount` 對銀行／現金代表起始可用餘額，對信用卡代表起始未繳金額。新收入與支出必須有 `financialAccountId`；新轉帳必須有兩個不同的來源／目的參照，且不使用分配群組或分類參與統計。既有無參照交易保持合法。分期產生的每一期交易複製同一 `financialAccountId`。

替代方案是以單一 `financialAccountId` 配合交易正負號推測轉帳對手；這無法原子表示雙邊移轉，也不利查詢，故不採用。

### 餘額由起始金額與交易重播衍生

不持久化可漂移的目前餘額。計算器依日期及穩定 ID 排序重播交易：

- 銀行／現金：起始金額 + 收入 - 支出 - 轉出 + 轉入。
- 信用卡：起始未繳 + 支出 - 收入 - 轉入繳款 + 轉出。

信用卡結果大於或等於零時顯示未繳金額；小於零時顯示其絕對值為溢繳金額。交易編輯或刪除後重新衍生，不寫入補償交易。查詢層可聚合原生 SQLite 全量資料；React 中的 200 筆近期快取不得作為原生帳戶餘額的資料來源。

替代方案是每次寫交易同步修改餘額欄位；部分寫入失敗會造成交易與餘額不一致，故不採用。

### 移轉採單筆交易與原子持久化

一筆 `transfer` 同時保存來源與目的金融帳戶。domain 計算一次套用雙方變化，SQLite 以單列寫入，因此不存在只寫入轉出或只寫入轉入的中間狀態。轉帳來源與目的必須不同；所有有效帳戶類型均可互轉，包含銀行至信用卡的卡費繳納。

替代方案是建立兩筆互相連結的交易；刪除、編輯及部分寫入需要額外一致性機制，故不採用。

### 舊資料以未指定金融帳戶相容

`KeepAccountsSnapshot` 新增 `financialAccounts`，讀取缺少此欄位的 localStorage、備份或舊 SQLite schema 時一律正規化為空陣列；舊交易的新增欄位維持 `undefined`／`NULL`。只有使用者編輯並儲存該筆交易時才要求補選帳戶。

SQLite 增加 `keep_accounts_financial_accounts` 表及三個 nullable 交易帳戶欄位，啟動時以可重複執行的 schema migration 檢查欄位後新增。state 繼續直接使用既有 persistence API，避免堆疊 adapter。

替代方案是依分配群組批次猜測金融帳戶；這會製造錯誤餘額且無法復原原始事實，故不採用。

## Implementation Contract

**Observable behavior**

- 使用者可建立、編輯及封存銀行帳戶、信用卡與現金帳戶；畫面依三種類型分組。
- 已被交易參照的帳戶不得硬刪除，只能封存；未被參照的帳戶可刪除。封存帳戶不出現在新交易選單，但既有交易仍顯示其名稱並可在編輯時保留或改選。
- 建立新收入或支出時，沒有可用帳戶就顯示建立帳戶入口且不可送出；有可用帳戶時必須選取一個。
- 建立轉帳時顯示來源與目的帳戶，兩者相同、缺少任一方或金額非正數時不得儲存，並在表單上顯示原因。
- 一般／分期控制改稱「付款型態」，其選項為「一次付清」與「分期」；「金融帳戶」專指實際銀行、信用卡或現金。
- 歷史明細顯示收入／支出的金融帳戶名稱；轉帳顯示「來源 → 目的」。

**Interface and persistence**

- Domain 匯出 `FinancialAccountType`、`FinancialAccount`、帳戶金額摘要型別及純函式帳戶重播計算器。
- `Transaction` 增加 `financialAccountId?`、`transferSourceFinancialAccountId?`、`transferDestinationFinancialAccountId?`。
- state 提供金融帳戶 CRUD、封存、交易保存驗證與帳戶摘要查詢；web 與 native 模式回傳相同結果。
- localStorage 使用獨立金融帳戶 key；`KeepAccountsSnapshot` 備份／還原包含 `financialAccounts`。
- SQLite 金融帳戶表保存 id、name、type、opening_amount、is_archived；交易表的三個帳戶欄位允許 `NULL`。

**Failure modes**

- 空白帳戶名稱、非有限起始金額、未知帳戶類型及重複來源／目的由 domain/state 驗證拒絕，UI 顯示明確訊息且不改變 state 或 persistence。
- 參照不存在帳戶的舊資料不造成載入失敗；明細顯示「未指定帳戶」，該交易不影響任何帳戶摘要。
- SQLite migration 或寫入失敗沿用既有 persistence 錯誤處理，不以只更新 React state 偽裝成功；不得留下半筆轉帳。

**Acceptance criteria**

- Domain 單元測試以國泰銀行起始 20,000、台新信用卡起始 0 驗證：台新刷餐飲 500 後銀行為 20,000、信用卡未繳為 500；國泰轉帳 500 至台新後銀行為 19,500、信用卡未繳為 0，損益支出仍為 500。
- Domain 測試涵蓋銀行／現金收入與支出、信用卡收入與支出、一般帳戶互轉、信用卡溢繳、分期帳戶參照及未指定／不存在帳戶。
- State 與 SQLite 測試驗證 CRUD、封存限制、schema migration、snapshot round-trip、交易新增／編輯／刪除後摘要一致。
- React 單元測試驗證各交易類型的欄位可見性、必填錯誤與歷史帳戶標籤。
- Playwright 驗證建立銀行及信用卡帳戶、刷卡消費、銀行繳卡費與重新載入後的摘要及支出不重複計算。

**Scope boundaries**

- In scope：金融帳戶 CRUD／封存、交易帳戶參照、雙邊轉帳、衍生摘要、持久化、備份相容、交易輸入與歷史顯示。
- Out of scope：銀行串接、帳單週期、利息／回饋／額度、對帳、舊交易自動分類、自訂金融帳戶群組。

## Risks / Trade-offs

- [既有命名把 `AccountGroup` 稱為帳戶，容易與金融帳戶混淆] → 新 UI 使用「分配群組」與「金融帳戶」，內部型別暫不做破壞性改名。
- [原生模式只快取近期 200 筆交易] → 原生餘額由 SQLite 聚合全量資料，web 模式才從完整 localStorage snapshot 計算。
- [封存帳戶仍須在舊交易中顯示] → 查詢與顯示以完整帳戶集合解析名稱，新交易選項才過濾封存項目。
- [信用卡金額可能因退款或溢繳成為負數] → 摘要以未繳／溢繳兩種標籤呈現，不截斷為零。

## Migration Plan

1. 先部署向後相容的 domain 型別與純計算器。
2. 擴充 localStorage snapshot 與 SQLite schema／mapping，遷移時保留所有舊交易為 nullable 帳戶參照。
3. 接上 state CRUD、驗證及原生全量摘要查詢。
4. 加入帳戶管理、交易輸入及歷史顯示，最後啟用新交易必選帳戶規則。
5. 回滾時可停用新 UI 與寫入；新增資料表及 nullable 欄位保留不刪除，舊版仍可忽略未知 snapshot 欄位及 SQLite 欄位。
