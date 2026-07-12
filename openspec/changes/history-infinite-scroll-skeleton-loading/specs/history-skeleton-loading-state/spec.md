## ADDED Requirements

### Requirement: History loading state uses animated IonSkeletonText placeholders

The system SHALL display animated `IonSkeletonText` placeholders when the History tab is loading an additional page. Skeleton placeholders SHALL mimic transaction-card layout and SHALL be visible only during active page loading.

#### Scenario: Skeleton placeholders appear during next-page load

- **WHEN** the user reaches list end and the next page load starts
- **THEN** the system displays animated `IonSkeletonText` placeholders in the list area until data is appended

#### Scenario: Skeleton placeholders are removed after successful append

- **WHEN** the next page load completes successfully
- **THEN** the system removes skeleton placeholders and displays the newly appended records

#### Scenario: Skeleton placeholders are removed after load failure

- **WHEN** the next page load fails
- **THEN** the system removes skeleton placeholders and keeps already rendered records visible

#### Scenario: End-of-list does not show loading skeleton

- **WHEN** no additional records are available
- **THEN** the system does not display loading skeleton placeholders for further scroll events
