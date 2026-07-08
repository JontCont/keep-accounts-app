## 1. Header Layout Refactoring in app.tsx

- [x] 1.1 Implement Tab-Specific Header Titles in `apps/web/src/app/app.tsx` to dynamically render the title based on the active tab state (`activeTab`). Verification: Switch between Dashboard, History, Stats, and Settings tabs in the dev browser and manually assert that titles change correctly (Dashboard -> "Keep Accounts", History -> "歷史交易明細", Stats -> "支出統計分析", Settings -> "系統設定").
- [x] 1.2 Implement Conditional Date Visibility in `apps/web/src/app/app.tsx` so the date/day widget on the right side of the header is only rendered when `activeTab === 'dashboard'` and hidden otherwise. Verification: Switch between Dashboard and other tabs in the dev browser and manually assert that the date widget is visible only on the Dashboard.

## 2. Redundant Inner Headers Cleanup

- [x] 2.1 Perform Removal of Redundant Sub-Tab Headers in `apps/web/src/app/components/HistoryTab.tsx` by deleting the `<h3>歷史交易明細</h3>` tag. Verification: View the History tab in the dev browser and manually assert that there is no duplicate page title.
- [x] 2.2 Perform Removal of Redundant Sub-Tab Headers in `apps/web/src/app/components/StatsTab.tsx` by deleting the `<h3>支出統計分析</h3>` tag. Verification: View the Stats tab in the dev browser and manually assert that there is no duplicate page title.
- [x] 2.3 Perform Removal of Redundant Sub-Tab Headers in `apps/web/src/app/app.tsx` by removing the `<h2>` page header inside the settings panel UI tab pane. Verification: View the Settings tab in the dev browser and manually assert that there is no duplicate settings/database title.
