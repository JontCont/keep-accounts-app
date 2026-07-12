## 1. Decision: Unify import/export terminology across user surfaces

- [x] 1.1 Implement **Requirement: Backup import/export guidance is consistent and explicit** by aligning Settings backup section wording for export backup, import restore, and overwrite warning; verify via manual UI review in apps/web/src/app/app.tsx and confirm terminology appears consistently in rendered Settings content.
- [x] 1.2 Implement **Requirement: Backup import/export guidance is consistent and explicit** in documentation by updating bilingual README import/export setup notes to mirror Settings wording and overwrite semantics; verify via content review of README.md English and Traditional Chinese sections.

## 2. Decision: Keep backup payload contract explicit in guidance

- [x] 2.1 Implement **Requirement: Backup payload contract is documented for operators** by documenting `backup_data.json`, `keep_accounts_groups`, and `keep_accounts_transactions` as required restore payload elements in README and operator-facing guidance text; verify via content review that all three identifiers are present and unambiguous.
- [x] 2.2 Implement **Requirement: Backup payload contract is documented for operators** by ensuring backup validation error guidance in apps/web/src/app/services/backup.ts and related user-facing copy remains aligned with the documented payload contract; verify by running `npx nx test web -- --run src/app/services/backup.spec.ts`.

## 3. Decision: Preserve destructive restore behavior but make safety messaging mandatory

- [x] 3.1 Implement **Requirement: Backup import/export guidance is consistent and explicit** by preserving restore overwrite behavior while making irreversible-action warning text explicit before import restore execution in Settings flows; verify through manual assertion that restore guidance states current account and transaction data will be replaced.

## 4. Decision: Standardize verification targets in documentation

- [x] 4.1 Implement **Requirement: Verification targets are documented and executable** by documenting workspace verification commands for backup behavior and persistence fallback behavior in README; verify command correctness by running `npx nx test web -- --run src/app/services/backup.spec.ts` and `npx vitest run libs/shared/state/src/lib/persistence.spec.ts`.
- [x] 4.2 Implement **Requirement: Verification targets are documented and executable** by ensuring proposal, spec, and tasks use matching verification scope and no conflicting command variants; verify with `spectra analyze improve-import-export-backup-guidance --json` returning no Critical/Warning findings.
