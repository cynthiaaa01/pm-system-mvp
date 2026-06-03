import { test, expect } from '@playwright/test';
import { PREDEFINED_TAGS } from '@/lib/constants';

test.describe('Global Search Page', () => {
  test('should load search page and perform a search', async ({ page }) => {
    await page.goto('/dashboard/search');
    
    // 檢查標題
    await expect(page.locator('h1', { hasText: '知識庫與全域搜尋' })).toBeVisible();
    
    // 檢查輸入框
    const searchInput = page.getByPlaceholder('輸入專案名稱、客戶名稱或任何任務關鍵字...');
    await expect(searchInput).toBeVisible();
    
    // 輸入關鍵字
    await searchInput.fill('測試');
    
    // 等待 debounce (500ms) 與 API 回應
    // 我們可以等 "搜尋結果" 這個詞出現
    const resultsTitle = page.locator('h2', { hasText: '搜尋結果' });
    await expect(resultsTitle).toBeVisible({ timeout: 5000 });
  });

  test('should filter by predefined tags', async ({ page }) => {
    await page.goto('/dashboard/search');
    
    // 找一個預設標籤點擊
    const targetTag = PREDEFINED_TAGS[0];
    const tagButton = page.locator('button', { hasText: targetTag });
    
    await tagButton.click();
    
    // 等待 debounce 觸發搜尋
    const resultsTitle = page.locator('h2', { hasText: '搜尋結果' });
    await expect(resultsTitle).toBeVisible({ timeout: 5000 });
    
    // 確認按鈕狀態改變 (有選取狀態)
    await expect(tagButton).toHaveCSS('color', 'rgb(255, 255, 255)'); // white
  });
});
