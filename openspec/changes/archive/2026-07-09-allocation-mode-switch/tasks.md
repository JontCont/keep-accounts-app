## 1. Setup and Calculation Logic

- [ ] 1.1 Implement Decision 1: Persisted State for Allocation Categories inside `use-keep-accounts.ts` to manage the list of checked categories. Verification: Verify using automated tests that the default state is initialized and saved to localStorage.
- [ ] 1.2 Implement the Category-Bound Target Ratio Calculations requirement inside `DashboardTab.tsx` to compute allocation percentages and progress bars based only on the current month's income transactions belonging to the bound categories, keeping card values as cumulative balances. Verification: Run vitest test suite to confirm the mathematical accuracy of the actual percentages.

## 2. Group Settings UI and Switcher Removal

- [ ] 2.1 Implement the Allocation Source Category Binding requirement by rendering a checklist card in `GroupSettingsModal.tsx` containing all unique income categories with checkbox inputs, using Decision 2: Checklist UI in Group Settings Modal. Verification: Open the settings modal in browser, toggle checkboxes, and confirm the persisted state updates.
- [ ] 2.2 Update `DashboardTab.tsx` to remove the segmented switcher based on Decision 3: Simple Cumulative/Monthly Integration on Dashboard, ensuring progress bars render ratios based on bound categories. Verification: Start the application, view the dashboard, confirm no switcher is shown, and check that the progress bars match the configured bound categories.
