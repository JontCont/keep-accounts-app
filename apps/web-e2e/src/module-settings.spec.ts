import { expect, test } from '@playwright/test';
import { captureCheckpoint, clickBottomNav } from './module-helpers';

test.describe('Settings module', () => {
  test('runs backup export action flow', async ({ page }, testInfo) => {
    await page.goto('/');
    await clickBottomNav(page, '設定');
    await expect(page.getByRole('heading', { name: '系統設定' })).toBeVisible();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByRole('button', { name: '匯出資料備份 (.zip)' }).click(),
    ]);

    expect(download.suggestedFilename()).toMatch(/^backup_\d{8}\.zip$/);
    await captureCheckpoint(page, testInfo, 'settings-after-backup-action');
  });
});
