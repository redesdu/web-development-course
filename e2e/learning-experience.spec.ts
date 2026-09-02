import { expect, test, type Page } from '@playwright/test';

function collectRuntimeErrors(page: Page) {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(() => ({
    viewport: window.innerWidth,
    document: document.documentElement.scrollWidth,
    body: document.body.scrollWidth,
  }));
  expect(overflow.document, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport + 1);
  expect(overflow.body, JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.viewport + 1);
}

test('the course path and previous or next navigation stay coherent', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /A place to work things out/ })).toBeVisible();
  const homeUrl = page.url();
  await page.getByRole('link', { name: 'Browse modules' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect(page).toHaveURL(homeUrl);
  await page.getByRole('link', { name: /Start learning/ }).click();
  await expect(page.getByRole('heading', { name: 'Change one value' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: /Next module Choose a route/ }).click();
  await expect(page.getByRole('heading', { name: 'Choose a route' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: /Previous module Change one value/ }).click();
  await expect(page.getByRole('heading', { name: 'Change one value' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('a fresh MCQ is empty, supports retry, and restores by stable state', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/example-explanation');

  await expect(page.getByRole('heading', { name: /A choice matters/ })).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();

  await page.getByRole('button', { name: 'Makes thinking visible' }).click();
  await page.getByRole('button', { name: 'Next case' }).click();
  await page.getByRole('button', { name: 'Mostly exposure' }).click();
  await page.getByRole('button', { name: 'Next case' }).click();
  await page.getByRole('button', { name: 'Makes thinking visible' }).click();
  await page.getByRole('button', { name: 'Finish activity' }).click();
  await expect(page.getByRole('heading', { name: '3 of 3 correct' })).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();

  const radios = page.getByRole('radio');
  await expect(radios).toHaveCount(3);
  for (let index = 0; index < 3; index += 1) await expect(radios.nth(index)).not.toBeChecked();
  await expect(page.getByRole('button', { name: 'Check answer' })).toBeDisabled();

  await page.getByText('Animate every heading as it enters the screen.').click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/reveals nothing about the learner's reasoning/)).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('radio', { name: /predict what one changed value/ }).focus();
  await page.keyboard.press('Space');
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/prediction records the learner's current rule/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('radio', { name: /predict what one changed value/ })).toBeChecked();
  await expect(page.getByText(/prediction records the learner's current rule/)).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Review answers' }).click();
  await expect(page.getByText(/retrieves a model, tests it/)).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('mobile course navigation opens, moves, and closes without hiding the page', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'));
  const errors = collectRuntimeErrors(page);
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'Toggle course navigation' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Course navigation' })
    .getByRole('link', { name: '02 Choose a route', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'Choose a route' })).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});
