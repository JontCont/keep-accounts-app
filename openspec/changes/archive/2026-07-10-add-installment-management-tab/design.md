## Context

This change separates installment management from ordinary transaction browsing. The current history and dashboard views already hide installment edit controls in flat lists, but installment transactions are still presented in the same mixed stream as normal transactions. The product now needs a dedicated installment view that treats a grouped installment as the user-facing unit for management.

The existing data model already supports grouping through `installmentId`, `installmentPeriod`, and `installmentCount`. No new storage layer is required for this change.

## Goals / Non-Goals

**Goals:**

- Add a dedicated 分期 history filter that groups installment transactions by `installmentId`.
- Keep 全部 / 收入 / 支出 as flat, read-only transaction lists for installment rows.
- Provide installment-specific management actions from the grouped installment view.
- Keep the solution within the current transaction model and state hook.

**Non-Goals:**

- Do not redesign the base transaction creation flow.
- Do not introduce a new database table, file format, or storage adapter.
- Do not generalize installment grouping into an arbitrary multi-level grouping system.
- Do not re-enable installment editing from the flat transaction filters.

## Decisions

### History navigation and flat-list restrictions

Use a fourth history filter labeled 分期 instead of overloading 全部 / 收入 / 支出 with installment management concerns. This keeps ordinary browsing simple and reserves the mixed lists for read-only viewing.

**Alternatives considered:**
- Keep installments in 全部 / 收入 / 支出 and add special inline actions there. Rejected because the same row would need to serve two conflicting purposes: ordinary browsing and grouped installment management.
- Add a separate top-level page. Rejected because the history page already owns the browsing surface and the new behavior is a filter-level concern, not a new navigation area.

### Installment group view and actions

Treat `installmentId` as the grouping key and render one installment card per group in the 分期 filter. The grouped view is the only place where installment-specific operations live.

**Alternatives considered:**
- Introduce a new installment group entity in storage. Rejected because the current transaction model already contains the fields needed to derive the group.
- Keep editing and deletion on each individual installment row. Rejected because that keeps the complexity spread across flat lists instead of concentrating it where it belongs.

## Implementation Contract

The change SHALL produce the following observable behavior:

- The history navigation SHALL expose four filters: 全部, 收入, 支出, and 分期.
- When the user views an installment transaction in 全部, 收入, or 支出, the row SHALL be read-only and SHALL NOT expose edit or delete actions for that installment transaction.
- The row SHALL still indicate that the transaction belongs to a分期 group so the user can identify it.
- The 分期 filter SHALL group transactions by `installmentId` and present each group as one management unit.
- Each installment group SHALL surface the installment description and installment progress.
- The grouped view SHALL support installment-specific management actions: inspect the group, delete one period, delete the whole group, and settle the remaining balance early.
- These installment-specific actions SHALL be available from the grouped installment view, not from the flat history filters.

Acceptance criteria:

- `npx nx test @keep-accounts-app/web` passes.
- Browser verification shows four history filters.
- Browser verification shows installment rows in flat filters without edit/delete actions.
- Browser verification shows one grouped card per `installmentId` in 分期.
- Browser verification shows installment management actions only in the grouped view.

Scope boundaries:

- In scope: history filter tabs, flat-list visibility rules, grouped installment rendering, installment group actions, and the state logic needed to support those actions.
- Out of scope: new storage abstractions, changes to the installment expansion algorithm, and reworking unrelated dashboard behavior beyond the read-only installment rule.

## Risks / Trade-offs

[Risk] Group actions can become complex if partial deletion needs to renumber remaining periods → Mitigation: keep the data model derived from existing transaction fields and constrain all edits to the group-management view.

[Risk] Flat list badges can clutter the history page if styled too prominently → Mitigation: keep the installment indicator compact and visually secondary.

[Risk] The change spans several UI surfaces and tests → Mitigation: keep the grouped installment behavior localized to the history view and the state hook.
