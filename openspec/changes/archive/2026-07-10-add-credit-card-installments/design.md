## Context

The app models money as account groups (大項), each holding a `targetRatio` and bound categories. Spending is a flat `Transaction { id, description, amount, type, category, date, accountGroupId }` persisted to `localStorage` and aggregated on the fly (`getCurrentMonthExpenseForGroup`, lifetime balance sums, budget alerts). There is no installment concept and no notification system beyond browser `alert()` calls in `use-keep-accounts.ts` and `app.tsx`.

The product is a Capacitor app (native iOS/Android builds plus a web build). Native builds can schedule on-device notifications; the web build cannot and is not being shipped for this feature.

The prior change `salary-source-group` deliberately chose *virtual* (non-materialized) distribution. Installments are the opposite situation: each monthly period is a real debt the user actually pays, so periods are materialized as concrete transactions rather than computed on the fly.

## Goals / Non-Goals

**Goals:**

- Let a user record a credit-card purchase as an installment split across N months from the transaction detail form.
- Divide evenly with the Taiwan last-period-remainder convention.
- Keep installment periods as normal transactions so history, per-month totals, and budget logic need no installment-aware rewrite.
- Offer an on/off native reminder on each period's payment date, with user-editable message text, active on native platforms only.

**Non-Goals:**

- No interest, fees, or bank-specific plans.
- No virtual/on-the-fly split (periods are real records).
- No web/server push; reminders are on-device local notifications.
- No C2 input (per-period amount → period count); C1 only (total + periods).
- No isolated single-period editing flow in this change.

## Decisions

### Expand an installment into N real monthly transactions

A saved installment produces N `Transaction` records (`type: 'expense'`), one per period, filed under the same `category` and `accountGroupId` the user already selects on the home page. Period k (0-indexed) is dated by advancing the start date k months. A shared `installmentId` links the group, and each record stores `installmentPeriod` (1..N) and `installmentCount` (N) so the UI can label "第 3 期 / 共 12 期".

Alternative considered: one transaction with installment metadata expanded virtually at read time (the `salary-source-group` pattern). Rejected because every period-sensitive computation (monthly total, budget, history grouping, balance) would need to become installment-aware, whereas materialized records reuse all existing aggregation untouched.

### C1 input with even division and last-period remainder

The installment tab collects **total amount** and **period count**; the per-period amount is derived and shown read-only. Base per-period = `Math.floor(total / periods)`; periods 1..N-1 use the base amount and period N = `total - base * (periods - 1)`, so the last period absorbs the remainder of `total mod periods` (e.g. total 10,007 over 10 → nine × 1,000 + one × 1,007). A pure helper `expandInstallment(total, periods, startDate)` in the domain library returns the dated period amounts and owns this math so it is unit-testable in isolation.

Alternative considered: distribute the remainder across the first several periods (banker-style). Rejected — Taiwan card statements place the full remainder on the final period, and users reconcile against the statement.

### Materialize all periods upfront and exclude not-yet-due periods from realized balance

All N period transactions are written at save time (no background job, consistent with the offline localStorage model). Because future-dated periods are not yet paid, **lifetime realized balance and any "actual" aggregation MUST count only periods with `date <= today`**. Current-month and daily aggregations already filter by date window, so they are unaffected; the one place that changes is the lifetime balance sum, which gains a `date <= today` guard. Future periods still appear in History as scheduled/upcoming entries.

Alternative considered: materialize each period lazily when its month arrives. Rejected — with no backend or scheduler, a catch-up-on-open approach is more fragile than writing all records once and filtering by date.

### Tabbed TransactionModal (基本 / 分期)

`TransactionModal` becomes a two-tab form: **基本** keeps the existing description / amount / category / date fields; **分期** holds the total, period count, read-only per-period amount, and the payment-reminder switch. Entering a valid total and period count on the 分期 tab implies an installment (there is no separate on/off toggle); the reminder message (title/body) is pre-filled with a default and is editable once the reminder switch is on. When the 分期 fields are left empty, saving behaves exactly as today (a single transaction), so the basic path is unchanged.

