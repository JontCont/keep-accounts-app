## Why

Users and developers need to compile and package the web application as native iOS and Android packages. Currently, there is no setup for mobile packaging, and no automated CI/CD pipeline to verify that mobile builds work properly. Integrating Capacitor with Nx allows building mobile versions locally using Nx Console and automatically validating builds in GitHub Actions.

## What Changes

- Add Capacitor integration to the React application in `apps/web/` to target iOS and Android platforms.
- Add packaging targets (`sync-android`, `build-android`, `build-ios`) in `apps/web/package.json` integrated with the Nx task pipeline.
- Add a GitHub Actions workflow to build the Android debug APK and verify iOS compilation on every push/PR without signing certs.

## Non-Goals (optional)

- Setting up App Store / Google Play release signing profiles and upload pipelines.
- Modifying the React application's runtime JavaScript code to invoke native APIs.

## Capabilities

### New Capabilities

- `app-packaging-integration`: Setup Capacitor configuration, integrate iOS/Android native platforms within `apps/web`, define target tasks for Nx Console integration, and implement GitHub Actions workflow for CI compilation verification.

### Modified Capabilities

(none)

## Impact

- Affected specs: `app-packaging-integration`
- Affected code:
  - New:
    - `apps/web/capacitor.config.ts`
    - `.github/workflows/build-app.yml`
  - Modified:
    - `package.json`
    - `apps/web/package.json`
  - Removed:
    (none)
