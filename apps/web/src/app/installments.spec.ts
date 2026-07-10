import { describe, it, expect } from 'vitest';
import { expandInstallment } from '@keep-accounts-app/domain';

describe('expandInstallment', () => {
  it('puts the remainder on the last period (10007 over 10)', () => {
    const start = '2026-01-15T10:00:00+08:00';
    const periods = expandInstallment(10007, 10, start);

    expect(periods).toHaveLength(10);
    // Periods 1..9 are the base amount
    for (let i = 0; i < 9; i++) {
      expect(periods[i].amount).toBe(1000);
      expect(periods[i].period).toBe(i + 1);
    }
    // Final period absorbs the remainder
    expect(periods[9].amount).toBe(1007);
    expect(periods[9].period).toBe(10);
    // Amounts sum exactly to the total
    expect(periods.reduce((s, p) => s + p.amount, 0)).toBe(10007);
  });

  it('divides evenly when there is no remainder (12000 over 12)', () => {
    const periods = expandInstallment(12000, 12, '2026-01-15T10:00:00+08:00');
    expect(periods.every((p) => p.amount === 1000)).toBe(true);
    expect(periods.reduce((s, p) => s + p.amount, 0)).toBe(12000);
  });

  it('handles 10000 over 3 as 3333, 3333, 3334', () => {
    const periods = expandInstallment(10000, 3, '2026-01-15T10:00:00+08:00');
    expect(periods.map((p) => p.amount)).toEqual([3333, 3333, 3334]);
    expect(periods.reduce((s, p) => s + p.amount, 0)).toBe(10000);
  });

  it('advances one month per period', () => {
    const periods = expandInstallment(3000, 3, '2026-01-15T10:00:00+08:00');
    // Month portion (YYYY-MM) advances each period
    expect(periods[0].date.substring(0, 7)).toBe('2026-01');
    expect(periods[1].date.substring(0, 7)).toBe('2026-02');
    expect(periods[2].date.substring(0, 7)).toBe('2026-03');
  });
});
