## Context

This project is an Nx monorepo containing a React web application under `apps/web/`. To package this web application as native Android and iOS apps, we need to introduce Capacitor. We also want to expose these packaging actions directly to developers via the Nx Console (by adding Nx targets) and verify they remain buildable via GitHub Actions on every push/PR.

## Goals / Non-Goals

**Goals:**
- Configure Capacitor within the `apps/web/` directory.
- Define target commands in `apps/web/package.json` under `nx.targets` to integrate with Nx Console and support dependency-based builds (ensuring the web app compiles before sync/packaging).
- Create a GitHub Actions workflow `.github/workflows/build-app.yml` to compile and package Android (debug APK) and iOS (unsigned compilation check) on CI.

**Non-Goals:**
- Configuring release-ready code signing certificates (Keystore, Provisioning Profiles) on GitHub Secrets.
- Modifying React source code to call native device APIs.
- Setting up automated store deployments.

## Decisions

### Decision: Place Capacitor configuration under `apps/web/`
- **Rationale**: Since this is an Nx monorepo, keeping the root directory clean is crucial. Placing the Capacitor configuration (`capacitor.config.ts`), native iOS directory (`ios/`), and native Android directory (`android/`) inside `apps/web/` ensures encapsulation. If other apps are added to the workspace later, they can have their own isolated Capacitor wrappers without naming conflicts.
- **Alternatives Considered**: Configured at the workspace root. This was rejected because it makes supporting multiple native apps in the future difficult and pollutes the workspace root directory.

### Decision: Define Nx target scripts in `apps/web/package.json`
- **Rationale**: Nx 23 allows configuring project targets under the `"nx"` property in `package.json`. Doing this instead of creating a `project.json` file avoids adding extra configuration files to `apps/web/`. It maps directly to Nx Console while maintaining simplicity.
- **Alternatives Considered**: Using a separate `project.json` for target definitions. Rejected to keep the file structure minimal.

### Decision: Unsigned compiles and Debug APK builds in CI/CD
- **Rationale**: Setting up developer credentials, certificates, and profiles in GitHub Secrets is complex and poses security management overhead. For verification purposes, building an unsigned Android debug APK (which uses the default debug keystore) and building iOS with `CODE_SIGNING_ALLOWED=NO` is sufficient to check that the codebase compiles successfully and packaging works.
- **Alternatives Considered**: Signing builds on CI. Rejected due to the complexity of managing developer certificates at this stage.

### Decision: Use Ionic Layout Components for Safe Area Insets
- **Rationale**: The custom PWA HTML/CSS shell currently overlaps with status bars (notches) and bottom home indicators on mobile packaging. Since `@ionic/react` is already present as a dependency in the project, utilizing `IonApp`, `IonPage`, and `IonContent` to wrap the app shell is the most robust and standard approach. These components automatically handle viewport safe area padding and native-like scrolling.
- **Alternatives Considered**: Inline CSS calculations with `env(safe-area-inset-*)`. Rejected because custom CSS can be less reliable across different screen scales, keyboards, and devices compared to Ionic's layout system.

## Implementation Contract

- **Behavior**: 
  - Running `npx nx run web:build-android` (or clicking it in Nx Console) compiles the web application, synchronizes assets to Android, and outputs a debug APK.
  - Running `npx nx run web:build-ios` (or clicking it in Nx Console) compiles the web application, synchronizes assets to iOS, and compiles the iOS app (without code signing).
  - Web views on iOS and Android automatically respect status bars and bottom home indicators via Ionic layout wrapping and `viewport-fit=cover`.
- **Interface / Data Shape**:
  - `nx` target properties inside `apps/web/package.json`:
    - `sync-android`, `build-android`, `build-ios` using the `"executor": "nx:run-commands"` executor.
    - Depend on `build` target: `"dependsOn": ["build"]`.
  - GitHub Actions Workflow:
    - Path: `.github/workflows/build-app.yml`
    - Triggers: `push` and `pull_request` on `master` branch.
- **Failure Modes**:
  - Web compilation failure: Nx target execution stops before running Capacitor sync commands.
  - Missing native build dependencies: The CI workflow will fail if JDK 17 is missing or if the macOS runner fails to compile the Xcode workspace.
- **Acceptance Criteria**:
  - Execution of `npx nx run web:build-android` succeeds and output exists at `apps/web/android/app/build/outputs/apk/debug/app-debug.apk`.
  - Execution of `npx nx run web:build-ios` succeeds without signing errors.
  - The GitHub Actions workflow compiles both platforms successfully without warnings or failures.
  - Application UI elements (header and bottom navigation) do not overlap with phone notches, status bars, or home indicators on mobile packaging.
- **Scope Boundaries**:
  - **In Scope**:
    - Adding Capacitor core/cli packages.
    - Creating `apps/web/capacitor.config.ts`.
    - Creating native wrapper structures (`apps/web/android`, `apps/web/ios`).
    - Modifying `apps/web/package.json` to include target scripts.
    - Adding `.github/workflows/build-app.yml`.
    - Adjusting `apps/web/index.html` to add `viewport-fit=cover`.
    - Modifying `apps/web/src/app/app.tsx` to wrap with `IonApp`, `IonPage`, `IonContent`, and adjust navigation/header padding.
  - **Out of Scope**:
    - Invoking native Capacitor APIs/plugins beyond standard rendering.

## Risks / Trade-offs

- **[Risk] Slow iOS builds on CI** -> macOS GitHub runners can be slow and consume more Actions minutes.
  - *Mitigation*: Enable caching for CocoaPods dependencies to minimize pod installation time during builds.
- **[Risk] Path differences on Windows vs Linux** -> Gradle wrapper is `./gradlew` on macOS/Linux and `gradlew.bat` on Windows.
  - *Mitigation*: Ensure targets in `nx.targets` execute cross-platform commands or use proper relative paths.
