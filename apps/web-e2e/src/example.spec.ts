import { test, expect } from '@playwright/test';
import { clickBottomNav } from './module-helpers';

test.describe('Module navigation smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('module navigation reaches dashboard history stats settings', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Keep Accounts' })).toBeVisible();
    await expect(page.getByTestId('bottom-nav')).toBeVisible();
    await clickBottomNav(page, '明細');
    await expect(page.getByRole('heading', { name: '歷史交易明細' })).toBeVisible();

    await clickBottomNav(page, '分析');
    await expect(page.getByRole('heading', { name: '支出統計分析' })).toBeVisible();

    await clickBottomNav(page, '設定');
    await expect(page.getByRole('heading', { name: '系統設定' })).toBeVisible();
    await clickBottomNav(page, '總覽');
    await expect(page.getByRole('heading', { name: 'Keep Accounts' })).toBeVisible();
  });
});
