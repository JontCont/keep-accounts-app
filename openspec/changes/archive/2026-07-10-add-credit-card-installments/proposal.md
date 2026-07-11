## Why

Users who buy on a credit card in Taiwan almost always split large purchases into monthly installments (分期), yet the app can only record a single lump-sum expense. It also has no way to remind the user which installment is due this month, so a planned 12-month purchase silently disappears from the ledger after one entry.

## What Changes

- Add an **installment (分期)** configuration to the transaction detail form. A purchase entered as an installment expands into **N monthly expense transactions**, one per period, filed under the same category and account group the user already picks on the home page.
- Per-period amount is computed by **C1 input**: the user enters **total amount + number of periods**; each period = `floor(total / periods)` and the **last period absorbs the remainder** (Taiwan convention, e.g. $10,007 over 10 periods → nine × $1,000 + one × $1,007).
- Redesign `TransactionModal` into a **tabbed form**: 基本 (basic) / 分期 (installment). The installment tab holds the notification switch, total, period count, and a read-only per-period amount; the reminder message uses a fixed default (not user-editable).
- Add a **per-period payment reminder**: when the installment notification switch is on, schedule a **native local notification** on each period's payment date. Notifications are **native-app only** (iOS/Android via Capacitor); on the web platform the switch is hidden/disabled and no notification is scheduled.
- Add `@capacitor/local-notifications` as a dependency and a thin notification service that requests permission and schedules/cancels per-installment reminders.

## Non-Goals (optional)

- NOT modeling interest, fees, or bank-specific installment plans — the split is a plain even division with last-period remainder.
- NOT generating a virtual/on-the-fly split (the approach used by `salary-source-group`). Installments are real monthly debts, so each period is a concrete `Transaction` record.
- NOT web push or server-side scheduled notifications; reminders are local, on-device, native-only.
- NOT editing an individual generated period in isolation in this change (the group of period transactions is created together from the installment config).
- NOT a C2 flow (entering per-period amount to derive period count); input is C1 (total + periods) only.

## Capabilities

### New Capabilities

- `credit-card-installments`: Installment configuration on the transaction form (total + period count, C1), even division with last-period remainder, expansion into N dated monthly expense transactions under the chosen category/account group, and the tabbed `TransactionModal` (基本 / 分期).
- `installment-payment-notifications`: A per-period payment-date reminder driven by an on/off switch, scheduled as native local notifications with user-configurable message content, active on native platforms only and absent on web.

### Modified Capabilities

(none)

## Impact

- Affected specs: `credit-card-installments` (new), `installment-payment-notifications` (new)
- Affected code:
  - New: libs/shared/domain/src/lib/installments.ts
  - New: apps/web/src/app/services/notifications.ts
  - Modified: libs/shared/domain/src/lib/types.ts
  - Modified: apps/web/src/app/components/TransactionModal.tsx
  - Modified: libs/shared/state/src/lib/use-keep-accounts.ts
  - Modified: apps/web/src/app/app.tsx
  - Modified: apps/web/package.json
  - Tests: apps/web/src/app/app.spec.tsx, libs/shared/domain (installment expansion unit test)
- Dependencies: add `@capacitor/local-notifications`

