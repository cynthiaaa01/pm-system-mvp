import { test, expect } from '@playwright/test';

test.describe('Marketing Calendar Page', () => {
  test('should load calendar and switch views', async ({ page }) => {
    await page.goto('/dashboard/calendar');
    
    // 檢查標題
    await expect(page.locator('h1', { hasText: '全域行銷檔期' })).toBeVisible();
    
    // 確認日曆元件有渲染出來
    const calendarContainer = page.locator('.rbc-calendar');
    await expect(calendarContainer).toBeVisible();

    // 測試切換視圖按鈕
    const monthBtn = page.locator('button', { hasText: 'Month' }).or(page.locator('button', { hasText: '月' }));
    const weekBtn = page.locator('button', { hasText: 'Week' }).or(page.locator('button', { hasText: '週' }));
    
    // 如果有渲染出來，至少要有按鈕
    if (await weekBtn.isVisible()) {
      await weekBtn.click();
      await expect(page.locator('.rbc-time-view')).toBeVisible(); // 週視圖會有 rbc-time-view
      
      await monthBtn.click();
      await expect(page.locator('.rbc-month-view')).toBeVisible(); // 月視圖
    }
  });
});
