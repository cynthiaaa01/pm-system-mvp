import { test, expect } from '@playwright/test';

test.describe('Project Detail Page', () => {
  test('should load project details and switch tabs', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    // 等待專案列表載入
    const projectCard = page.locator('.project-card').first();
    const noProjectMsg = page.locator('text=沒有符合條件的專案');
    
    // 同時等待兩者之一出現
    await Promise.race([
      expect(projectCard).toBeVisible({ timeout: 10000 }),
      expect(noProjectMsg).toBeVisible({ timeout: 10000 })
    ]);

    // 如果沒有專案，就直接結束測試
    if (await noProjectMsg.isVisible()) {
      return;
    }

    // 點擊第一個專案
    await projectCard.click();
    
    // 確認已經進入專案詳情頁
    await expect(page).toHaveURL(/.*\/dashboard\/projects\/.*/);
    
    // 檢查 Tabs 是否存在
    const tasksTab = page.locator('button', { hasText: '任務清單' });
    const ganttTab = page.locator('button', { hasText: '專案排程 (甘特圖)' });
    const activityTab = page.locator('button', { hasText: '動態更新' });
    
    await expect(tasksTab).toBeVisible();
    await expect(ganttTab).toBeVisible();
    await expect(activityTab).toBeVisible();

    // 切換到甘特圖
    await ganttTab.click();
    await expect(page.locator('h3', { hasText: '專案排程甘特圖' })).toBeVisible();
    
    // 切換到動態更新
    await activityTab.click();
    await expect(page.locator('h3', { hasText: '發佈新動態' })).toBeVisible();
  });

  test('should add and remove a custom tag', async ({ page }) => {
    await page.goto('/dashboard/projects');
    
    const projectCard = page.locator('.project-card').first();
    const noProjectMsg = page.locator('text=沒有符合條件的專案');
    
    await Promise.race([
      expect(projectCard).toBeVisible({ timeout: 10000 }),
      expect(noProjectMsg).toBeVisible({ timeout: 10000 })
    ]);

    if (await noProjectMsg.isVisible()) {
      return;
    }

    await projectCard.click();
    
    // 點擊新增標籤按鈕
    const addTagBtn = page.locator('button', { hasText: '+ 新增標籤' }).or(page.locator('button', { hasText: '完成' }));
    await addTagBtn.click();
    
    // 輸入自訂標籤
    const tagInput = page.getByPlaceholder('輸入後按 Enter...');
    await expect(tagInput).toBeVisible();
    
    const testTag = `TestTag_${Date.now()}`;
    await tagInput.fill(testTag);
    await tagInput.press('Enter');
    
    // 等待新增完成並檢查是否顯示在畫面上
    const newTagEl = page.locator('span', { hasText: testTag });
    await expect(newTagEl).toBeVisible();
    
    // 點擊刪除 (x 按鈕)
    const removeBtn = newTagEl.locator('button');
    await removeBtn.click();
    
    // 確保已被移除
    await expect(newTagEl).not.toBeVisible();
  });
});
