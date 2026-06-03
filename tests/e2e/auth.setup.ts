import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // 導覽到登入頁面
  await page.goto('/login');
  
  // 請確保在 .env.local 裡有這兩組變數，或者這裡先寫死一個測試帳號
  // 這組帳號必須真實存在於您的 Supabase 中
  const email = process.env.TEST_EMAIL!;
  const password = process.env.TEST_PASSWORD!;

  console.log(`Attempting login with email: '${email}', password length: ${password?.length}`);

  // 填寫登入表單 (根據您實際的 Login 元件 input 的 name 或 placeholder 定位)
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // 等待網路空閒或嘗試捕捉登入錯誤
  await page.waitForTimeout(2000);
  const errorMsg = page.locator('.login-error');
  if (await errorMsg.isVisible()) {
    const text = await errorMsg.textContent();
    throw new Error(`Login failed: ${text}. Please check TEST_EMAIL and TEST_PASSWORD in .env.local.`);
  }

  // 等待登入成功並導覽回儀表板 (只要路徑包含 dashboard 即可)
  await page.waitForURL(/.*\/dashboard.*/);

  // 將登入狀態儲存起來，這樣後續的測試就不需要重新登入了
  await page.context().storageState({ path: authFile });
});
