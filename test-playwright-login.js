const { chromium } = require('playwright');
require('dotenv').config({ path: '.env.local' });

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  page.on('request', request => {
    if (request.url().includes('token?grant_type=password')) {
      console.log('Sending login request:', request.postData());
    }
  });

  page.on('response', async response => {
    if (response.url().includes('token?grant_type=password')) {
      console.log('Login response status:', response.status());
      console.log('Login response body:', await response.text());
    }
  });

  await page.goto('http://localhost:3000/login');
  
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  await page.waitForTimeout(3000);
  await browser.close();
})();
