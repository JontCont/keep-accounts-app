## Context

On the Dashboard tab (`apps/web/src/app/components/DashboardTab.tsx`), the account group cards ("資金大項帳戶") display account balances using `getGroupBalance(groupId)`, which calculates the cumulative lifetime income minus lifetime expense for that group across all history.
Because income transactions are assigned to the source income group ("當月薪資"), sub-account groups (e.g. "日常開銷" and "儲蓄資金") do not receive direct income transactions. Consequently, as expenses and installment entries accumulate over past months, their lifetime balance becomes heavily negative (`$-19,256`, `$-139,286`).
The overall asset header ("目前總餘額") correctly reflects net wealth across all accounts, but account group cards require a current month budgeting perspective.

## Goals / Non-Goals

**Goals:**
- Update account group card display metrics on DashboardTab to calculate and display current month budget allocation, current month expense usage, and current month remaining balance.
- Ensure that historical expenses and past installment entries do not pollute current month account group card balances.
- Maintain overall lifetime total asset balance calculation ("目前總餘額") intact.

**Non-Goals:**
- Altering transaction storage schema or historical ledger data.
- Introducing multi-account bank transfers or modifying the total net balance logic in the top header.

## Decisions

### 1. Shift Account Group Card Display to Current Month Budget and Expense Metrics

- **Decision**: On each non-source account group card, render:
  - Monthly Allocation Budget: `sourcePool * (targetRatio / 100)`
  - Monthly Used Expense: `getGroupMonthlyUsed(groupId)`
  - Monthly Remaining Balance: `Monthly Allocation Budget - Monthly Used Expense`
- **Rationale**: Displaying monthly remaining balance aligns with user expectations for budgeting and prevents past historical expenses from accumulating into large negative numbers.
- **Alternatives Considered**:
  - *Lifetime Account Transfers*: Requiring users to log manual transfer transactions from salary into sub-accounts. Rejected as overly complex for a lightweight budgeting tool.

### 2. Preserve Lifetime Net Balance for Total Assets Header

- **Decision**: Keep `displayTotalBalance` in the top balance card calculated via lifetime realized transactions `totalIncome - totalExpense`.
- **Rationale**: The header represents actual total net worth across all groups, while group cards represent monthly budget execution.

## Implementation Contract

- **Behavior**:
  - Non-source account group cards display the current month's allocated target amount, used expenses, and remaining balance (e.g. `已用 $4,814 / 餘 $25,186` when allocated budget is $30,000).
  - Main balance card ("目前總餘額") continues to show lifetime net assets without alteration.
- **Interface / Data Shape**:
  - `DashboardTab.tsx`: Update group card balance display logic to compute monthly target amount and subtract `getGroupMonthlyUsed(groupId)`.
- **Failure Modes**:
  - If current month source income is 0, allocated budget is $0 and remaining balance is `-monthlyUsed`, displaying a clear negative remaining indicator for the current month only.
- **Acceptance Criteria**:
  - Unit tests in `DashboardTab.spec.tsx` verify that past month expenses do not reduce the current month's account card remaining balance.
  - Current month expenses accurately subtract from current month allocation on the group card.
- **Scope Boundaries**:
  - In Scope: `DashboardTab.tsx` component rendering and calculation logic, updated unit tests.
  - Out of Scope: Data schema changes, backend API or SQLite persistence layer changes.

## Risks / Trade-offs

- [Risk: Current month with $0 income shows negative remaining balance when expenses occur] → Mitigation: Display current month remaining balance clearly with standard expense formatting, keeping it scoped strictly to the active month.
