/** Run against dev with a signed-in Playwright storage state from a local test account.
 * UI_AUTH_STATE=.cache/session.json node scripts/test-ui-smoke.mjs
 * Optional: BASE_URL, CHROMIUM_PATH, CHROMIUM_ARGS. Requires Playwright.
 * Screenshots are local artifacts; no test accounts or auth bypass are shipped.
 */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const base=process.env.BASE_URL || 'http://localhost:3000';
const browser=await chromium.launch({headless:true,
  ...(process.env.CHROMIUM_PATH ? {executablePath:process.env.CHROMIUM_PATH}:{}),
  args:JSON.parse(process.env.CHROMIUM_ARGS || '[]')});
const routes=['/dashboard','/more','/settings','/automations','/conversations','/products','/leads','/notifications','/onboarding','/settings/instagram','/settings/business','/settings/subscription','/products/import','/products?new=1','/settings/subscription/status','/settings/subscription/pay/MONTHLY','/why-sellora'];
await mkdir('.cache/ui-screenshots',{recursive:true});
try {
  const publicPage=await browser.newPage();
  for(const width of [320,390,1440]) {
    await publicPage.setViewportSize({width,height:900});
    for(const route of ['/','/why-sellora','/login','/signup']) {
      await publicPage.goto(base+route,{waitUntil:'networkidle'});
      assert.equal(await publicPage.locator('body').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(247, 249, 252)');
      assert(await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflows at ${width}`);
      await publicPage.screenshot({path:`.cache/ui-screenshots/public-${width}-${route.replaceAll('/','_')}.png`,fullPage:true});
    }
  }
  console.log('PASS public routes, light canvas, 320/390/1440px');
  if(!process.env.UI_AUTH_STATE) {console.log('SKIP authenticated routes: provide UI_AUTH_STATE');}
  else {
    const context=await browser.newContext({storageState:process.env.UI_AUTH_STATE});
    const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
    for(const width of [320,390,1440]) {
      await page.setViewportSize({width,height:900});
      for(const route of routes) {
        await page.goto(base+route,{waitUntil:'networkidle'});
        assert(!page.url().includes('/login'), 'Authentication required');
        assert(!(await page.locator('body').innerText()).includes('خطای موقت'),`${route} failed to render`);
        assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflows at ${width}`);
        if(width<1024 && route!='/why-sellora') assert(await page.locator('nav[aria-label="ناوبری اصلی موبایل"]').isVisible());
        await page.screenshot({path:`.cache/ui-screenshots/app-${width}-${route.replaceAll('/','_').replaceAll('?','_')}.png`,fullPage:true});
      }
    }
    await page.setViewportSize({width:390,height:844});
    await page.goto(base+'/dashboard');
    await page.locator('nav[aria-label="ناوبری اصلی موبایل"] a[href="/more"]').click();
    await page.locator('main a[href="/settings"]').click();
    await page.locator('header:visible a[aria-label="بازگشت"]').click();
    await page.waitForURL('**/more');
    assert.deepEqual(errors,[]);
    console.log('PASS authenticated routes 320/390/1440px; Dashboard → More → Settings → Back');
  }
} finally {await browser.close();}
