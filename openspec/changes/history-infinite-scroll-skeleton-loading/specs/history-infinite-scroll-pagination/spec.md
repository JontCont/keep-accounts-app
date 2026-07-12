## ADDED Requirements

### Requirement: History list paginates in fixed 50-record pages

The system SHALL render History records incrementally using a fixed page size of 50 records. On first entry to the History tab, the system SHALL show at most the first 50 records sorted by descending transaction date. When the user reaches the end of the currently rendered list, the system SHALL append the next contiguous 50 records if available.

#### Scenario: Initial History render loads first page only

- **WHEN** the user opens the History tab
- **THEN** the system renders at most 50 records from the newest transactions

##### Example: 120 transactions available

- **GIVEN** 120 transactions sorted by descending date
- **WHEN** the History tab is opened
- **THEN** records 1-50 are rendered and records 51-120 are not yet rendered

#### Scenario: Reaching list end appends next page

- **WHEN** the user scrolls to the end of a 50-record loaded page and more records exist
- **THEN** the system appends the next 50 records without removing already rendered records

##### Example: Second page append

- **GIVEN** 120 total transactions and records 1-50 currently rendered
- **WHEN** the user reaches list end
- **THEN** records 1-100 are rendered in descending date order

#### Scenario: No concurrent page append while loading

- **WHEN** the user triggers list-end loading repeatedly while a page fetch is already in progress
- **THEN** the system processes only one append operation for that in-flight interval

#### Scenario: End-of-list stops further loading

- **WHEN** all available transactions have been rendered
- **THEN** the system SHALL stop requesting additional pages
