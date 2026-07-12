## ADDED Requirements

### Requirement: History data is provided by paginated DB query

The system SHALL provide History records through a paginated query interface with a page size of 50 records, ordered by descending transaction date. The UI SHALL request additional pages only when the user reaches the end of loaded content.

#### Scenario: Initial page returns at most 50 records

- **WHEN** the History view is opened
- **THEN** the first query response SHALL include at most 50 most recent records

##### Example: 120 records in storage

- **GIVEN** 120 persisted transactions ordered by date descending
- **WHEN** the first page is requested with page size 50
- **THEN** records 1 through 50 are returned

#### Scenario: Next page appends contiguous range

- **WHEN** the user triggers loading for the next page
- **THEN** the query SHALL return the next contiguous range in the same descending order

##### Example: second page request

- **GIVEN** records 1 through 50 are already rendered
- **WHEN** the second page is requested
- **THEN** records 51 through 100 are returned and appended

#### Scenario: Exhausted pages report no-more-data

- **WHEN** no additional rows remain after the current page
- **THEN** the query result SHALL indicate has-more=false
