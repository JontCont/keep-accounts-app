## ADDED Requirements

### Requirement: Stats data is provided by DB aggregation queries

The system SHALL compute Stats totals, category buckets, and daily trend data through query-store aggregation against persisted transactions, scoped by selected account-group filters.

#### Scenario: Category summary is aggregated by query scope

- **WHEN** the user opens Stats with a selected group scope
- **THEN** category totals SHALL be returned from aggregation query results for that scope

#### Scenario: Daily trend is aggregated by date bucket

- **WHEN** the user views trend data in Stats
- **THEN** daily totals SHALL be returned as date buckets sorted in ascending date order

#### Scenario: Empty scope returns empty aggregates

- **WHEN** no expense transactions match the selected scope
- **THEN** the aggregate response SHALL return zero totals and empty category/trend lists
