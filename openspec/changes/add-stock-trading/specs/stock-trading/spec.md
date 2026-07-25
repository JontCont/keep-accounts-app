## ADDED Requirements

### Requirement: Record stock trades independently of cash settlement
The system SHALL allow a user to record a stock buy or sell with a symbol, side, positive integer share quantity, positive unit price, non-negative fee, non-negative tax, and trade date. Selecting a settlement account SHALL be optional and SHALL NOT affect whether the trade updates stock holdings.

#### Scenario: Buy without a settlement account
- **WHEN** a user records a buy of 100 shares of `2330` at 10 with no fee, no tax, and no settlement account
- **THEN** the holding for `2330` SHALL increase by 100 shares with total cost 1,000
- **AND** the system SHALL NOT create a cash ledger entry
- **AND** the system SHALL NOT report an expense or profit for the buy

#### Scenario: Buy with a settlement account
- **WHEN** a user records the same buy and selects an account containing e財庫 funds
- **THEN** the holding SHALL have the same quantity and cost as the trade without an account
- **AND** the selected account cash balance SHALL decrease by 1,000
- **AND** the 1,000 cash movement SHALL be excluded from expense, budget, profit-and-loss, and allocation totals

### Requirement: Derive holdings using moving-average cost
The system SHALL derive each symbol's shares, remaining total cost, and average unit cost by replaying trades in trade-date order with deterministic tie-breaking. Buy fees and taxes SHALL increase cost. A sale SHALL remove the pre-sale moving-average cost multiplied by sold shares and SHALL NOT change the average unit cost of the remaining shares.

#### Scenario: Average cost after multiple buys and a partial sale
- **WHEN** a user buys 100 shares at 10, buys 100 shares at 14, and then sells 100 shares at 15, with no fees or taxes
- **THEN** the pre-sale average unit cost SHALL be 12
- **AND** the sale SHALL remove 1,200 of cost
- **AND** the remaining position SHALL contain 100 shares with total cost 1,200 and average unit cost 12

##### Example: Moving-average replay

| Trade | Shares After Trade | Cost After Trade | Realized Gain |
| ----- | ------------------ | ---------------- | ------------- |
| Buy 100 at 10 | 100 | 1,000 | 0 |
| Buy 100 at 14 | 200 | 2,400 | 0 |
| Sell 100 at 15 | 100 | 1,200 | 300 |

### Requirement: Prevent invalid stock timelines
The system MUST reject a trade mutation when required values are invalid, sale net proceeds are negative, or replaying the resulting symbol history would produce a negative share quantity at any point. Rejection SHALL leave both stock trades and linked ledger entries unchanged and SHALL surface the validation reason.

#### Scenario: Reject an oversell
- **WHEN** a position contains 100 shares and the user attempts to sell 101 shares
- **THEN** the system SHALL reject the sale as exceeding available shares
- **AND** the position and ledger SHALL remain unchanged

#### Scenario: Reject an edit that invalidates a later sale
- **WHEN** a symbol history contains a buy of 100 shares followed by a sale of 100 shares
- **AND** the user attempts to edit the buy to 50 shares
- **THEN** the system SHALL reject the edit because the later sale would oversell
- **AND** the original buy, sale, holding, and linked ledger entries SHALL remain unchanged

### Requirement: Calculate realized profit and loss from net proceeds
For every valid sale, the system SHALL calculate net proceeds as gross proceeds minus fee minus tax and realized profit or loss as net proceeds minus the moving-average cost removed. Returned principal SHALL NOT be classified as income. A selected settlement account SHALL receive the full net proceeds as a cash-only movement, while the realized result SHALL be represented separately as a profit-and-loss-only entry.

#### Scenario: Profitable full sale with settlement
- **WHEN** a user buys 100 shares of `2330` at 10 and later sells all 100 at 12 with no fees or taxes and selects e財庫 as the settlement account
- **THEN** the sale net proceeds SHALL be 1,200
- **AND** the returned principal SHALL be 1,000
- **AND** the realized gain SHALL be 200
- **AND** e財庫 cash balance SHALL increase by 1,200
- **AND** income and allocation calculations SHALL include at most the 200 realized gain, never the 1,200 proceeds

