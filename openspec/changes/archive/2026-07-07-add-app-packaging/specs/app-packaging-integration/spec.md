## ADDED Requirements

### Requirement: Capacitor Web Project Integration
The system SHALL integrate Capacitor into the React web application at apps/web. The configuration SHALL reside in apps/web/capacitor.config.ts, setting the appId to "com.keepaccounts.app", the appName to "Keep Accounts", and the webDir to "dist".

#### Scenario: Synchronizing web assets to native platforms
- **WHEN** a developer runs capacitor sync commands inside apps/web
- **THEN** Capacitor SHALL synchronize build outputs from apps/web/dist to the native Android and iOS subdirectories.

### Requirement: Nx Target Definitions for Mobile Builds
The system SHALL define nx.targets inside apps/web/package.json. These targets SHALL include sync-android, build-android, and build-ios, using the nx:run-commands executor. Each target MUST specify a dependency on the build target of the web application.

#### Scenario: Running build-android through Nx
- **WHEN** a user triggers the build-android task for the web application
- **THEN** Nx SHALL execute the build task to generate the web assets, and then compile the Android app using Gradle to produce a debug APK.

### Requirement: Automated CI Builds for Mobile Platforms
The system SHALL run a GitHub Actions CI workflow configured in .github/workflows/build-app.yml on push or pull requests targeting the master branch. The workflow MUST execute compilation and package generation without code signing certificates.

#### Scenario: Android CI debug compilation
- **WHEN** the CI runner executes the Android build job
- **THEN** it SHALL set up Java 17, build the web assets, sync the assets to the Android platform, run Gradle assembleDebug, and upload the output debug APK artifact.

#### Scenario: iOS CI unsigned compilation
- **WHEN** the CI runner executes the iOS build job
- **THEN** it SHALL set up macOS, build the web assets, sync the assets to the iOS platform, run xcodebuild with code signing disabled, and verify successful compilation.
