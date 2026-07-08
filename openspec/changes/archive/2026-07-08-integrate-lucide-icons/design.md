## Context

The application currently relies on Unicode emojis for all visual indicators (navigation, tabs, account groups, and categories). These emojis are colorful and 3D. We will integrate `lucide-react` to replace emojis with modern, flat, color-neutral line icons while maintaining backward compatibility for legacy user data.

## Goals / Non-Goals

**Goals:**
- Add `lucide-react` to project dependencies.
- Implement `<AppIcon name={name} />` component in the web app to wrap Lucide icons and fallback to emojis.
- Migrate navigation icons (home,明細,分析,設定) to flat Lucide icons.
- Update default account groups and categories mock data to use Lucide icon keys.
- Allow icons to inherit color dynamically via CSS (`currentColor`).

**Non-Goals:**
- Fetching icon SVGs from external APIs or servers.
- Adding distinct colorful styling to outline icons (they must remain color-neutral or inherit parent colors).

## Decisions

### Decision 1: Lucide React Integration
- **Rationale**: Lucide provides a large, highly consistent outline SVG icon set that is tree-shakeable, keeping the production bundle size small.
- **Alternatives Considered**: Using Ionicons (`IonIcon`). Ionicons is already installed, but Lucide React offers a more modern visual aesthetic and is easier to configure with direct React component exports.

### Decision 2: AppIcon Wrapper for Emoji Fallback
- **Rationale**: To prevent data corruption or missing visuals for existing user data in `localStorage` (which contains raw emojis like 💳), the `<AppIcon>` component must fallback to rendering the raw string if it is not a recognized Lucide key.
- **Alternatives Considered**: Automatically converting all legacy emojis in `localStorage` on startup. This is risky and error-prone, so a runtime fallback is safer.

### Decision 3: Default Data Migration
- **Rationale**: We will update the default groups and categories in the domain library to use Lucide keys (e.g. `credit-card`, `trending-up`, `piggy-bank`), giving new users a clean outline look out of the box.
- **Alternatives Considered**: Leaving default mock data as emojis. This would require new users to manually change their icons to get the line-icon style, which is bad UX.

### Decision 4: Color Neutral Styling
- **Rationale**: Outline icons look cleanest when they use the surrounding text color (`currentColor`) instead of hardcoded colors, ensuring a uniform visual theme.
- **Alternatives Considered**: Mapping custom colors to each icon. This increases styling complexity and makes the UI look cluttered.

## Implementation Contract

- **Behavior**:
  - Hardcoded emojis in the headers, bottom nav, and main action buttons are replaced by monochrome line icons.
  - The default categories and accounts show outline icons instead of emojis.
  - Saved accounts with legacy emojis still render their emojis correctly.

- **Interface / Data Shape**:
  - Reusable Icon Component:
    ```typescript
    interface AppIconProps {
      name: string;
      size?: number;
      className?: string;
    }
    ```
  - Stored icon keys are lowercase kebab-case strings matching Lucide icon names (e.g. `'credit-card'`).

- **Failure Modes**:
  - If a name is not a recognized Lucide icon (like a legacy emoji `🍔` or an invalid name), the component SHALL render the name string as-is.

- **Acceptance Criteria**:
  - Bottom navigation displays outline icons (`Home`, `BookOpen`, `BarChart2`, `Settings`).
  - Settings page backup section displays `Database` / `Save` outline icons.
  - Legacy emojis from `localStorage` render successfully.
  - All unit tests compile and pass.

- **Scope boundaries**:
  - Visual icons are updated. The functional logic of transactions, categories, and settings is out of scope.

## Risks / Trade-offs

- **[Risk] Package size increase** → *Mitigation*: Ensure only imported Lucide icons are bundled by leveraging Vite's tree-shaking support.
