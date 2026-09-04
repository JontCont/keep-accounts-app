import { expect, test } from '@playwright/test';
import {
  captureCheckpoint,
  clickBottomNav,
  importTemplateData,
  setIonInputValue,
} from './module-helpers';

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

  test('keeps the date picker and installment form usable in a short mobile viewport', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 480 });
    await page.goto('/');
    await importTemplateData(page);

    await clickBottomNav(page, '明細');
    await page.getByTitle('新增記帳').click();
    await page.getByRole('button', { name: '分期記帳' }).click();

    await page.getByRole('button', { name: '基本', exact: true }).click();
    const datetimeButton = page.locator('ion-datetime-button[datetime="tx-datetime"]');
    await expect(datetimeButton).toBeVisible();
    await datetimeButton.click();

    const dateDialog = page.getByRole('dialog');
    await expect(dateDialog).toBeVisible();
    await expect(
      dateDialog.locator('ion-datetime .calendar-day:not([disabled]):not(.calendar-day-adjacent-day)').first()
    ).toBeVisible();
    await captureCheckpoint(page, testInfo, 'history-mobile-date-picker');
    await page.keyboard.press('Escape');

    await page.getByRole('button', { name: '分期', exact: true }).click();
    const installmentName = page.locator('ion-input[placeholder="例如: 手機分期、家電分期"]');
    await installmentName.locator('input').focus();
    await setIonInputValue(page, '例如: 手機分期、家電分期', 'Mobile installment');
    await setIonInputValue(page, '輸入分期總額', '1200');
    await setIonInputValue(page, '例如: 12', '3');

    const fields = page.locator('.transaction-entry-fields');
    await expect(fields).toBeVisible();
    const canScroll = await fields.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
      return element.scrollTop > 0 && element.scrollHeight > element.clientHeight;
    });
    expect(canScroll).toBe(true);

    await page.getByRole('switch').click();
    await expect(page.getByText('通知標題')).toBeVisible();
    await fields.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect(page.getByRole('button', { name: '儲存' })).toBeVisible();
    await captureCheckpoint(page, testInfo, 'history-mobile-installment-entry');

    await page.getByRole('button', { name: '儲存' }).click();
    await expect(page.getByText('Mobile installment')).toBeVisible();
  });
});
