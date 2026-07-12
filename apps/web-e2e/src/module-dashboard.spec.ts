import { expect, test } from '@playwright/test';
import {
  captureCheckpoint,
  clickBottomNav,
  importTemplateData,
  setIonInputValue,
} from './module-helpers';

test.describe('Dashboard module', () => {
  test('adds a transaction and verifies dashboard state', async ({ page }, testInfo) => {
    await page.goto('/');
    await importTemplateData(page);

    await clickBottomNav(page, '明細');
    await expect(page.getByRole('heading', { name: '歷史交易明細' })).toBeVisible();
    await page.getByTitle('新增記帳').click();
    await page.getByRole('button', { name: '一般記帳' }).click();

    await setIonInputValue(page, '例如: 買咖啡、午餐、薪水', 'Playwright Dashboard Tx');
    await setIonInputValue(page, '輸入金額', '123');
    await page.getByRole('button', { name: '儲存' }).click();

    await clickBottomNav(page, '總覽');
    await expect(page.getByRole('heading', { name: 'Keep Accounts' })).toBeVisible();
    await expect(page.getByText('Playwright Dashboard Tx')).toBeVisible();

    await captureCheckpoint(page, testInfo, 'dashboard-after-add-transaction');
  });
});
