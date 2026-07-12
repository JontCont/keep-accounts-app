import { describe, expect, it } from 'vitest';

import { STARTER_ALLOCATION_PRESET } from './mock-data';

describe('STARTER_ALLOCATION_PRESET', () => {
  it('keeps the canonical source group and target ratios summing to 100', () => {
    const sourceGroups = STARTER_ALLOCATION_PRESET.filter((group) => group.isSource);
    const nonSourceGroups = STARTER_ALLOCATION_PRESET.filter((group) => !group.isSource);
    const targetSum = nonSourceGroups.reduce((sum, group) => sum + (group.targetRatio || 0), 0);

    expect(sourceGroups).toHaveLength(1);
    expect(sourceGroups[0].id).toBe('0');
    expect(sourceGroups[0].name).toBe('當月薪資');
    expect(targetSum).toBe(100);
    expect(nonSourceGroups).toHaveLength(3);
  });
});