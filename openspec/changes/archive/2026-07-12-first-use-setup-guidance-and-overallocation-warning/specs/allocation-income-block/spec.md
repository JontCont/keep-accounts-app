## ADDED Requirements

### Requirement: Allocation Display Uses Stored Ratios Without Save Lock Dependency
The Dashboard allocation block SHALL compute target amounts from current-month source-pool income and each stored non-source target ratio, independent of any strict sum-equals-100 save gate.

#### Scenario: Display allocation with under-allocation total
- **WHEN** non-source target ratios sum to 90 and the dashboard renders allocation cards
- **THEN** target amounts SHALL be computed directly from each stored ratio and no forced normalization SHALL be applied

##### Example: Under-allocation display values
- **GIVEN** source-pool income is 50,000 and ratios are 40, 30, and 20
- **WHEN** target amounts are rendered
- **THEN** displayed target amounts SHALL be 20,000, 15,000, and 10,000 respectively

#### Scenario: Display allocation with over-allocation total
- **WHEN** non-source target ratios sum to 110 and the dashboard renders allocation cards
- **THEN** target amounts SHALL be computed directly from stored ratios and SHALL remain visible as entered ratios imply

##### Example: Over-allocation display values
- **GIVEN** source-pool income is 50,000 and ratios are 50, 35, and 25
- **WHEN** target amounts are rendered
- **THEN** displayed target amounts SHALL be 25,000, 17,500, and 12,500 respectively
