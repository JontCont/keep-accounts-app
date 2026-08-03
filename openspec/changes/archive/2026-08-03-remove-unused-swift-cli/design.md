## Context

`apps/swift-cli` was originally added as a placeholder for a Swift CLI helper tool, but is unmaintained and contains only default `Hello, world!` boilerplate. README documentation references this directory, creating confusion for new contributors.

## Goals / Non-Goals

**Goals:**
- Delete `apps/swift-cli` completely from the repository.
- Update `README.md` to reflect the active workspace architecture (`apps/web` and `apps/web-e2e`).

**Non-Goals:**
- Adding alternative Swift CLI tooling.

## Decisions

### 1. Delete Unused Swift CLI Boilerplate Directory

- **Decision**: Remove `apps/swift-cli` directory and purge references from `README.md`.
- **Rationale**: Keeps repository minimal and reduces documentation drift.

## Implementation Contract

- **Behavior**: Workspace architecture documentation in `README.md` reflects only active applications (`apps/web` and `apps/web-e2e`).
- **Interface / Data Shape**: No TypeScript or API interfaces affected.
- **Failure Modes**: N/A
- **Acceptance Criteria**: `apps/swift-cli` directory is removed and `git status` shows clean workspace structure.
- **Scope Boundaries**: In scope: file deletion and README edits. Out of scope: application logic.

## Risks / Trade-offs

- [Risk: None] → Mitigation: Standard file deletion.
