## ADDED Requirements

### Requirement: Salary Source Account Group

The system SHALL provide a 當月薪資 account group flagged with `isSource: true`. This group SHALL be rendered first in the account groups list, SHALL be visually highlighted, and SHALL NOT be deletable. Salary income categories SHALL belong to this group. Exactly one source group SHALL exist. All non-source groups SHALL be deletable.

#### Scenario: Source group is protected and first

- **WHEN** the account groups list renders in edit mode
- **THEN** the 當月薪資 source group SHALL appear first with a highlight and no delete control
- **AND** every non-source group SHALL show a delete control

#### Scenario: Salary categories live under the source group

- **WHEN** the default groups are created
- **THEN** the salary income categories (e.g. 薪資收入) SHALL belong to 當月薪資 and SHALL NOT belong to 日常開銷

---

### Requirement: Virtual Pool Distribution

The system SHALL compute each non-source group's allocated income as `round(sourcePool * (targetRatio / 100))`, where `sourcePool` is the sum of the current month income transactions belonging to the source group. This distribution SHALL be virtual: it SHALL NOT create any transaction. Changing a target ratio SHALL immediately recompute the allocated amounts.

#### Scenario: Allocated amount equals pool times ratio without creating transactions

- **WHEN** the Dashboard computes each non-source group's allocation
- **THEN** the allocated amount SHALL equal the source pool multiplied by that group's target ratio, rounded to the nearest integer
- **AND** the total transaction count SHALL be unchanged

##### Example: 40/30/30 distribution of the source pool

- **GIVEN** the source pool (當月薪資 current-month income) is $45,000
- **AND** non-source groups with target ratios: 儲蓄資金 40%, 日常開銷 30%, 投資理財 30%
- **WHEN** the group cards render
- **THEN** the allocated amounts SHALL be:
  | Group     | Target Ratio | Allocated |
  | --------- | ------------ | --------- |
  | 儲蓄資金  | 40%          | $18,000   |
  | 日常開銷  | 30%          | $13,500   |
  | 投資理財  | 30%          | $13,500   |

#### Scenario: Empty pool yields zero allocations

- **WHEN** the source pool is $0
- **THEN** every non-source group's allocated amount SHALL be $0 and the cards SHALL render without error

---

### Requirement: Allocated versus Spent Card Display

Each non-source group card MUST display its allocated amount (分配額) and its current-month spending relative to that allocation (已用/餘額). The card SHALL NOT display a separate "實際流入" figure, because virtual distribution makes actual inflow identical to the allocated amount.

#### Scenario: Card shows allocated and spent

- **WHEN** a non-source group card renders
- **THEN** it SHALL show the allocated amount as 分配額
- **AND** it SHALL show the current-month expense for that group relative to the allocated amount

---

### Requirement: Non-Source Target Ratio Validation

When saving groups in the Group Settings Modal, the system SHALL validate that the sum of the `targetRatio` values of the non-source groups equals 100%. The source group SHALL be excluded from this sum. Saving SHALL be blocked while the non-source sum is not 100%.

#### Scenario: Validation ignores the source group

- **GIVEN** a source group with no target ratio and non-source groups with ratios 40, 30, 30
- **WHEN** the user saves groups in settings
- **THEN** the non-source sum SHALL be 100% and saving SHALL be allowed
- **WHEN** the user changes a non-source ratio so the non-source sum is not 100%
- **THEN** saving SHALL be blocked

---

### Requirement: Source Group Migration

On load, if no group has `isSource: true`, the system SHALL inject a 當月薪資 source group containing the salary income categories, remove those salary categories from 日常開銷, rename 長期儲蓄 to 儲蓄資金, and delete the persisted `keep_accounts_allocation_categories` key. Migration SHALL be idempotent and SHALL NOT delete existing user groups or transactions.

#### Scenario: Legacy data without a source group is migrated

- **GIVEN** stored groups 日常開銷/投資理財/長期儲蓄 with a persisted `keep_accounts_allocation_categories` key and no source group
- **WHEN** the app loads
- **THEN** a 當月薪資 source group SHALL be injected with the salary income categories
- **AND** 長期儲蓄 SHALL be renamed 儲蓄資金
- **AND** the `keep_accounts_allocation_categories` key SHALL be removed
- **AND** existing transactions SHALL be preserved
