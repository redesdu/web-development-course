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

async function completeCategoryCases(page: Page, choices: string[]) {
  for (const [index, choice] of choices.entries()) {
    await page.getByRole('button', { name: choice, exact: true }).click();
    await page.getByRole('button', { name: index === choices.length - 1 ? 'Finish activity' : 'Next case' }).click();
  }
}

test('the course path and previous or next navigation stay coherent', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Web Development', exact: true })).toBeVisible();
  const homeUrl = page.url();
  await page.getByRole('link', { name: 'Browse modules' }).click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await expect(page).toHaveURL(homeUrl);
  await page.getByRole('link', { name: /Start learning/ }).click();
  await expect(page.getByRole('heading', { name: 'HTTP intent, evidence, and CRUD' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: /Next module Quick check: web apps, HTTP, and CRUD/ }).click();
  await expect(page.getByRole('heading', { name: 'Quick check: web apps, HTTP, and CRUD' })).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(10);

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.getByRole('link', { name: /Previous module HTTP intent, evidence, and CRUD/ }).click();
  await expect(page.getByRole('heading', { name: 'HTTP intent, evidence, and CRUD' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('lecture navigation groups lessons and exercises with expandable sections', async ({ page }, testInfo) => {
  await page.goto('/#/');

  if (testInfo.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Toggle course navigation' }).click();
  }

  const lectureOne = page.getByRole('button', { name: /Lecture 1 Introduction to Web Development/ });
  const lectureTwo = page.getByRole('button', { name: /Lecture 2 HTML, CSS, and Layout/ });
  await expect(lectureOne).toHaveAttribute('aria-expanded', 'true');
  await expect(lectureTwo).toHaveAttribute('aria-expanded', 'false');

  await lectureOne.click();
  await expect(lectureOne).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('link', { name: /02 Quick check/ })).toHaveCount(0);

  await lectureTwo.click();
  await expect(page.getByRole('link', { name: /04 Practice: structure and style/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
});

test('the quick check gives feedback, allows retry, and restores a resolved answer', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/http-crud-quick-check');

  await expect(page.getByText('Which description best matches a web application?')).toBeVisible();
  await page.getByRole('radio', { name: 'Software that only runs after a local installation.' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).toContainText('local installation does not define a web app');
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('radio', { name: 'Software on a remote server that a browser accesses.' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).toContainText('browser accesses software running on a remote server');

  await page.reload();
  await expect(page.getByRole('radio', { name: 'Software on a remote server that a browser accesses.' })).toBeChecked();
  await expect(page.getByRole('status')).toContainText('browser accesses software running on a remote server');
  await expect(page.getByRole('button', { name: 'Continue' })).toBeEnabled();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the HTTP pilot explains errors, restores state, and requires transfer', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/http-intent-evidence-crud');

  await expect(page.getByRole('heading', { name: 'A click starts a conversation' })).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Read the evidence in the messages' })).toBeVisible();
  await page.getByRole('button', { name: /Continue/ }).click();

  await page.getByLabel('HTTP method').selectOption('get');
  await page.getByLabel('Target path').selectOption('reservation-item');
  await page.getByLabel('Response status family').selectOption('client-error');
  await page.getByRole('button', { name: 'Send this exchange' }).click();
  await expect(page.getByRole('status')).toContainText('One or more fields change the meaning.');
  await page.getByRole('button', { name: 'Revise exchange' }).click();
  await page.getByLabel('HTTP method').selectOption('post');
  await page.getByLabel('Target path').selectOption('reservation-collection');
  await page.getByLabel('Response status family').selectOption('success');
  await page.getByRole('button', { name: 'Send this exchange' }).click();
  await expect(page.getByRole('status')).toContainText('This exchange matches the intent.');

  await page.reload();
  await expect(page.getByLabel('HTTP method')).toHaveValue('post');
  await expect(page.getByRole('status')).toContainText('This exchange matches the intent.');
  await page.getByRole('button', { name: /Continue/ }).click();

  await page.getByLabel('Your explanation').fill('The browser sends a DELETE request. The server removes the saved item, returns a success response, and the browser updates the list.');
  await page.getByRole('button', { name: 'Compare explanation' }).click();
  await expect(page.getByRole('heading', { name: 'Compare these four parts' })).toBeVisible();
  await page.getByRole('button', { name: 'I compared all four parts' }).click();
  await expect(page.getByRole('status')).toContainText('Comparison complete.');
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: 'Module completed' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the pilot exposes its first transition and focus change to keyboard users', async ({ page }) => {
  await page.goto('/#/modules/http-intent-evidence-crud');
  const continueButton = page.getByRole('button', { name: /Continue/ });

  for (let press = 0; press < 20; press += 1) {
    if (await continueButton.evaluate((element) => document.activeElement === element)) break;
    await page.keyboard.press('Tab');
  }

  await expect(continueButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: 'Read the evidence in the messages' })).toBeFocused();
});

test('mobile course navigation opens, moves, and closes without hiding the page', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'));
  const errors = collectRuntimeErrors(page);
  await page.goto('/');

  const menu = page.getByRole('button', { name: 'Toggle course navigation' });
  await menu.click();
  await expect(menu).toHaveAttribute('aria-expanded', 'true');
  await page.getByRole('navigation', { name: 'Course navigation' })
    .getByRole('link', { name: '01 HTTP intent, evidence, and CRUD', exact: true })
    .click();
  await expect(page.getByRole('heading', { name: 'HTTP intent, evidence, and CRUD' })).toBeVisible();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('reset all progress requires confirmation and preserves the theme', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('interactive-learning:sdu-web-development-2026:v1:course:progress', '["http-intent-evidence-crud","http-crud-quick-check","html-structure-css-layout","html-css-practice"]');
    localStorage.setItem('interactive-learning:sdu-web-development-2026:v1:http-transfer:saved-restaurant-delete', '{"version":1,"text":"saved answer","submitted":true,"confirmed":true}');
    localStorage.setItem('interactive-learning:course-101:v1:learning-flow:http-intent-evidence-crud', '{"version":1,"currentStepId":"build-exchange"}');
    localStorage.setItem('sdu-learning-theme', 'dark');
    localStorage.setItem('unrelated-site-data', 'keep');
  });
  await page.reload();

  await expect(page.getByText('100%')).toBeVisible();
  if (testInfo.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Toggle course navigation' }).click();
  }
  await page.getByRole('button', { name: 'Reset all progress' }).click();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByText('100%')).toBeVisible();

  await page.getByRole('button', { name: 'Reset all progress' }).click();
  await page.getByRole('button', { name: 'Delete saved progress' }).click();

  await expect(page).toHaveURL(/\/#\/modules\/http-intent-evidence-crud$/);
  await expect(page.getByRole('heading', { name: 'A click starts a conversation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'A click starts a conversation, current step' })).toBeVisible();
  await page.goto('/#/');
  await expect(page.getByText('0%')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  const remaining = await page.evaluate(() => ({
    courseKeys: Object.keys(localStorage).filter((key) => key.startsWith('interactive-learning:sdu-web-development-2026:') || key.startsWith('interactive-learning:course-101:')),
    unrelated: localStorage.getItem('unrelated-site-data'),
  }));
  expect(remaining).toEqual({ courseKeys: [], unrelated: 'keep' });
});

test('reset from an active module returns to a fresh first step', async ({ page }, testInfo) => {
  await page.goto('/#/modules/http-intent-evidence-crud');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Build an exchange that matches the intent' })).toBeVisible();
  await page.getByLabel('HTTP method').selectOption('get');
  await page.getByLabel('Target path').selectOption('reservation-item');
  await page.getByLabel('Response status family').selectOption('client-error');
  await page.getByRole('button', { name: 'Send this exchange' }).click();
  await expect(page.getByRole('status')).toContainText('One or more fields change the meaning.');

  if (testInfo.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Toggle course navigation' }).click();
  }
  await page.getByRole('button', { name: 'Reset all progress' }).click();
  await page.getByRole('button', { name: 'Delete saved progress' }).click();

  await expect(page).toHaveURL(/\/#\/modules\/http-intent-evidence-crud$/);
  await expect(page.getByRole('heading', { name: 'A click starts a conversation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'A click starts a conversation, current step' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build an exchange that matches the intent' })).toBeDisabled();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'A click starts a conversation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Build an exchange that matches the intent' })).toBeDisabled();

  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByLabel('HTTP method')).toHaveValue('');
  await expect(page.getByLabel('Target path')).toHaveValue('');
  await expect(page.getByLabel('Response status family')).toHaveValue('');
  await expect(page.getByRole('status')).toHaveCount(0);

  await page.getByLabel('HTTP method').selectOption('post');
  await page.getByLabel('Target path').selectOption('reservation-collection');
  await page.getByLabel('Response status family').selectOption('success');
  await page.getByRole('button', { name: 'Send this exchange' }).click();
  await expect(page.getByRole('status')).toContainText('This exchange matches the intent.');
  await page.getByRole('button', { name: 'Continue' }).click();

  const newExplanation = 'The browser sends a DELETE request, the server removes the item, returns a success response, and the browser updates the saved list.';
  await page.getByLabel('Your explanation').fill(newExplanation);
  await page.getByRole('button', { name: 'Compare explanation' }).click();
  await expect(page.getByLabel('Your explanation')).toHaveValue(newExplanation);
  await expect(page.getByRole('heading', { name: 'Compare these four parts' })).toBeVisible();
});

test('the Lecture 2 lesson supports construction, diagnosis, transfer, and reload', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/html-structure-css-layout');
  await expect(page.getByRole('heading', { name: 'HTML structure and CSS layout' })).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Site navigation').selectOption('nav');
  await page.getByLabel('Primary page content').selectOption('main');
  await page.getByLabel('Independent news story').selectOption('article');
  await page.getByRole('button', { name: 'Check structure' }).click();
  await expect(page.getByRole('status')).toContainText('communicates each region');
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('radio', { name: 'Navy' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByRole('status')).toContainText('more specific');
  await page.getByRole('button', { name: 'Continue' }).click();

  await completeCategoryCases(page, ['Flexbox', 'Grid', 'display: none', 'visibility: hidden']);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Element for each announcement').selectOption('article');
  await page.getByLabel('Selector for the shared class').selectOption('.announcement');
  await page.getByLabel('Layout for rows and columns').selectOption('grid');
  await page.getByLabel('Why do these choices fit?').fill('Article communicates independent content, the class selector reaches each card, and Grid controls rows and columns.');
  await page.getByRole('button', { name: 'Check page plan' }).click();
  await expect(page.getByRole('status')).toContainText('connects meaning');
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: 'Module completed' })).toBeVisible();

  await page.reload();
  await expect(page.getByLabel('Selector for the shared class')).toHaveValue('.announcement');
  await expect(page.getByRole('status')).toContainText('connects meaning');
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the Lecture 2 practice mixes recall, classification, and application', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/html-css-practice');
  await expect(page.getByRole('heading', { name: 'Practice: structure and style a web page' })).toBeVisible();

  await completeCategoryCases(page, ['HTML', 'CSS', 'HTML', 'CSS', 'HTML', 'CSS']);
  await page.getByRole('button', { name: 'Continue' }).click();

  for (let index = 0; index < 5; index += 1) {
    await page.getByRole('button', { name: 'Show answer' }).click();
    await page.getByRole('button', { name: 'I recalled it' }).click();
    await page.getByRole('button', { name: index === 4 ? 'Finish deck' : 'Next card' }).click();
  }
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('radio', { name: 'GET' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();

  await completeCategoryCases(page, ['Matches', 'Does not match', 'Matches', 'Does not match', 'Matches']);
  await page.getByRole('button', { name: 'Continue' }).click();
  await completeCategoryCases(page, ['Flexbox', 'Grid', 'Padding', 'Margin', 'display: none', 'visibility: hidden']);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Common form method').selectOption('get');
  await page.getByLabel('Element for the controls').selectOption('form');
  await page.getByLabel('Selector for all results').selectOption('.result');
  await page.getByLabel('Explain how HTML and CSS divide the work.').fill('HTML gives the form and results meaning. CSS selects the result class and controls its presentation.');
  await page.getByRole('button', { name: 'Check application' }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByRole('heading', { name: 'Module completed' })).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the Lecture 2 modules preserve their task hierarchy at 320, 390, and desktop widths', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'));
  test.setTimeout(60_000);

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/#/modules/html-structure-css-layout');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Give a news page meaningful structure' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/tmp/html-css-study-${width}.png`, fullPage: true });

    await page.goto('/#/modules/html-css-practice');
    await expect(page.getByRole('heading', { name: 'Separate structure from presentation' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/tmp/html-css-practice-${width}.png`, fullPage: true });
  }
});
