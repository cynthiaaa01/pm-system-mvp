import { test, expect } from '@playwright/test';

test.describe('API Integrations & Cron', () => {
  test('should reject unauthorized cron requests', async ({ request }) => {
    // 呼叫 cron API，不帶 auth header
    const response = await request.get('/api/cron/weekly-report');
    
    // 如果有設定 CRON_SECRET，應該會回傳 401
    // (如果本地沒有設定 CRON_SECRET，可能會直接跑 200 或 500)
    if (process.env.CRON_SECRET) {
      expect(response.status()).toBe(401);
    }
  });

  // 如果您想測試正確的 Cron API，可以在下面測試 (但因為這會真的上傳到 OneDrive，建議在此只做註解或條件式測試)
  /*
  test('should generate weekly report', async ({ request }) => {
    const response = await request.get('/api/cron/weekly-report', {
      headers: {
        Authorization: `Bearer ${process.env.CRON_SECRET}`,
      }
    });
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    expect(data.success).toBeTruthy();
    expect(data.url).toBeDefined();
  });
  */
});
