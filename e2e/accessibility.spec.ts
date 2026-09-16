import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page, type TestInfo } from '@playwright/test';

async function scanPage(page: Page, testInfo: TestInfo, route: string) {
  await page.locator('main').waitFor({ state: 'visible' });
  // Scanning before the theme is on the root element measures a half-applied
  // palette and reports contrast failures that no visitor ever sees.
  await page.locator('html[data-theme]').waitFor({ state: 'attached' });
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
    .analyze();

  await testInfo.attach(`axe-${route.replace(/[^a-z0-9]+/gi, '-') || 'home'}`, {
    body: JSON.stringify(results, null, 2),
    contentType: 'application/json',
  });

  const summary = results.violations.map((violation) => ({
    id: violation.id,
    impact: violation.impact,
    help: violation.help,
    nodes: violation.nodes.map((node) => ({
      target: node.target,
      failure: node.failureSummary,
    })),
  }));
  expect(summary, `Automatically detectable accessibility violations at ${route}`).toEqual([]);
}

test('the home page and every registered module pass the automated accessibility scan', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await scanPage(page, testInfo, '/');

  const moduleRoutes = await page.locator('a[href*="#/modules/"]').evaluateAll((links) => (
    [...new Set(links.map((link) => (link as HTMLAnchorElement).hash))]
  ));

  expect(moduleRoutes.length, 'The course path should expose at least one registered module.').toBeGreaterThan(0);
  for (const route of moduleRoutes) {
    await page.goto(`/${route}`);
    await scanPage(page, testInfo, route);
  }

  // The course opens dark, so this covers the other theme the toggle reaches.
  await page.goto('/');
  await page.getByRole('button', { name: 'Switch to light mode' }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await scanPage(page, testInfo, '/ light mode');
});

test('the new interactive surfaces pass the automated accessibility scan', async ({ page }, testInfo) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });

  // The reference guide, with a section open.
  await page.goto('/#/modules/html-structure-css-layout');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByLabel('Site navigation').selectOption('nav');
  await page.getByLabel('Primary page content').selectOption('main');
  await page.getByLabel('Independent news story').selectOption('article');
  await page.getByRole('button', { name: 'Check structure' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByText('Forms and labels', { exact: true }).click();
  await expect(page.getByText(/it disappears as soon as the user types/)).toBeVisible();
  await scanPage(page, testInfo, 'html reference guide');

  // The ordering activity.
  await page.goto('/#/modules/http-crud-quick-check');
  await page.getByRole('radio', { name: /Bookings concentrate on one server/ }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('button', { name: 'Check this order' })).toBeVisible();
  await page.getByRole('button', { name: 'Check this order' }).click();
  await scanPage(page, testInfo, 'sequence ordering');

  // The revealed solution panel, reached after three wrong answers.
  await page.goto('/#/modules/html-css-practice');
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole('radio', { name: /using it everywhere is an improvement/ }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Try again' }).click();
  }
  await page.getByRole('button', { name: /Show solution and continue/ }).click();
  await expect(page.getByRole('heading', { name: 'Why this is the answer' })).toBeVisible();
  await scanPage(page, testInfo, 'assisted solution');

  // The HTML editor, its preview, and its check results.
  await page.getByTestId('assisted-continue').click();
  const advance = page.locator('.learning-flow-navigation').getByRole('button', { name: 'Continue' });
  for (const answer of [
    /Form A uses get so the filtered view has a shareable URL/,
    /Rust, because the selector with an id outranks/,
    /Grid, because aligning items across rows/,
  ]) {
    await advance.click();
    await page.getByRole('radio', { name: answer }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
  }
  await advance.click();
  await expect(page.getByLabel('Your HTML')).toBeVisible();
  await page.getByRole('button', { name: 'Check my HTML' }).click();
  await expect(page.getByText(/requirements met/)).toBeVisible();
  await scanPage(page, testInfo, 'html exercise');

  // The completion summary.
  await page.goto('/#/modules/http-intent-evidence-crud');
  await page.evaluate(() => {
    localStorage.setItem(
      'interactive-learning:sdu-web-development-2026:v1:learning-flow:http-intent-evidence-crud',
      JSON.stringify({
        version: 2,
        currentStepId: 'transfer-explanation',
        completedStepIds: ['trace-mechanism', 'read-messages', 'build-exchange', 'transfer-explanation'],
        stepOutcomes: {
          'trace-mechanism': 'independent',
          'read-messages': 'independent',
          'build-exchange': 'assisted',
          'transfer-explanation': 'independent',
        },
        finished: true,
      }),
    );
  });
  await page.reload();
  await expect(page.getByTestId('learning-flow-summary')).toBeVisible();
  await scanPage(page, testInfo, 'completion summary');
});
