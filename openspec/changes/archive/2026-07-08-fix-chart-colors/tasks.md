## 1. Unique Category Colors — Fix constants.ts

- [x] 1.1 Reassign Unique Category Colors across all default account groups in `libs/shared/domain/src/lib/constants.ts` so that no two categories share the same hex color value. The resulting color set must cover at least 20 distinct values drawn from a wide hue range (not only blues). Verification: manually inspect the color values in `constants.ts` and confirm all category `color` fields are unique strings with no duplicates across all three groups.

## 2. Category-Consistent Progress Bar Color — Fix StatsTab.tsx

- [x] 2.1 Implement Category-Consistent Progress Bar Color in `apps/web/src/app/components/StatsTab.tsx` by replacing the hardcoded gradient endpoint `linear-gradient(90deg, ${cat.color}, #f43f5e)` with a solid fill `cat.color`. The bar for every category must visually match its pie chart slice color. Verification: view the statistics page in the dev browser with at least 3 expense categories and manually assert that (a) the pie chart slices and (b) the progress bars for the same category share the same color, and no two bars end in the same rose-red hue.
