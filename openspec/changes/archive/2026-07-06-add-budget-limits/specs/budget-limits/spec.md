## ADDED Requirements

### Requirement: Budget limit settings input
The system SHALL provide a numeric input field in the account group editor interface to configure a monthly budget limit. The budget limit MUST be a positive integer or zero (representing no budget set). The configured budget limit SHALL be saved to the account group state and persisted in local storage.

#### Scenario: Save a valid budget limit
- **WHEN** the user inputs a value of 1000 in the monthly budget field and saves the account group
- **THEN** the system SHALL save 1000 as the monthly budget for the account group and persist it to local storage

#### Scenario: Clear or unset a budget limit
- **WHEN** the user clears the monthly budget input field or sets it to zero and saves the account group
- **THEN** the system SHALL store the budget limit as undefined or zero, indicating no budget is configured

##### Example: Clearing budget limit
- **GIVEN** an account group has an existing budget of 1000
- **WHEN** the user inputs 0 in the monthly budget field and saves
- **THEN** the system SHALL store the budget as 0 (no budget set)

### Requirement: Budget status and progress visualization
For any account group with a budget limit greater than zero, the dashboard SHALL display the current month's total expense, the configured budget limit, the percentage of budget consumed, and a progress bar representing the consumption. The system SHALL calculate the current month's total expense by summing the amounts of all expense transactions in the current month for the associated account group.

#### Scenario: Display budget info when budget is configured
- **WHEN** the user views the dashboard and an account group has a budget limit of 1000 and total current month expenses of 600
- **THEN** the system SHALL display that 60% of the budget ($600 / $1000) has been consumed, and render a progress bar reflecting 60% completion

##### Example: Budget progress percentage calculation
| Total Current Month Expenses | Budget Limit | Expected Percentage | Notes |
| ---------------------------- | ------------ | ------------------- | ----- |
| 600                          | 1000         | 60%                 | Normal progress |
| 1200                         | 1000         | 120%                | Over budget |
| 0                            | 500          | 0%                  | No spending yet |

#### Scenario: Hide budget info when no budget is configured
- **WHEN** the user views the dashboard and an account group has no budget limit configured (or set to zero)
- **THEN** the system SHALL NOT display any budget limit progress bar or budget status text for that account group

##### Example: No budget progress bar shown
- **GIVEN** an account group has budget set to 0 and current monthly expenses of 300
- **WHEN** the user views the dashboard
- **THEN** the system SHALL NOT render progress bar elements for this group

### Requirement: Budget warning indicators
The system SHALL visually differentiate the budget status and progress bar based on the percentage of budget consumed:
- Green: Less than 80% consumed.
- Yellow (Warning): Between 80% and 99% consumed.
- Red (Danger): 100% or more consumed.
In addition, if a transaction is added or updated such that the total expenses for the current month exceed the configured budget limit, the system SHALL display a warning dialog or alert notification.

#### Scenario: Differentiate budget progress color based on consumption threshold
- **WHEN** the user views the dashboard
- **THEN** the system SHALL render the progress bar using the color status corresponding to the consumption percentage

##### Example: Color mapping for budget consumption
| Consumption Percentage | Expected Color Style | Notes |
| ---------------------- | -------------------- | ----- |
| 75%                    | Green                | Under warning threshold |
| 85%                    | Yellow               | Within warning range |
| 100%                   | Red                  | Budget fully exhausted |
| 120%                   | Red                  | Budget exceeded |

#### Scenario: Display warning alert when transaction exceeds budget
- **WHEN** a user adds a transaction of $500 to an account group with a budget limit of $1000 and prior current month expenses of $600
- **THEN** the system SHALL display a warning alert indicating that the budget of $1000 has been exceeded by $100