Alternative considered: a separate installment screen. Rejected — the user explicitly wants installment configured inline on the detail form, associated through the group already chosen on the home page.

### Native-only local notifications via a thin notification service

A single `notifications` service in the web app wraps `@capacitor/local-notifications`: it detects platform (native vs web), requests permission on native, and schedules one local notification per future period payment date when the reminder switch is on, cancelling them if the installment is removed or the switch is turned off. On web the service is a no-op and the reminder switch is hidden/disabled. The service is the only seam that touches Capacitor; deleting it removes all scheduling behavior (it is not a pass-through).

Alternative considered: call the Capacitor plugin directly from `use-keep-accounts.ts`. Rejected — that couples state persistence to a native plugin and breaks the web build and tests, which run without Capacitor's native layer.

## Implementation Contract

**Behavior:**

- Entering a purchase with installment enabled (total + periods) and saving creates N monthly expense transactions under the chosen category/account group; period amounts equal the base amount except the final period, which carries the remainder.
- With the reminder switch on, on a native platform each future period's payment date has a scheduled local notification using the configured message; with the switch off, or on web, no notification is scheduled.
- Lifetime realized balance reflects only periods whose date is on or before today; future periods are visible in History but do not reduce realized balance early.
- With installment disabled, saving produces exactly one transaction as it does today.

**Interface / data shape:**

- `Transaction` gains optional fields: `installmentId?: string`, `installmentPeriod?: number`, `installmentCount?: number`.
- A notification/installment config shape carries: `remindOnDueDate: boolean`, `notificationTitle: string`, `notificationBody: string` (used at schedule time; persistence of the raw config is on the first period record or a parallel structure).
- `expandInstallment(total: number, periods: number, startDate: string): { date: string; amount: number; period: number }[]` — pure, in the domain library.
- `notifications` service exposes at least `requestPermission(): Promise<boolean>`, `scheduleInstallmentReminders(installmentId, periods, message): Promise<void>`, `cancelInstallmentReminders(installmentId): Promise<void>`; all are no-ops on web.

**Failure modes:**

- `periods < 1`, non-integer periods, or `total <= 0` are rejected with a validation alert and no records are written (mirrors existing `saveTransaction` validation style).
- If native notification permission is denied, transactions are still created; scheduling is skipped silently (no reminder), and the switch reflects the unavailable state.

**Acceptance criteria:**

- A domain unit test asserts `expandInstallment(12912, 12, startDate)` yields eleven 1,000 periods and a final 1,912 period on correctly advancing month dates summing to 12,912.
- An app test asserts saving a 12-period installment creates 12 transactions under the selected group/category with the last period carrying the remainder.
- An app test asserts lifetime realized balance excludes future-dated periods (only `date <= today` counted).
- Manual: on a native build with the switch on, a notification is scheduled per future period; on web the reminder switch is absent.

**Scope boundaries:**

- In scope: installment expansion + math, tabbed form, native reminder scheduling/cancellation, realized-balance date guard, new dependency.
- Out of scope: interest/fees, editing a single period in isolation, web notifications, C2 input mode, migrating any historical data (no existing installments exist).

## Risks / Trade-offs

- [Risk] Materializing future periods could distort lifetime balance if the `date <= today` guard is missed → Mitigation: add the guard in the lifetime balance sum and cover it with the realized-balance test.
- [Risk] Native notification permission denial leaves the user without reminders → Mitigation: never block transaction creation on permission; skip scheduling silently and reflect the switch state.
- [Risk] Capacitor plugin imports breaking the web build/tests → Mitigation: isolate all plugin access behind the platform-guarded `notifications` service that no-ops on web.
- [Trade-off] Writing all N records upfront inflates transaction count for long plans, but keeps every existing aggregation installment-agnostic — an acceptable exchange for an offline localStorage app.

