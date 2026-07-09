## ADDED Requirements

### Requirement: Salary Allocation Source Card

The Dashboard Tab MUST render a salary allocation source card at the top of the account groups list. The card SHALL bind multiple income categories (configured in the Group Settings Modal via the existing `allocationCategories` list) and SHALL display the sum of the current month income transactions belonging to those bound categories as the "待分配總額" (total to allocate). The sum SHALL be formatted as a green amount prefixed with "+$".

#### Scenario: Source card sums bound-category income

- **WHEN** the Dashboard Tab is loaded
- **THEN** the source card SHALL display the sum of the current month income transactions whose category is in the bound `allocationCategories` list

##### Example: Summing multiple bound categories

- **GIVEN** bound categories are `['薪資收入', '獎金紅包']`
- **AND** the current month has income: 薪資收入 $45,000, 獎金紅包 $5,000, 其他收入 $10,000
- **WHEN** the source card renders
- **THEN** the displayed total to allocate SHALL be `+$50,000`
- **AND** the $10,000 其他收入 SHALL be excluded because it is not a bound category

---

### Requirement: Per-Group Planned Allocation Amount

Each account group card MUST display a planned allocation amount computed as `round(totalToAllocate * (targetRatio / 100))`. This planned amount SHALL be a purely visual overlay: rendering it SHALL NOT create any transaction and SHALL NOT change any account group balance. The subtext SHALL be labeled "計畫分配 {targetRatio}% (${plannedAmount})".

#### Scenario: Planned amount is target ratio applied to source total

- **WHEN** the Dashboard Tab calculates each group's planned allocation
- **THEN** the planned amount SHALL equal the source total multiplied by that group target ratio, rounded to the nearest integer
- **AND** no transaction SHALL be created and no account balance SHALL change

##### Example: 30/30/40 split of a single paycheck

- **GIVEN** the total to allocate is $45,000
- **AND** groups with target ratios: 日常開銷 30%, 投資理財 30%, 長期儲蓄 40%
- **WHEN** the group cards render
- **THEN** the planned allocation amounts SHALL be:
  | Group     | Target Ratio | Planned Allocation |
  | --------- | ------------ | ------------------ |
  | 日常開銷  | 30%          | $13,500            |
  | 投資理財  | 30%          | $13,500            |
  | 長期儲蓄  | 40%          | $18,000            |

---

### Requirement: Planned versus Actual Inflow Comparison

Each account group card MUST also display the actual inflow, computed as the sum of the current month income transactions whose category is a bound `allocationCategories` category AND whose `accountGroupId` is that group. The subtext SHALL be labeled "實際流入 {actualPct}% (${actualAmount})", where `actualPct` is `round(actualAmount / totalToAllocate * 100)`. This lets the user see the drift between the planned allocation and where paychecks were actually filed.

#### Scenario: Actual inflow reflects where the paycheck was filed

- **WHEN** the Dashboard Tab calculates each group actual inflow
- **THEN** the actual inflow SHALL sum only current month bound-category income filed under that group
- **AND** the actual inflow SHALL be computed independently of the planned allocation amount, so the two figures SHALL differ whenever the paycheck is not filed exactly per the target ratio

##### Example: Whole paycheck filed under one group

- **GIVEN** the total to allocate is $45,000
- **AND** the entire $45,000 薪資收入 paycheck is filed under 日常開銷
- **AND** groups with target ratios: 日常開銷 30%, 投資理財 30%, 長期儲蓄 40%
- **WHEN** the group cards render
- **THEN** the planned and actual figures SHALL be:
  | Group     | 計畫分配 | 實際流入   |
  | --------- | -------- | ---------- |
  | 日常開銷  | $13,500  | $45,000    |
  | 投資理財  | $13,500  | $0         |
  | 長期儲蓄  | $18,000  | $0         |
