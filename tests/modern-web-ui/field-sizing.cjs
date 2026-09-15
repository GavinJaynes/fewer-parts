// Run with Playwright available to Node. Uses installed Chrome by default.
const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const { pathToFileURL } = require('node:url');
const path = require('node:path');

(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    const url = pathToFileURL(path.resolve(__dirname, '../../skills/modern-web-ui/assets/field-sizing.html')).href;
    await page.goto(url);
    const field = page.getByRole('textbox', { name: 'Your message' });
    const size = () => field.evaluate(el => ({ height: el.offsetHeight, scroll: el.scrollHeight, client: el.clientHeight }));
    const native = await page.evaluate(() => CSS.supports('field-sizing', 'content'));
    const empty = await size();
    await page.getByRole('button', { name: 'Long text', exact: true }).click();
    const long = await size();
    assert(long.scroll > long.client, 'Long content must remain scrollable');
    if (native) assert(long.height > empty.height, 'Native field must grow');
    await field.fill('Short again');
    if (native) assert((await size()).height < long.height, 'Deleting content must shrink native field');
    await page.getByRole('button', { name: 'Clear', exact: true }).click();
    assert.equal(await field.inputValue(), '');
    await page.getByLabel('Use fallback').check();
    const fallbackEmpty = await size();
    await field.fill('A long line\n'.repeat(100));
    const fallbackLong = await size();
    assert.equal(fallbackLong.height, fallbackEmpty.height, 'Fallback should keep its preferred height');
    assert(fallbackLong.scroll > fallbackLong.client, 'Fallback must scroll long content');
    await field.evaluate(el => { el.scrollTop = el.scrollHeight; });
    assert(await field.evaluate(el => el.scrollTop > 0), 'Fallback content must be reachable');
    await page.getByLabel('Use fallback').uncheck();
    await page.setViewportSize({ width: 375, height: 900 });
    await page.getByRole('button', { name: 'Unbroken text' }).click();
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'No page overflow on narrow screens');
    await field.focus();
    await page.keyboard.press('Tab');
    assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Short text');
    assert.equal(await page.locator('#source').textContent(), await page.locator('#recipe').evaluate(el => el.textContent.trim()));
    assert.deepEqual(errors, [], 'No browser script errors');
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const base = await noJS.newPage();
    await base.goto(url);
    const baseField = base.getByRole('textbox', { name: 'Your message' });
    await baseField.fill('Works without JavaScript');
    assert.equal(await baseField.inputValue(), 'Works without JavaScript');
    await noJS.close();
    console.log(`Passed: ${browser.version()}, native field-sizing=${native}; growth/deletion, bounded overflow, fallback scrolling, narrow layout, keyboard, shared source, no-JS editing.`);
  } finally {
    await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
