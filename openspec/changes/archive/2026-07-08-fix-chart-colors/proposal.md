## Why

The statistics page chart colors are visually indistinguishable: multiple categories share the same blue (`#3b82f6`), causing the pie chart to appear almost entirely one color. The progress bar gradient also forces every category to converge on the same rose-red endpoint, erasing per-category color identity.

## What Changes

- Reassign unique, perceptually distinct colors to every category in all three default account groups in `constants.ts`, ensuring no two categories share the same color value.
- Replace the hardcoded gradient endpoint `#f43f5e` in the category progress bars in `StatsTab.tsx` with a solid fill using each category's own color, so the bars visually match the pie chart slices.

## Capabilities

### New Capabilities

- `distinct-chart-colors`: Each expense category SHALL have a unique color that is used consistently across both the pie chart slices and the progress bars in the statistics view.

### Modified Capabilities

(none)

## Impact

- Affected specs: `distinct-chart-colors`
- Affected code:
  - Modified:
    - `libs/shared/domain/src/lib/constants.ts`
    - `apps/web/src/app/components/StatsTab.tsx`
