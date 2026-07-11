## ADDED Requirements

### Requirement: Installment configuration on the transaction form

The transaction detail form SHALL present a tabbed layout with two tabs: 基本 (basic) and 分期 (installment). The 基本 tab SHALL contain the existing description, amount, category, and date fields. The 分期 tab SHALL contain a total-amount input, a period-count input, a read-only per-period amount, and the payment-reminder switch. Entering a valid total and period count on the 分期 tab SHALL mark the transaction as an installment; leaving the 分期 fields empty and saving from the 基本 tab SHALL create exactly one transaction, identical to the current behavior.

#### Scenario: Basic save is unchanged when installment is off

- **WHEN** the user fills the 基本 tab and leaves installment off, then saves
- **THEN** the system SHALL create exactly one transaction under the selected category and account group with no installment fields set

#### Scenario: Installment tab derives the per-period amount

- **WHEN** the user enters a total amount and a period count on the 分期 tab
- **THEN** the read-only per-period amount SHALL display the base per-period value computed as the total divided by the period count, rounded down

### Requirement: Even installment division with last-period remainder

When installment is enabled, the system SHALL split the total into N period amounts where N is the period count. Periods 1 through N-1 SHALL each equal `floor(total / N)`, and period N SHALL equal `total - floor(total / N) * (N - 1)` so that the final period absorbs any remainder and the period amounts sum exactly to the total. The system SHALL reject a save when the period count is not an integer of at least 1 or when the total is not greater than zero, showing a validation message and creating no transactions.

#### Scenario: Last period absorbs the remainder

- **WHEN** an installment total does not divide evenly by the period count
- **THEN** every period except the last SHALL carry the base amount and the last period SHALL carry the base amount plus the remainder

##### Example: 10,007 over 10 periods

- **GIVEN** total = 10007 and periods = 10
- **WHEN** the installment is expanded
- **THEN** periods 1 through 9 SHALL each be 1000 and period 10 SHALL be 1007, summing to 10007

##### Example: validation boundaries

| total | periods | Expected |
| ----- | ------- | -------- |
| 12000 | 12 | twelve periods of 1000 |
| 10000 | 3 | 3333, 3333, 3334 |
| 0 | 12 | rejected: amount must be positive |
| 5000 | 0 | rejected: period count must be at least 1 |

### Requirement: Expansion into N dated monthly transactions

When installment is enabled and the form is saved, the system SHALL create N expense transactions, one per period, all filed under the category and account group selected for the transaction. Period k SHALL be dated by advancing the installment start date by k months. All N transactions SHALL share a common installment identifier, and each SHALL record its own period number (1 through N) and the total period count so the interface can label the period sequence.

#### Scenario: Saving a 12-period installment creates 12 transactions

- **WHEN** the user saves a 12-period installment under a chosen account group and category
- **THEN** the system SHALL create 12 expense transactions under that same group and category, dated one month apart, sharing one installment identifier, with the final period carrying the remainder

### Requirement: Not-yet-due periods excluded from realized balance

Because future-dated period transactions are created at save time but are not yet paid, the lifetime realized balance and any realized-total aggregation SHALL count only period transactions whose date is on or before the current date. Future-dated periods SHALL remain visible in the transaction history as upcoming entries.

#### Scenario: Future periods do not reduce realized balance early

- **WHEN** a multi-period installment is saved with periods dated in future months
- **THEN** the lifetime realized balance SHALL reflect only the periods dated on or before today
- **AND** the future-dated periods SHALL still appear in the transaction history

