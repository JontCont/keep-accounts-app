## MODIFIED Requirements

### Requirement: Total Income to Allocate Block

The Dashboard Tab MUST display the total income to allocate as the sum of the current month income transactions belonging to the 當月薪資 source group. This total SHALL be presented on the highlighted source group card (the first card), formatted as a green amount prefixed with "+$". The allocation total SHALL NOT depend on a bound-category checklist.

#### Scenario: Source total derives from the source group

- **WHEN** the Dashboard Tab is loaded
- **THEN** the displayed total to allocate SHALL equal the sum of current month income transactions belonging to the 當月薪資 source group

##### Example: Source total from source-group income

- **GIVEN** the 當月薪資 source group has current-month income: 薪資收入 $45,000
- **AND** a 投資理財 group has current-month income: 投資收益 $3,000
- **WHEN** the source card renders
- **THEN** the total to allocate SHALL be `+$45,000` (only source-group income counts)

---

### Requirement: Account Group Target and Reached Dollar Amount Display

Each non-source account group card MUST display its allocated dollar amount (分配額), computed as `round(sourcePool * (targetRatio / 100))`, together with its current-month spending relative to that allocation (已用/餘額). The card SHALL NOT display separate target-percentage and actual-inflow-percentage figures.

#### Scenario: Card shows allocated and spent dollar amounts

- **WHEN** the Dashboard Tab calculates allocation statistics
- **THEN** each non-source card SHALL display 分配額 equal to the source pool times its target ratio
- **AND** SHALL display the current-month expense for that group relative to the allocated amount

##### Example: Allocated and spent display

- **GIVEN** the source pool is $45,000
- **AND** 日常開銷 has target ratio 30% and current-month expenses of $5,000
- **WHEN** the card renders
- **THEN** 分配額 SHALL be $13,500
- **AND** 已用 SHALL be $5,000 with 餘額 $8,500
