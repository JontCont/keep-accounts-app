import { expect, test } from '@playwright/test';
import { captureCheckpoint, clickBottomNav, importTemplateData } from './module-helpers';

test.describe('History module', () => {
  test('applies income filter and keeps filtered list', async ({ page }, testInfo) => {
    await page.goto('/');
    await importTemplateData(page);

    await clickBottomNav(page, '明細');
    await expect(page.getByRole('heading', { name: '歷史交易明細' })).toBeVisible();

    await page.getByRole('button', { name: '收入' }).click();
    await expect(page.getByTestId('history-flat-row').first()).toBeVisible();

    const rowTexts = await page
      .getByTestId('history-flat-row')
      .evaluateAll((rows) => rows.map((row) => row.textContent ?? ''));
    expect(rowTexts.length).toBeGreaterThan(0);
    expect(rowTexts.every((text) => text.includes('+$'))).toBeTruthy();

    await captureCheckpoint(page, testInfo, 'history-after-filter');
  });
});
