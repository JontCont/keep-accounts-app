import { expect, Page, TestInfo } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

export const captureCheckpoint = async (
  page: Page,
  testInfo: TestInfo,
  checkpointName: string
) => {
  const checkpointDir = path.join(
    process.cwd(),
    'test-output',
    'playwright',
    'checkpoints'
  );
  fs.mkdirSync(checkpointDir, { recursive: true });
  const safeName = checkpointName.replace(/[^a-zA-Z0-9-_]/g, '-');
  const filePath = path.join(
    checkpointDir,
    `${testInfo.project.name}-${safeName}.png`
  );
  await page.screenshot({ path: filePath, fullPage: true });
};

export const importTemplateData = async (page: Page) => {
  page.once('dialog', (dialog) => {
    void dialog.accept();
  });
  await clickBottomNav(page, '設定');
  await expect(page.getByRole('heading', { name: '系統設定' })).toBeVisible();
  await page.getByRole('button', { name: '導入範例模板資料' }).click();
  await page.waitForTimeout(700);
  await expect(page.getByRole('heading', { name: 'Keep Accounts' })).toBeVisible();
};

export const setIonInputValue = async (
  page: Page,
  placeholder: string,
  value: string
) => {
  const ionInput = page.locator(`ion-input[placeholder="${placeholder}"]`).first();
  await expect(ionInput).toBeVisible();
  await ionInput.evaluate((el, nextValue) => {
    const host = el as HTMLIonInputElement & { value: string };
    host.value = nextValue as string;
    host.dispatchEvent(
      new CustomEvent('ionInput', {
        detail: { value: nextValue },
        bubbles: true,
        composed: true,
      })
    );
  }, value);
};

export const clickBottomNav = async (page: Page, label: '總覽' | '明細' | '分析' | '設定') => {
  await page.getByTestId('bottom-nav').getByRole('button', { name: label }).click();
};
