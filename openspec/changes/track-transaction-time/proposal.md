## Why

Currently, transactions are saved with a date-only string (`YYYY-MM-DD`). This prevents tracking the exact time a transaction occurred, causes ordering issues for transactions made on the same day, and limits detailed chronology when reviewing history.

## What Changes

- Update the transaction date input in the transaction form to utilize Ionic's `<IonDatetimeButton>` and `<IonDatetime>` inside an `<IonModal>` as a popup datetime picker.
- Update the transaction data structure to store dates as standard ISO 8601 datetime strings (including local time offsets).
- Update statistics, today totals, and ledger grouping logic to correctly parse and match the date portion of the timestamp.
- Update the history list to display both date and time (e.g., `YYYY-MM-DD HH:mm`) and sort transactions chronologically by their full datetime value.

## Capabilities

### New Capabilities

- `transaction-datetime-tracking`: Introduce datetime pickers for transaction creation and editing, store transactions with ISO 8601 timestamps, and display and sort transactions by full datetime.

### Modified Capabilities

(none)

## Impact

- Affected specs: `transaction-datetime-tracking`
- Affected code:
  - Modified:
    - `apps/web/src/app/app.tsx`
