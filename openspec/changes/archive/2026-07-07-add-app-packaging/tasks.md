## 1. Initial Setup

- [x] 1.1 Install Capacitor dependencies in package.json.
  - **Behavior**: Add @capacitor/core to dependencies, and @capacitor/cli to devDependencies in package.json.
  - **Verification**: Run npm install and verify package.json updates and npm list returns no unresolved peer dependency warnings.
- [x] 1.2 Initialize Capacitor configuration for Capacitor Web Project Integration and implement Decision: Place Capacitor configuration under `apps/web/`.
  - **Behavior**: Create apps/web/capacitor.config.ts with appId "com.keepaccounts.app", appName "Keep Accounts", and webDir "dist".
  - **Verification**: Run npx cap sync in apps/web/ and verify that it resolves the build output directory and configuration without errors.

## 2. Native Platform Setup

- [x] 2.1 Initialize Android and iOS native platforms.
  - **Behavior**: Create the native wrapper project directories apps/web/android/ and apps/web/ios/ using Capacitor.
  - **Verification**: Verify that apps/web/android/app/build.gradle and apps/web/ios/App/App.xcworkspace exist after running cap add commands.

## 3. Nx Integration

- [x] 3.1 Add Nx Target Definitions for Mobile Builds and implement Decision: Define Nx target scripts in `apps/web/package.json`.
  - **Behavior**: Update apps/web/package.json to define nx.targets including sync-android, build-android, and build-ios with the nx:run-commands executor, each specifying a dependency on the build target.
  - **Verification**: Run nx show project web and verify the new targets appear in the output.
- [x] 3.2 Verify Nx targets compile and build locally.
  - **Behavior**: Execute npx nx run web:build-android to compile the web app, synchronize assets, and trigger gradle to assemble the debug build.
  - **Verification**: Verify that the task succeeds and a debug APK is outputted at apps/web/android/app/build/outputs/apk/debug/app-debug.apk.

## 4. CI/CD Pipeline

- [x] 4.1 Create the Automated CI Builds for Mobile Platforms workflow and apply Decision: Unsigned compiles and Debug APK builds in CI/CD.
  - **Behavior**: Create .github/workflows/build-app.yml defining GitHub Actions build jobs for Android and iOS that compile without signing credentials.
  - **Verification**: Push the workflow and verify the CI run executes successfully on GitHub, completing the gradle build and Xcode compilation checks.

## 5. Safe Area and Mobile Layout Adjustment

- [x] 5.1 Enable viewport-fit=cover in web index.html.
  - **Behavior**: Update index.html to add `viewport-fit=cover` to the viewport meta tag.
  - **Verification**: Verify viewport meta tag exists and check in browser inspector.
- [x] 5.2 Wrap application with Ionic Layout Components in app.tsx and implement Decision: Use Ionic Layout Components for Safe Area Insets.
  - **Behavior**: Import IonApp, IonPage, and IonContent in app.tsx. Wrap the main layout inside these components.
  - **Verification**: Ensure the app starts without errors.
- [x] 5.3 Adjust top header and bottom floating navigation bar positioning.
  - **Behavior**: Set CSS paddings and bottom values on the floating navigation bar to utilize safe-area insets (`env(safe-area-inset-top)` / `env(safe-area-inset-bottom)` or `--ion-safe-area-*` variables).
  - **Verification**: Verify on mobile simulator or package the app to verify elements are no longer cut off by the status bar or overlapping with the home indicator.
