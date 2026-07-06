## Why

Users need a more intuitive and visual way to analyze their expenses. The current statistics tab only displays text-based numbers and progress bars, which does not provide quick insights into spending distribution and trends over time.

## What Changes

- Install `recharts` package to enable chart visualization in the web frontend.
- Update the "支出統計分析" tab in the web application to include a tab navigation for switching between "類別佔比" (Category Distribution Pie/Doughnut Chart) and "趨勢分析" (Daily/Monthly Expense Bar/Line Chart).
- Integrate Recharts `PieChart` and `BarChart`/`LineChart` components with customized color palettes.
- Keep the existing category progress bars list underneath the chart as a detailed lookup reference.

## Capabilities

### New Capabilities

- `expense-stats-chart`: Integrates Recharts to provide interactive category distribution pie/doughnut charts and daily/monthly expense trends on the statistics page, while maintaining the detailed progress bar lists for reference.

### Modified Capabilities

(none)

## Impact

- Affected specs: `expense-stats-chart`
- Affected code:
  - Modified:
    - `package.json`
    - `apps/web/src/app/app.tsx`
