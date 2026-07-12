/**
 * One-time, legacy data migrations.
 *
 * This module exists SOLELY to upgrade previously-saved data (from older app
 * versions) into the current schema. It is NOT seed/default data and is NOT
 * used on a fresh install — a fresh install starts empty and this code never
 * runs unless `localStorage` already contains groups.
 *
 * Keeping it out of `useKeepAccounts` keeps the core state hook focused on
 * read / write / operations, and isolates the legacy-compat concern here.
 */
import {
  AccountGroup,
  DEFAULT_ACCOUNT_GROUPS,
  ACCOUNT_COLORS,
  getDefaultCategoriesForNewGroup,
} from '@keep-accounts-app/domain';

/**
 * Legacy group id → new canonical name/description.
 * Applied when a stored group still uses an old name (or has no name yet).
 */
const LEGACY_GROUP_RENAMES: Record<
  string,
  { oldName: string; name: string; description: string; defaultIndex: number }
> = {
  '1': {
    oldName: '主資金',
    name: '日常開銷',
    description: '日常開銷：支付房租、水電、餐費與交通。',
    defaultIndex: 0,
  },
  '2': {
    oldName: '投資資金',
    name: '投資理財',
    description: '投資理財：投入股市、基金等，用於創造被動收入與資產增值。',
    defaultIndex: 1,
  },
  '3': {
    oldName: '存款資金',
    name: '長期儲蓄',
    description: '長期儲蓄：存入銀行或作為緊急預備金，確保財務安全。',
    defaultIndex: 2,
  },
};

/**
 * Migrate a raw, previously-persisted array of account groups into the current
 * schema. Pure function: given the parsed JSON, returns the upgraded groups.
 */
export function migrateAccountGroups(parsed: any[]): AccountGroup[] {
  let migrated: AccountGroup[] = parsed.map((g: any, index: number): AccountGroup => {
    let name = g.name;
    let description = g.description;
    let categories = g.categories;

    const rename = LEGACY_GROUP_RENAMES[g.id];
    if (rename && (g.name === rename.oldName || !g.name)) {
      name = rename.name;
      description = rename.description;
      if (!g.categories) {
        categories = DEFAULT_ACCOUNT_GROUPS[rename.defaultIndex].categories;
      }
    }

    // Sync category colors from current defaults (ensures color updates in
    // domain data propagate to existing user data)
    const defaultGroup = DEFAULT_ACCOUNT_GROUPS.find((dg) => dg.id === g.id);
    if (categories && defaultGroup) {
      categories = categories.map((cat: any) => {
        const defaultCat = defaultGroup.categories.find(
          (dc) => dc.name === cat.name
        );
        return defaultCat ? { ...cat, color: defaultCat.color } : cat;
      });

      // Ensure newly introduced default category exists for 投資理財.
      if (defaultGroup.id === '2') {
        const defaultStockCategory = defaultGroup.categories.find(
          (dc) => dc.name === '股票' && dc.type === 'expense'
        );
        const hasStockCategory = categories.some(
          (cat: any) => cat.name === '股票' && cat.type === 'expense'
        );

        if (defaultStockCategory && !hasStockCategory) {
          categories = [...categories, { ...defaultStockCategory }];
        }
      }
    }

    const ratio =
      typeof g.targetRatio === 'number' && !isNaN(g.targetRatio)
        ? g.targetRatio
        : defaultGroup?.targetRatio ?? 0;
    return {
      id: g.id,
      name: name,
      emoji: g.emoji,
      color:
        g.color ||
        defaultGroup?.color ||
        ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
      description: description || defaultGroup?.description,
      categories:
        categories ||
        defaultGroup?.categories ||
        getDefaultCategoriesForNewGroup(),
      targetRatio: ratio,
      budget: g.budget,
      isSource: g.isSource ?? defaultGroup?.isSource,
    };
  });

  // One-time source-group migration: inject 當月薪資 source group when absent
  const hasSource = migrated.some((g: any) => g.isSource);
  if (!hasSource) {
    const sourceDefault = DEFAULT_ACCOUNT_GROUPS.find((g) => g.isSource);
    // Rename legacy 長期儲蓄 -> 儲蓄資金
    migrated = migrated.map((g: any) =>
      g.id === '3' && g.name === '長期儲蓄'
        ? {
            ...g,
            name: '儲蓄資金',
            description: '儲蓄資金：存入銀行或作為緊急預備金，確保財務安全。',
          }
        : g
    );
    // Salary/income categories move off 日常開銷 into the source group
    migrated = migrated.map((g: any) =>
      g.id === '1'
        ? {
            ...g,
            categories: (g.categories || []).filter(
              (c: any) => c.type !== 'income'
            ),
          }
        : g
    );
    if (sourceDefault) {
      migrated = [{ ...sourceDefault }, ...migrated];
    }
    // Deprecated bound-category list is removed
    localStorage.removeItem('keep_accounts_allocation_categories');

    // Validate legacy non-source target ratios sum to 100% after source-group
    // injection. For modern data that already has a source group, keep the
    // user-authored ratios as persisted.
    const nonSource = migrated.filter((g: any) => !g.isSource);
    const sum = nonSource.reduce(
      (s: number, g: any) => s + (g.targetRatio || 0),
      0
    );
    if (sum !== 100) {
      const isCanonical =
        nonSource.length === 3 &&
        migrated.some((g: any) => g.id === '1') &&
        migrated.some((g: any) => g.id === '2') &&
        migrated.some((g: any) => g.id === '3');
      if (isCanonical) {
        migrated = migrated.map((g: any) => {
          if (g.isSource) return g;
          let r = 0;
          if (g.id === '1') r = 30;
          else if (g.id === '2') r = 30;
          else if (g.id === '3') r = 40;
          return { ...g, targetRatio: r };
        });
      } else {
        const count = nonSource.length || 1;
        const avg = Math.floor(100 / count);
        const remainder = 100 % count;
        let i = 0;
        migrated = migrated.map((g: any) => {
          if (g.isSource) return g;
          const r = avg + (i < remainder ? 1 : 0);
          i++;
          return { ...g, targetRatio: r };
        });
      }
    }
  }
  return migrated;
}
