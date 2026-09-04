## ADDED Requirements

### Requirement: Labeled Transaction Entry Control Hierarchy
The system SHALL present transaction type and payment mode as visually distinct, explicitly labeled controls in the new transaction Setup step. Transaction type SHALL provide visible text and an AppIcon for expense, income, and transfer, and SHALL use a type-specific selected state. Payment mode SHALL provide the visible label "付款方式" and SHALL only be rendered for new expense transactions.

#### Scenario: Selecting a transaction type

- **WHEN** a user opens a new transaction Setup step
- **THEN** the system displays the visible label "交易類型" with expense, income, and transfer selection cards that retain visible text, icons, and `aria-pressed` state.

#### Scenario: Viewing payment mode for a new expense

- **WHEN** the selected transaction type is expense in a new transaction Setup step
- **THEN** the system displays the visible label "付款方式" with basic and installment controls that retain visible text and `aria-pressed` state.

#### Scenario: Changing to income or transfer

- **WHEN** a user selects income or transfer in a new transaction Setup step
- **THEN** the system does not display the payment mode control, uses a content-fit modal that does not exceed the visual viewport, and retains the existing type selection behavior.
