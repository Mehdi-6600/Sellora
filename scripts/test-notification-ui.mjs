/** Frontend contract regression test. Requires a running dev server and Playwright.
 * Run: BASE_URL=http://localhost:3000 node scripts/test-notification-ui.mjs
 * Optional CHROMIUM_PATH / CHROMIUM_ARGS for a system browser.
 * Creates a temporary component fixture route, always removed on completion.
 * API responses are mocked: this does NOT certify live database/Meta services.
 */
import { chromium } from 'playwright';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import assert from 'node:assert/strict';
const fixture = new URL('../src/app/ui-notification-check/', import.meta.url);
const base = process.env.BASE_URL || 'http://localhost:3000';
let browser;
let created = false;
try {
  await mkdir(fixture);
  created = true;
  await writeFile(new URL('page.tsx', fixture), `
import { NotificationBell } from '@/components/layout/notification-bell';
import { MarkAllReadButton } from '@/components/notifications/mark-all-read';
import { NotificationItem } from '@/components/notifications/notification-item';
export default function Fixture() { return <main>
<NotificationBell unread={2} label="Notifications" />
<MarkAllReadButton label="Read all" />
<NotificationItem n={{id:'test-notice', kind:'SYSTEM', title:'Test notice', body:'Test', href:'/ui-notification-check?opened=1', readAt:null, createdAt:'2026-10-08T00:00:00Z', relativeTime:'Now', tone:'blue', icon:'!'}} />
</main>; }
`);
  browser = await chromium.launch({ headless:true,
    ...(process.env.CHROMIUM_PATH ? { executablePath:process.env.CHROMIUM_PATH } : {}),
    args: JSON.parse(process.env.CHROMIUM_ARGS || '[]'),
  });
  const page = await browser.newPage();
  let unread=2, fail=false, calls=0;
  await page.route('**/api/notifications', route => route.fulfill({json:{ok:true,unread,items:[]}}));
  await page.route('**/api/notifications/read-all', async route => {
    calls++;
    if (fail) return route.fulfill({status:500,json:{error:'test failure'}});
    // Delay exercises pending/duplicate-submit behavior.
    await new Promise(resolve=>setTimeout(resolve,200));
    unread=0;
    return route.fulfill({json:{ok:true,updated:2}});
  });
  await page.route('**/api/notifications/test-notice/read', route => {
    if (fail) return route.fulfill({status:500,json:{error:'test failure'}});
    unread--;
    return route.fulfill({json:{ok:true}});
  });
  const bell=page.locator('a[href="/notifications"]');
  await page.goto(base+'/ui-notification-check',{waitUntil:'networkidle'});
  assert.equal(await bell.locator('span').count(),1);
  fail=true;
  await page.getByRole('button',{name:'Read all'}).click();
  await page.waitForTimeout(300);
  assert.equal(await bell.locator('span').count(),1, 'Failed write must not clear badge');
  assert(await page.getByRole('status').innerText(), 'Failed write needs feedback');
  await page.getByRole('link',{name:/Test notice/}).click();
  await page.waitForTimeout(300);
  assert(!page.url().includes('opened=1'), 'Failed per-item read must offer retry');
  fail=false;
  await page.getByRole('button',{name:'Read all'}).click();
  assert(await page.getByRole('button').isDisabled(), 'Disable during request');
  await page.waitForFunction(()=>!document.querySelector('a[href="/notifications"] span'));
  assert.equal(calls,2);
  // A cached server prop still says 2; remount must reconcile with the API's 0.
  await page.reload({waitUntil:'networkidle'});
  assert.equal(await bell.locator('span').count(),0, 'Stale server prop reconciles');
  unread=2;
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await page.waitForFunction(()=>!!document.querySelector('a[href="/notifications"] span'));
  await page.getByRole('link',{name:/Test notice/}).click();
  await page.waitForURL('**/ui-notification-check?opened=1');
  await page.waitForLoadState('networkidle');
  assert.equal(unread,1, 'Single read updates server contract before navigation');
  console.log('PASS: read-all, pending, failed writes, per-item read, stale count, focus reconciliation');
} finally {
  await browser?.close();
  if (created) {
    await rm(fixture,{recursive:true,force:true});
    await rm(new URL('../.next/types/app/ui-notification-check/', import.meta.url),{recursive:true,force:true});
  }
}
