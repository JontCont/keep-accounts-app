## Context

The Keep Accounts App is a web application built with React 19. Currently, the "支出統計分析" (Expense Statistics Analysis) page displays numerical statistics and progress-bar based category lists. There is no charting library installed in the project. The user wants to replace or augment the progress bar list with interactive charts using Recharts.

## Goals / Non-Goals

**Goals:**

- Install the `recharts` charting library in the monorepo root package.json.
- Implement a switchable tab control on the statistics page to select between "類別佔比" (Category Distribution) and "趨勢分析" (Trend Analysis).
- Render an interactive Doughnut Chart (PieChart) representing category spending percentages.
- Render an interactive Bar Chart (BarChart) representing daily or monthly expense trends.
- Keep the existing category progress bars list underneath the charts as a detailed lookup reference.

**Non-Goals:**

- Implementing statistics charts for income transactions.
- Adding trend analysis to individual account group settings.
- Rebuilding the transaction storage system or adding backend APIs.

## Decisions

### Decision: Install Recharts as a frontend charting library
We will add `recharts` to the `dependencies` in the root `package.json`. Recharts is a declarative charting library built on React components, which integrates easily with React 19 and provides clean Tailwind/CSS styling capability.
*Alternatives considered:*
- Custom SVG charts: Hand-crafting SVG paths and math would avoid third-party packages, but building interactive tooltips and responsive layouts would take excessive code complexity.
- Chart.js with react-chartjs-2: Canvas-based rendering, which is less React-native and harder to style with CSS.

### Decision: Render a PieChart for Category Distribution and a BarChart for Trend Analysis
For category distribution, a Doughnut-style `PieChart` is highly visual and standard for financial apps. For the expense trend, a `BarChart` will be used to show aggregate spending per day/month. Both charts will display custom Recharts `Tooltip` components on hover.
*Alternatives considered:*
- LineChart or AreaChart for trends: While functional, a BarChart represents discrete daily/monthly aggregated transactions more clearly without implying continuous data.

### Decision: Keep existing detail list under the charts
We will keep the current category list with progress bars underneath the active chart view. This ensures the user has a precise tabular lookup of dollar values and percentages, combining visual appeal with quantitative precision.

## Implementation Contract

- **Behavior**:
  - The statistics tab shows the account group filter and overview statistics (total count, average amount) at the top.
  - A tab navigation control with "類別佔比" and "趨勢分析" is rendered.
  - Selecting "類別佔比" renders a doughnut chart where hover/focus displays a custom tooltip showing category details (emoji, name, amount, and percentage of total).
  - Selecting "趨勢分析" renders a bar chart showing chronological aggregate daily expense amounts. Hover/focus displays a tooltip showing date and total amount.
  - Below the active chart, the existing progress-bar list is rendered.
  - When no expense transactions exist, the charts are hidden, and the message "目前尚無支出資料可進行統計分析" is displayed.
- **Interface / Data Shape**:
  - Category chart data format: `Array<{ name: string, value: number, color: string, emoji: string }>`
  - Trend chart data format: `Array<{ date: string, amount: number }>` sorted chronologically.
- **Failure modes**:
  - If no transactions match the selected account group, the UI falls back gracefully to a non-chart state with the "no data" message, preventing rendering crashes.
- **Acceptance criteria**:
  - Recharts is installed successfully and the application builds without errors.
  - The statistics tab displays both chart options and toggles between them correctly.
  - Slices of the PieChart match the categories' colors (e.g. food is orange, transport is blue) and represent correct percentages.
  - The BarChart correctly sums multiple transactions that occur on the same day.
- **Scope boundaries**:
  - In-scope: Modifying `package.json` and updating statistics tab rendering in `apps/web/src/app/app.tsx`.
  - Out-of-scope: Adding pagination or date range filters to the statistics page (beyond the existing account group filters).

## Risks / Trade-offs

- **[Risk] React 19 Peer Dependency Warnings**: Recharts might complain about React 19 compatibility during installation.
  - *Mitigation*: Install `recharts` using `--legacy-peer-deps` or specify a compatible version.
