## 1. Viewport Meta Configuration

- [x] 1.1 Implement Decision: Restrict Viewport Scaling in index.html and satisfy Requirement: Viewport Scaling Restriction.
  - **Behavior**: Modify the viewport meta tag in `apps/web/index.html` to append the `maximum-scale=1` and `user-scalable=no` scaling restrictions.
  - **Verification**: Content review of the viewport meta tag inside index.html to ensure both parameters are active.

## 2. Input Elements Restructuring

- [x] 2.1 Implement Decision: Use IonInput with a Minimum Font Size of 16px and satisfy Requirement: iOS Auto-Zoom Prevention on Input Focus.
  - **Behavior**: Adjust the inline styles of custom-styled inputs (specifically the targetRatio percentage inputs) in `apps/web/src/app/app.tsx` to set the font size to at least `16px` (`1rem`).
  - **Verification**: Perform a content review of app.tsx and verify no input elements have a font size below 16px.
- [x] 2.2 Satisfy Requirement: Standard Ionic Inputs Integration in `apps/web/src/app/app.tsx`.
  - **Behavior**: Replace native `<input>` tags in app.tsx (such as description, amount, budget, new group name, and new category name fields) with `<IonInput>` components from `@ionic/react`.
  - **Verification**: Run the application local dev server, verify input forms render correctly, and confirm transaction recording operates successfully.
