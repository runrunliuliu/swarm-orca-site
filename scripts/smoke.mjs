import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = (process.env.PREVIEW_URL || 'http://127.0.0.1:4321').replace(/\/$/, '') + '/';
const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
await mkdir('artifacts', { recursive: true });
const routes = ['', 'research/', 'research/multi-agent-mailbox-and-actor-mailbox/', 'research/collective-dependence/', 'research/parallel-to-coordination/', 'about/', '404.html'];
const removedArticleRoutes = ['research/verifiable-collaboration/', 'research/task-context/'];
const errors = [];
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [1440, 390, 320]) {
      const page = await browser.newPage({ viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce' });
      page.on('pageerror', error => errors.push(error.message));
      for (const route of routes) {
        const response = await page.goto(root + route);
        assert(response?.ok(), `${route}: HTTP ${response?.status()}`);
        await page.evaluate(() => document.fonts.ready);
        await page.locator('img').evaluateAll(images => Promise.all(images.map(image => { image.loading = 'eager'; return image.decode(); })));
        assert.equal(await page.locator('h1').count(), 1, `${route}: single heading`);
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${route}: overflow at ${width}`);
        assert.equal(await page.locator('img').evaluateAll(images => images.some(image => !image.complete || image.naturalWidth === 0)), false, `${route}: missing image`);
        assert.equal(await page.locator('body').evaluate(body => /[—–]/.test(body.innerText)), false, `${route}: copy check`);
        const broken = await page.locator('a[href*="#"]').evaluateAll(links => links.filter(link => link.pathname === location.pathname && link.hash && !document.getElementById(decodeURIComponent(link.hash.slice(1)))).map(link => link.href));
        assert.deepEqual(broken, [], `${route}: broken anchors`);
        if (width !== 320 && ['', 'research/multi-agent-mailbox-and-actor-mailbox/', 'research/collective-dependence/', 'research/parallel-to-coordination/'].includes(route)) {
          const name = route === '' ? 'home' : route.includes('mailbox') ? 'mailbox' : route.includes('collective') ? 'collective' : 'article';
          await page.screenshot({ path: `artifacts/${name}-${width}-${colorScheme}.png`, fullPage: true });
        }
      }
      await page.goto(root + 'research/');
      await page.locator('#search').fill('不存在的关键词');
      assert(await page.locator('#empty').isVisible());
      await page.locator('#search').fill('协调');
      assert.equal(await page.locator('.article-row:visible').count(), 1);
      await page.locator('#search').fill('');
      assert.equal(await page.locator('.article-row:visible').count(), 3);
      await page.goto(root + 'research/parallel-to-coordination/');
      if (width < 1024) {
        assert.equal(await page.locator('.toc details').getAttribute('open'), null);
        await page.locator('.toc summary').click();
        assert(await page.locator('.toc nav').isVisible());
      }
      console.log(`PASS ${colorScheme} ${width}px: ${routes.length} pages, search, anchors, navigation`);
      await page.close();
    }
  }
  const page = await browser.newPage();
  const links = new Set();
  for (const route of routes) {
    await page.goto(root + route);
    for (const href of await page.locator('a').evaluateAll(items => items.map(item => item.href))) {
      if (href.startsWith(root)) links.add(href.split('#')[0]);
    }
  }
  for (const href of links) assert((await page.request.get(href)).ok(), `Broken internal link: ${href}`);
  for (const route of removedArticleRoutes) assert.equal((await page.request.get(root + route)).status(), 404, `${route}: removed article must stay unavailable`);
  assert.deepEqual(errors, [], 'Browser errors');
  console.log(`PASS ${links.size} internal link targets; no browser errors`);
} finally {
  await browser.close();
}
