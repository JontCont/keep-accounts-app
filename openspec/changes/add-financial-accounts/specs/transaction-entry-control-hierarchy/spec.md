## MODIFIED Requirements

### Requirement: Labeled Transaction Entry Control Hierarchy
The system SHALL present transaction type, payment plan, allocation, and financial-account controls as visually distinct and explicitly labeled controls in the new transaction flow. Transaction type SHALL provide visible text and an AppIcon for expense, income, and transfer, SHALL label transfer as "轉帳", and SHALL use a type-specific selected state. Payment plan SHALL use the visible label "付款型態", SHALL provide "一次付清" and "分期" controls, and SHALL only be rendered for new expense transactions. The financial-account control SHALL use the visible label "金融帳戶" and SHALL remain distinct from allocation-group and category controls.

#### Scenario: Selecting a transaction type

- **WHEN** a user opens a new transaction Setup step
- **THEN** the system displays the visible label "交易類型" with expense, income, and transfer selection cards that retain visible text, icons, and `aria-pressed` state

#### Scenario: Viewing payment plan for a new expense

- **WHEN** the selected transaction type is expense in a new transaction Setup step
- **THEN** the system displays the visible label "付款型態" with "一次付清" and "分期" controls that retain visible text and `aria-pressed` state

#### Scenario: Entering an income or expense

- **WHEN** a user proceeds to the details of a new income or expense
- **THEN** the system displays separate allocation-group, category, and "金融帳戶" controls and requires an active financial account before submission

#### Scenario: Entering a transfer

- **WHEN** a user selects transfer in a new transaction flow
- **THEN** the system displays source and destination financial-account controls, omits allocation-group and category controls, and does not display the payment-plan control

#### Scenario: Changing to income

- **WHEN** a user selects income in a new transaction Setup step
- **THEN** the system does not display the payment-plan control, uses a content-fit modal that does not exceed the visual viewport, and retains the existing type selection behavior
