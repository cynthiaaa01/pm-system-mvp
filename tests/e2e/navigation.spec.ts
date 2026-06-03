import { test, expect } from '@playwright/test';

test.describe('Sidebar Navigation', () => {
  test('should navigate to all main pages correctly', async ({ page }) => {
    await page.goto('/dashboard/projects');

    // 檢查「動態牆」
    await page.click('text=動態牆');
    await expect(page).toHaveURL(/.*\/dashboard\/activity/);
    await expect(page.locator('h1', { hasText: '動態總覽' })).toBeVisible();

    // 檢查「行銷日曆」
    await page.click('text=行銷日曆');
    await expect(page).toHaveURL(/.*\/dashboard\/calendar/);
    await expect(page.locator('h1', { hasText: '全域行銷檔期' })).toBeVisible();

    // 檢查「全域搜尋」
    await page.click('text=全域搜尋');
    await expect(page).toHaveURL(/.*\/dashboard\/search/);
    await expect(page.locator('h1', { hasText: '知識庫與全域搜尋' })).toBeVisible();

    // 檢查「專案管理」
    await page.click('text=專案管理');
    await expect(page).toHaveURL(/.*\/dashboard\/projects/);
    await expect(page.locator('h1', { hasText: '專案管理' })).toBeVisible();
  });
});
