## Why

The `apps/swift-cli` directory contains an unused dummy Swift package (`Hello, world!`) that causes documentation drift and confusion for new developers. Removing this unused boilerplate keeps the codebase clean and aligned with the React/Capacitor stack.

## What Changes

- Remove the unused `apps/swift-cli` directory.
- Update `README.md` to remove references to `apps/swift-cli`.

## Non-Goals

- Modifying existing React web app, Capacitor iOS build config, or E2E testing tools.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

(none)

## Impact

- Affected specs: (none)
- Affected code:
  - Modified: `README.md`
  - Removed: `apps/swift-cli`
