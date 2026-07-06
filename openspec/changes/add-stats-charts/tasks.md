## 1. Setup and Dependencies

- [ ] 1.1 Install the `recharts` package in root `package.json` to satisfy the "Decision: Install Recharts as a frontend charting library". Verify by running `npm ls recharts` and ensuring the library is present in node_modules and resolves successfully.

## 2. Core Implementation

- [ ] 2.1 Implement the data mapping and grouping helpers in `apps/web/src/app/app.tsx` to prepare structured category and trend data arrays, fulfilling the "Decision: Render a PieChart for Category Distribution and a BarChart for Trend Analysis". Verify by verifying correct dataset structures via console logs or component test assertions.
- [ ] 2.2 Add navigation toggle states and UI controls for the "Requirement: View Switching and Category Details List", maintaining the list below per "Decision: Keep existing detail list under the charts". Verify by clicking the toggles in the browser to switch between the active views while ensuring the detailed list remains visible.
- [ ] 2.3 Render a Recharts `PieChart` component in `apps/web/src/app/app.tsx` to deliver the "Requirement: Interactive Category Distribution Doughnut Chart". Verify by manually confirming in the browser that the chart slices match the specified category colors and percentages.
- [ ] 2.4 Render a Recharts `BarChart` component in `apps/web/src/app/app.tsx` to deliver the "Requirement: Interactive Expense Trend Chart". Verify by rendering daily totals in ascending order and checking that dates hover with accurate tooltip amounts.
