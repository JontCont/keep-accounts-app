import { expect, test } from '@playwright/test';
import { captureCheckpoint, clickBottomNav, importTemplateData } from './module-helpers';

test.describe('Stats module', () => {
  test('switches account group scope and keeps stats stable', async ({ page }, testInfo) => {
    await page.goto('/');
    await importTemplateData(page);

    await clickBottomNav(page, '分析');
    await expect(page.getByRole('heading', { name: '支出統計分析' })).toBeVisible();

    const scopeSelect = page.locator('ion-select').first();
    await expect(scopeSelect).toBeVisible();

    const beforeCountText =
      (await page.locator('text=/\\d+ 筆/').first().textContent()) ?? '';

    await scopeSelect.evaluate((el) => {
      const host = el as HTMLIonSelectElement & { value: string };
      host.value = '2';
      host.dispatchEvent(
        new CustomEvent('ionChange', {
          detail: { value: '2' },
          bubbles: true,
          composed: true,
        })
      );
    });

    await page.waitForTimeout(300);
    const afterCountText =
      (await page.locator('text=/\\d+ 筆/').first().textContent()) ?? '';

    const selectedValue = await scopeSelect.evaluate(
      (el) => (el as HTMLIonSelectElement & { value: string }).value
    );
    expect(selectedValue).toBe('2');
    expect(beforeCountText.length).toBeGreaterThan(0);
    expect(afterCountText.length).toBeGreaterThan(0);

    await captureCheckpoint(page, testInfo, 'stats-after-group-switch');
  });
});
