## ADDED Requirements

### Requirement: Consistent Transaction Action Icons
The system SHALL render transaction row action buttons using consistent Lucide flat outline icons across both Dashboard and History tabs.
- The edit transaction action button SHALL render the Lucide `edit` icon using `<AppIcon name="edit" />`.
- The delete transaction action button SHALL render the Lucide `trash-2` icon using `<AppIcon name="trash-2" />`.
- Both action buttons SHALL NOT render raw Unicode emojis or 3D icons.

#### Scenario: Edit button icon in Dashboard
- **WHEN** the user views the transaction ledger on the Dashboard tab
- **THEN** the edit button next to each transaction row displays the flat `edit` outline icon instead of the raw pencil emoji `✏️`

#### Scenario: Delete button icon in Dashboard
- **WHEN** the user views the transaction ledger on the Dashboard tab
- **THEN** the delete button next to each transaction row displays the flat `trash-2` outline icon instead of the raw trash bin emoji `🗑️`
