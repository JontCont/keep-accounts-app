## ADDED Requirements

### Requirement: Per-period payment-date reminder switch

The installment configuration SHALL include a payment-reminder switch. When the switch is on, the system SHALL schedule one reminder for each future period, timed to that period's payment date. When the switch is off, the system SHALL schedule no reminders and SHALL cancel any reminders previously scheduled for that installment. Turning the switch off or removing the installment SHALL cancel its outstanding reminders.

#### Scenario: Reminders scheduled when the switch is on

- **WHEN** the user saves an installment with the payment-reminder switch on
- **THEN** the system SHALL schedule one reminder per future period on that period's payment date

#### Scenario: Reminders cancelled when the switch is off

- **WHEN** the user turns the payment-reminder switch off for an installment
- **THEN** the system SHALL cancel any reminders previously scheduled for that installment and schedule no new reminders

### Requirement: Native-only local notification delivery

Payment reminders SHALL be delivered as on-device local notifications on native platforms (iOS and Android) only. On the web platform the payment-reminder switch SHALL be hidden or disabled and no reminder SHALL be scheduled. Creating installment transactions SHALL NOT depend on notification availability: if notification permission is denied on a native platform, the system SHALL still create the transactions and SHALL skip scheduling silently.

#### Scenario: Web platform has no reminder scheduling

- **WHEN** the transaction form is used on the web platform
- **THEN** the payment-reminder switch SHALL be hidden or disabled and no reminder SHALL be scheduled

#### Scenario: Permission denied does not block transaction creation

- **WHEN** notification permission is denied on a native platform and an installment is saved with the reminder switch on
- **THEN** the system SHALL create all period transactions and SHALL skip reminder scheduling without an error

### Requirement: Default reminder message

Scheduled reminders SHALL use a fixed default title and body describing the installment payment. The system SHALL use this default title and body when scheduling each period's reminder.

#### Scenario: Default message is used for reminders

- **WHEN** the user saves an installment with reminders on
- **THEN** each scheduled reminder SHALL use the default title and body

