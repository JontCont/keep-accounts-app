## 1. Dashboard period filtering

- [x] 1.1 Implement "Dashboard detail list follows the selected period" in `apps/web/src/app/components/DashboardTab.tsx` so the detail rows use the active Today/Month toggle; verify by manual review that "今日" shows only today's transactions and "本月" shows the full current month.
- [x] 1.2 Keep the dashboard summary values and detail list driven by the same period state so the two sections never disagree; verify with the existing period summary assertions in `apps/web/src/app/app.spec.tsx`.

## 2. Regression coverage

- [x] 2.1 Add or update a Vitest regression in `apps/web/src/app/app.spec.tsx` that proves the Today view excludes earlier days in the same month while the Month view includes them; verify with `vitest apps/web/src/app/app.spec.tsx`.
- [x] 2.2 Run the targeted Vitest file after the update and confirm the new dashboard period assertions pass; verify from the command output.
