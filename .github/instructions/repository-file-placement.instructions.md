---
description: "Keep generated files and task artifacts out of the repository root"
applyTo: "**"
---

# Repository File Placement

- Do not create screenshots, test output, temporary files, generated assets, debug artifacts, or task-specific files in the repository root.
- Place files in the closest existing feature, app, test-output, asset, or temporary directory that owns them.
- Create a clearly named subdirectory under the owning project when no suitable directory exists.
- Only add a file to the repository root when the repository already expects that file type there, or when the user explicitly requests that exact location.