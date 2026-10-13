import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const start = async (page: Page) => {
  await page.goto('./');
  await page.getByRole('button', { name: '시작하기' }).click();
  await expect(page.getByRole('dialog', { name: '요셉의 시대' })).toBeVisible();
};

const recordMoment = (page: Page) => page.getByRole('button', { name: /연대기에 기록하고 계속/ }).click();

/** Progress is written to IndexedDB asynchronously; wait until the save reflects the screen. */
const waitForSavedEpisode = (page: Page, episodeId: string) => expect.poll(() => page.evaluate(() => new Promise<string | undefined>(resolve => {
  const open = indexedDB.open('keyval-store');
  open.onsuccess = () => {
    const request = open.result.transaction('keyval').objectStore('keyval').get('bible-chronicle.joseph.progress');
    request.onsuccess = () => resolve(request.result?.story?.episodeId);
    request.onerror = () => resolve(undefined);
  };
  open.onerror = () => resolve(undefined);
}))).toBe(episodeId);

test('plays from the era transition into the story and on to the next episode', async ({ page }) => {
  await start(page);
  const picture = page.getByRole('dialog').locator('img');
  await expect(picture).toHaveJSProperty('complete', true);
  expect(await picture.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await recordMoment(page);

  await expect(page.getByRole('heading', { level: 1, name: '편애와 형제 갈등' })).toBeVisible();
  // The rewritten narration (content/narration) replaces the S01D scene lines.
  await expect(page.getByText('열일곱 살 요셉은 형들과 함께 양을 치다가', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: '성경 원문 위치·자료 상태 확인' }).click();
  await expect(page.getByText('외부 사료 입증: 확인되지 않음')).toBeVisible();
  await page.getByRole('button', { name: /다른 것도 살펴보기/ }).click();
  await page.getByRole('button', { name: /이야기 계속/ }).click();
  await expect(page.getByText('이 결과는 어떤 선택으로도 바뀌지 않습니다.')).toBeVisible();
  await expect(page.locator('.outcome-text')).toHaveText('아버지의 편애를 본 형들은 요셉을 미워해, 그에게 다정한 말 한마디 건네지 못했다.');
  await page.getByRole('button', { name: /다음 이야기/ }).click();
  await expect(page.getByRole('heading', { level: 1, name: '두 꿈과 형제들의 반응' })).toBeVisible();
  await expect(page.getByRole('button', { name: /근거 1/ })).toBeVisible();
  await expect(page.getByRole('button', { name: '가문' })).toBeVisible();
  await expect(page.getByRole('button', { name: /연대기 1/ })).toBeVisible();
  // No sideways scrolling on any screen (docs/04).
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test('opening every branch shows the same outcome as opening none', async ({ browser }) => {
  const play = async (branches: string[]) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await start(page);
    await recordMoment(page);
    for (const name of branches) {
      await page.getByRole('button', { name }).click();
      await page.getByRole('button', { name: /다른 것도 살펴보기/ }).click();
    }
    await page.getByRole('button', { name: /이야기 계속/ }).click();
    const outcome = await page.locator('.outcome-text').innerText();
    await context.close();
    return outcome;
  };
  const none = await play([]);
  const all = await play(['기록된 행동의 관점 비교', '성경 원문 위치·자료 상태 확인', '지리와 계보 학습 카드 열기', '요셉에게 특별한 옷을 준 사람은?']);
  expect(all).toBe(none);
});

test('turning the device keeps the scene, and a reload resumes the story', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await start(page);
  await recordMoment(page);
  await page.getByRole('button', { name: '성경 원문 위치·자료 상태 확인' }).click();
  const art = page.locator('.art');
  const story = page.locator('.story');
  const portraitStacked = (await story.boundingBox())!.y > (await art.boundingBox())!.y + 50;
  expect(portraitStacked).toBe(true);

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.getByRole('heading', { name: '본문과 역사 입증 분리' })).toBeVisible();
  const side = (await story.boundingBox())!.x > (await art.boundingBox())!.x + 100;
  expect(side).toBe(true);

  await page.getByRole('button', { name: /이야기 계속/ }).click();
  await page.getByRole('button', { name: /다음 이야기/ }).click();
  await waitForSavedEpisode(page, 'ep-gen-117');
  await page.reload();
  await expect(page.getByRole('button', { name: '이어서 하기 (2 / 64)' })).toBeVisible();
});

test('works offline after the first visit', async ({ page, context }) => {
  await page.goto('./');
  // The first visit installs the service worker; it takes control of the page from the next load.
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => undefined));
  await page.reload();
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);

  await context.setOffline(true);
  await page.reload();
  await page.getByRole('button', { name: '시작하기' }).click();
  const picture = page.getByRole('dialog').locator('img');
  await expect(picture).toHaveJSProperty('complete', true);
  expect(await picture.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
});

test.describe('accessibility (axe: no serious or critical issues)', () => {
  const check = async (page: Page, where: string) => {
    const { violations } = await new AxeBuilder({ page }).analyze();
    const serious = violations.filter(violation => violation.impact === 'serious' || violation.impact === 'critical');
    expect(serious.map(violation => `${where}: ${violation.id} — ${violation.nodes.map(node => node.target.join(' ')).slice(0, 3).join(', ')}`)).toEqual([]);
  };

  test('title, moment, hub and dialogs', async ({ page }) => {
    await page.goto('./');
    await check(page, 'title');
    await page.getByRole('button', { name: '시작하기' }).click();
    await check(page, 'moment');
    await recordMoment(page);
    await check(page, 'hub');
    await page.getByRole('button', { name: '가문' }).click();
    await check(page, 'household');
  });
});
