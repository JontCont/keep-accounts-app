## Context

The app already supports backup export and restore through Settings and service helpers, but guidance is split across UI text, alerts, and documentation with inconsistent terms. Users can miss that restore is destructive (overwrite) and operators do not have a single verification baseline for backup payload shape and fallback checks. The change needs a durable contract that keeps user instructions, payload expectations, and verification commands aligned.

## Goals / Non-Goals

**Goals:**

- Provide one consistent import/export guidance model across UI copy and README documentation.
- Make overwrite behavior explicit before restore actions.
- Keep backup payload expectations explicit and testable (`backup_data.json` with required keys).
- Document concrete verification commands for backup service and persistence compatibility behavior.

**Non-Goals:**

- Redesigning backup architecture, storage backend, or SQLite migration behavior.
- Introducing cloud sync, remote backup endpoints, or authentication.
- Changing Playwright configuration, target wiring, or E2E runner behavior.

## Decisions

### Decision: Unify import/export terminology across user surfaces

Use a stable term set across app and README: export backup, import restore, overwrite warning, and import history. This reduces ambiguity between "backup", "restore", and "import" in mixed-language copy.

Alternatives considered:
- Keep existing mixed wording in each surface: rejected because wording drift already caused operator confusion.

### Decision: Keep backup payload contract explicit in guidance

Guidance SHALL explicitly state the backup archive contains `backup_data.json` and required keys `keep_accounts_groups` and `keep_accounts_transactions`. The contract already exists in service validation; this change exposes it in user/operator guidance so file validity expectations are clear.

Alternatives considered:
- Document only at code level: rejected because end users and reviewers need visible expectations without reading source.

### Decision: Preserve destructive restore behavior but make safety messaging mandatory

Restore/import SHALL continue to replace current account and transaction data, and the warning copy SHALL clearly state the action is irreversible. This preserves existing behavior while reducing accidental misuse.

Alternatives considered:
- Add partial merge restore: rejected as out of scope and requires new conflict-resolution rules.

### Decision: Standardize verification targets in documentation

README SHALL include focused verification commands for backup service tests and persistence fallback tests. This keeps onboarding practical after SQLite-first persistence while avoiding unrelated runner setup details.

Alternatives considered:
- Keep verification implicit: rejected because setup guidance without executable checks is fragile.

## Implementation Contract

- Behavior:
  - Settings backup section presents clear export, import/restore, and overwrite-risk messaging.
  - Import restore continues to overwrite current account groups and transactions after user confirmation flow.
  - Import history remains visible as audit context after restore attempts.
- Interface / data shape:
  - Backup zip content is described as containing `backup_data.json`.
  - `backup_data.json` is described as containing both `keep_accounts_groups` and `keep_accounts_transactions`.
  - README bilingual setup notes include the same contract and user flow as in-app wording.
- Failure modes:
  - Invalid backup archives (missing file/keys) remain rejected by backup service validation.
  - Guidance avoids silent assumptions by documenting overwrite and validity expectations.
- Acceptance criteria:
  - `npx nx test web -- --run src/app/services/backup.spec.ts` passes.
  - `npx vitest run libs/shared/state/src/lib/persistence.spec.ts` passes.
  - README import/export section in English and Traditional Chinese describes matching flow and payload expectations.
- Scope boundaries:
  - In scope: wording consistency, guidance updates, and verification documentation for import/export backup behavior.
  - Out of scope: storage backend redesign, cloud transport, and Playwright pipeline changes.

## Risks / Trade-offs

- [Risk] Copy updates may drift from future UI changes -> Mitigation: keep a dedicated capability spec and tasks tied to observable wording requirements.
- [Risk] Operators may assume README commands cover all integration risk -> Mitigation: document that commands verify backup and persistence paths, not full native packaging pipeline.
