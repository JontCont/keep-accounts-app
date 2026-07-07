## 1. User Interface and State Management

- [x] 1.1 Implement Decision: Use IonDatetimeButton and IonModal for Datetime Selection and satisfy Requirement: Datetime Selection in Transaction Entry in `apps/web/src/app/app.tsx`.
  - **Behavior**: Replace the date input element `<input type="date">` in the transaction creation and editing modal with Ionic's popup datetime button `<IonDatetimeButton>` and calendar modal `<IonModal>` containing `<IonDatetime>` (presentation set to "date-time").
  - **Verification**: Run the web app, open the transaction modal, click the datetime button, select a date and time, and verify the chosen datetime is shown on the button.
- [x] 1.2 Update date state handling for transaction creation and editing.
  - **Behavior**: Modify date state handlers in `apps/web/src/app/app.tsx` to handle and store standard ISO 8601 offset strings (e.g. `YYYY-MM-DDTHH:mm`).
  - **Verification**: Create a new transaction in the modal and inspect the LocalStorage database to verify the `date` attribute of the transaction is stored with hour and minute details.

## 2. Filtering, Sorting, and Ledger Calculations

- [x] 2.1 Implement Decision: Keep Date Prefix for Grouping and Comparisons and satisfy Requirement: Date Comparison and Calculations compatibility in `apps/web/src/app/app.tsx`.
  - **Behavior**: Modify daily balance, monthly totals, budget alerts, and date group header calculation logic to match only the first 10 characters (the date portion) of transaction datetime strings.
  - **Verification**: Ensure the today/本月 balance updates and calculates correctly when adding multiple transactions at different times on the current day.
- [x] 2.2 Implement Decision: Chronological Sort by Full Datetime String and satisfy Requirement: Chronological Sorting in Ledger in `apps/web/src/app/app.tsx`.
  - **Behavior**: Update the transaction list rendering sorting logic to sort all ledger and history entries in descending alphabetical/chronological order of their full `date` property. Update the history view layout to display the transaction hour and minute alongside the date.
  - **Verification**: Add three transactions on the same day at different times (e.g. 10:00, 14:00, 18:00) and verify they are listed in correct reverse-chronological order with the time displayed next to the date.
