## ADDED Requirements

### Requirement: Unique Category Colors
The system SHALL assign a unique hex color value to every expense and income category across all default account groups defined in `constants.ts`.
No two categories within the same account group SHALL share the same color value.
No two categories across different account groups SHALL share the same color value.

#### Scenario: Pie chart slices are visually distinct
- **WHEN** the user views the statistics pie chart with 3 or more expense categories
- **THEN** each pie chart slice renders in a visually distinct color with no two adjacent or non-adjacent slices sharing the same color

##### Example: three categories displayed
- **GIVEN** categories: 餐飲食品 (`#f59e0b`), 交通出行 (`#22d3ee`), 投資理財 (`#6366f1`)
- **WHEN** the pie chart renders these three categories
- **THEN** each slice has a different fill color: amber, cyan, indigo respectively

#### Scenario: No duplicate colors in account group
- **WHEN** viewing a single account group's categories
- **THEN** all category color swatches displayed in the UI are different from each other

### Requirement: Category-Consistent Progress Bar Color
The system SHALL render each category's progress bar in the statistics page using a solid fill of that category's own color.
The progress bar fill SHALL NOT use a hardcoded gradient endpoint that is shared across all categories.

#### Scenario: Progress bar matches category color
- **WHEN** a category with color `#22d3ee` (cyan) appears in the "各類別支出佔比" list
- **THEN** its progress bar fill is solid cyan (`#22d3ee`), not a gradient ending in rose-red

#### Scenario: Progress bars are visually distinct from each other
- **WHEN** two categories have different colors
- **THEN** their progress bars have visually different fills
