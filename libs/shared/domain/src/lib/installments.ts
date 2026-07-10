import { getLocalISOString } from './utils';

export interface InstallmentPeriod {
  date: string; // Local ISO datetime string for this period's payment date
  amount: number;
  period: number; // 1-based period number
}

/**
 * Split a total into `periods` monthly payments using the Taiwan convention:
 * periods 1..N-1 each carry `floor(total / periods)` and the final period
 * absorbs the remainder, so the amounts sum exactly to `total`. Each period's
 * date advances one month from `startDate`.
 */
export const expandInstallment = (
  total: number,
  periods: number,
  startDate: string
): InstallmentPeriod[] => {
  const base = Math.floor(total / periods);
  const start = new Date(startDate);
  const result: InstallmentPeriod[] = [];
  for (let i = 0; i < periods; i++) {
    const d = new Date(start);
    d.setMonth(start.getMonth() + i);
    const amount = i === periods - 1 ? total - base * (periods - 1) : base;
    result.push({ date: getLocalISOString(d), amount, period: i + 1 });
  }
  return result;
};
