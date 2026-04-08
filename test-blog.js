const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push('PAGE ERROR: ' + err.message));
  await page.goto('http://localhost:3000/index.html');
  await page.waitForTimeout(2000);
  const title = await page.title();
  const articleCount = await page.locator('.article-card').count();
  console.log('标题:', title);
  console.log('文章数量:', articleCount);
  console.log('控制台错误:', errors.length === 0 ? '无' : errors.join('; '));
  // 测试全部按钮
  await page.click('.tag-btn[data-tag="全部"]');
  await page.waitForTimeout(500);
  const afterClick = await page.locator('.article-card').count();
  console.log('点击全部后文章数:', afterClick);
  // 测试标签筛选
  await page.click('.tag-btn[data-tag="技术"]');
  await page.waitForTimeout(500);
  const techCount = await page.locator('.article-card').count();
  console.log('点击技术标签后:', techCount);
  await browser.close();
  console.log('测试完成');
})();
