---
description: "Use when changing user-visible Keep Accounts features or bug fixes. Requires APP_VERSION release version updates before a develop-to-master merge."
applyTo: "apps/web/**, libs/shared/**"
---

# Release Version Policy

- `APP_VERSION` in `.github/workflows/build-app.yml` is the authoritative
  GitHub Release version.
- When modifying user-visible product behavior, inspect the current
  `APP_VERSION` and ensure it is higher than the version on `master` before
  completing the change.
- Choose the smallest appropriate SemVer increment:
  - `patch` for bug fixes and compatible maintenance.
  - `minor` for new user-facing capabilities.
  - `major` for incompatible behavior or data changes.
- Do not increment the version for tests, documentation, CI, refactors, or
  internal-only changes without user-visible behavior.
- If `APP_VERSION` is already greater than the version on `master`, preserve it
  unless the pending changes require a larger increment.
- Keep the version as `major.minor.patch` without a `v` prefix. Do not alter
  the date-SHA build identifier.
- Before finishing, verify the version is greater than `master`; the `Verify
  release version` PR check enforces this before merging into `master`.