#### Scenario: Sale with fees and tax
- **WHEN** 100 shares with moving-average cost 10 are sold at 12 with a fee of 10 and tax of 20
- **THEN** net proceeds SHALL be 1,170
- **AND** removed cost SHALL be 1,000
- **AND** realized gain SHALL be 170

#### Scenario: Realized loss
- **WHEN** 100 shares with moving-average cost 10 are sold at 9 with no fees or taxes
- **THEN** the system SHALL record a realized loss of 100 in investment profit-and-loss
- **AND** the system SHALL NOT offer or create allocatable gain

### Requirement: Configure positive realized gain disposition
For a positive realized gain, the system SHALL let the user retain all gain in investment funds, include all gain in the current month's allocation source, or split the gain by an allocation percentage from 0 through 100. Retain SHALL be the default. The allocated and retained amounts SHALL sum exactly to the realized gain after currency rounding. Only the allocated amount SHALL enter the allocation base.

#### Scenario: Retain the complete gain
- **WHEN** a sale realizes a gain of 200 and the user keeps the default retain disposition
- **THEN** the system SHALL record 200 as investment income
- **AND** zero from the sale SHALL enter the allocation base

#### Scenario: Allocate the complete gain
- **WHEN** a sale realizes a gain of 200 and the user selects allocate
- **THEN** the system SHALL record 200 as allocation-source investment gain
- **AND** 200 SHALL enter the current month's allocation base

#### Scenario: Split the gain
- **WHEN** a sale realizes a gain of 200 and the user allocates 30 percent
- **THEN** 60 SHALL enter the current month's allocation base
- **AND** 140 SHALL remain in investment funds
- **AND** the two profit-and-loss entries SHALL sum to 200 without changing settlement-account cash a second time

### Requirement: Rebuild linked ledger effects after trade changes
The system SHALL identify stock-generated ledger entries by their stock trade identifier. Creating, editing, or deleting a trade SHALL atomically rebuild the affected symbol's positions, realized results, settlement movements, and gain-disposition entries so stale projections do not remain.

#### Scenario: Delete a completed sale
- **WHEN** a user deletes a sale that generated a cash settlement and realized-gain entries
- **THEN** all ledger entries linked to that sale SHALL be removed
- **AND** the symbol holding SHALL be recalculated from the remaining trades

#### Scenario: Edit a historical trade
- **WHEN** a user changes the price, fees, taxes, shares, date, settlement account, or gain disposition of a valid historical trade
- **THEN** the system SHALL recalculate every affected later sale for that symbol
- **AND** linked ledger entries SHALL match the recalculated results exactly once

### Requirement: Persist and back up stock data
The system SHALL persist stock trades and stock-linked transaction effects in browser storage and native SQLite storage. Exported backups SHALL include stock trades. Imports SHALL restore stock trades and recalculate holdings consistently across storage modes.

#### Scenario: Round-trip a stock portfolio
- **WHEN** a user exports and restores data containing stock buys, sells, optional settlements, and split gains
- **THEN** the restored trades, holdings, realized results, and linked ledger effects SHALL equal the exported state

#### Scenario: Import a legacy backup
- **WHEN** a valid backup contains account groups and transactions but omits stock trades
- **THEN** the system SHALL import it with an empty stock trade list
- **AND** existing account groups and transactions SHALL remain intact

#### Scenario: Reject malformed stock trade backup data
- **WHEN** a backup contains a stock-trade field that is not an array or contains an invalid trade
- **THEN** the system SHALL reject the import with a stock-trade validation error
- **AND** the current persisted state SHALL remain unchanged

### Requirement: Display stock positions and realized performance
The system SHALL provide a portfolio view listing each held symbol's shares, remaining total cost, average unit cost, and cumulative realized profit or loss. Zero-share symbols SHALL remain available in trade history but SHALL NOT appear as open positions.

#### Scenario: Display an open position after a partial sale
- **WHEN** replay produces 100 remaining shares, total cost 1,200, average unit cost 12, and cumulative realized gain 300 for a symbol
- **THEN** the portfolio SHALL display all four values for that symbol

#### Scenario: Hide a closed position
- **WHEN** replay produces zero remaining shares for a symbol
- **THEN** the symbol SHALL be absent from the open-position list
- **AND** its buy and sell records SHALL remain visible in trade history
