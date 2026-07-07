## Context

Currently, the React application in `apps/web/src/app/app.tsx` stores transaction dates as a simple `YYYY-MM-DD` string in LocalStorage. This lacks hours/minutes details, preventing chronological ordering of transactions created on the same day. 

To improve tracking, we will change transaction dates to ISO 8601 datetime strings containing local offsets (e.g., `2026-07-07T19:30:00+08:00`). We will use Ionic's Datetime button and popup modal to allow users to select both date and time.

## Goals / Non-Goals

**Goals:**
- Store transaction dates as standard ISO 8601 datetime strings.
- Implement a popup Datetime selector (`IonDatetimeButton` and `IonModal`) in the transaction form.
- Display both date and time in the ledger and history pages.
- Ensure transactions are sorted chronologically by date and time.
- Update matching logic so today/monthly calculations continue working with datetime strings.

**Non-Goals:**
- Changing database or storage backend (staying on LocalStorage).
- Support for complex timezones conversions (we will store and display in local time).

## Decisions

### Decision: Use IonDatetimeButton and IonModal for Datetime Selection
- **Rationale**: Using Ionic React's popup datetime components provides a responsive and touch-friendly user experience on packaged mobile viewports.
- **Alternatives Considered**: Using standard HTML5 `<input type="datetime-local">` which renders differently and often poorly across iOS, Android, and desktop browsers.

### Decision: Keep Date Prefix for Grouping and Comparisons
- **Rationale**: Since calculations for daily totals and monthly filters rely on matching strings, extracting the date portion via `.slice(0, 10)` or `.startsWith()` is backward-compatible and prevents parsing overhead.
- **Alternatives Considered**: Instantiating full JavaScript `Date` objects for every transaction filter iteration, which degrades performance.

### Decision: Chronological Sort by Full Datetime String
- **Rationale**: ISO 8601 datetime strings naturally sort alphabetically. We can sort transactions chronologically using standard string comparison (`localeCompare`), which is robust and simple.
- **Alternatives Considered**: Converting to UNIX epoch timestamps (milliseconds) for sorting. This is unnecessary since alphabetical sorting on ISO 8601 strings is equivalent and clean.

## Implementation Contract

- **Behavior**:
  - The transaction entry modal renders an Ionic datetime button displaying the selected date and time. Clicking it displays a popup calendar and time wheel selector.
  - Adding or modifying a transaction saves the timestamp.
  - Transactions on the ledger and history views are sorted in descending order of their full date and time.
  - Existing transactions without time information are displayed and matched gracefully.
- **Interface / Data Shape**:
  - The `Transaction` interface's `date` property is updated to contain an ISO 8601 format string (e.g., `YYYY-MM-DDTHH:mm:ss.sssZ` or `YYYY-MM-DDTHH:mm`).
- **Failure Modes**:
  - If a transaction does not contain a `T` separator, it is treated as starting at `00:00:00` for comparison and sorting purposes.
- **Acceptance Criteria**:
  - Creation of a transaction records the selected date and time.
  - Today's expenses dashboard correctly aggregates transactions created at different times of the current day.
  - Transactions on the same day are displayed in the correct chronological order.
- **Scope Boundaries**:
  - **In Scope**:
    - Updating layout, forms, list displays, and comparison functions in `apps/web/src/app/app.tsx`.
  - **Out of Scope**:
    - Changes to layout components or configuration beyond the transaction date and time processing.

## Risks / Trade-offs

- **[Risk] Legacy transaction dates fail comparison** -> *Mitigation*: Ensure all queries comparing dates (e.g. `tx.date === todayStr` or `.startsWith()`) handle 10-char date prefixes gracefully (using `.substring(0, 10)`).
