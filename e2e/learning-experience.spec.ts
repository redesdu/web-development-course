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
  await page.getByRole('link', { name: /Next module Practice: reason about HTTP exchanges/ }).click();
  await expect(page.getByRole('heading', { name: 'Practice: reason about HTTP exchanges' })).toBeVisible();
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
  await expect(page.getByRole('link', { name: /01\.1 Practice: reason about HTTP/ })).toHaveCount(0);

  await lectureTwo.click();
  await expect(page.getByRole('link', { name: /02\.1 Practice: write the markup/ })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-theme', /light|dark/);
});

test('the Lecture 1 practice gives feedback, allows retry, and restores a resolved answer', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/http-crud-quick-check');

  await expect(page.getByText(/booking tool for lab equipment/)).toBeVisible();
  await page.getByRole('radio', { name: /Students will not need to install anything/ }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText('A benefit is not a trade-off.')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await page.getByRole('radio', { name: /Bookings concentrate on one server/ }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/That is the trade-off/)).toBeVisible();

  await page.reload();
  await expect(page.getByRole('radio', { name: /Bookings concentrate on one server/ })).toBeChecked();
  await expect(page.getByText(/That is the trade-off/)).toBeVisible();
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

  await page.getByLabel('Your explanation').fill('The browser sends a DELETE request naming restaurant 42, the server checks it and removes that saved item, then the response tells the browser to update the visible list.');
  await expect(page.getByTestId('written-answer-count')).toHaveText(/\d+ \/ 20 words/);
  await page.getByRole('button', { name: 'Compare explanation' }).click();
  await expect(page.getByRole('heading', { name: 'Compare these four parts' })).toBeVisible();
  await page.getByRole('button', { name: 'I compared all four parts' }).click();
  await expect(page.getByText('Comparison complete.')).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();

  const summary = page.getByTestId('learning-flow-summary');
  await expect(summary).toBeVisible();
  await expect(page.getByRole('heading', { name: /You finished HTTP intent, evidence, and CRUD/ })).toBeVisible();
  await expect(summary).toBeFocused();
  await expect(summary.getByRole('link', { name: /Back to course overview/ })).toBeVisible();
  await expect(summary.getByRole('link', { name: /Next module/ })).toBeVisible();
  await expect(page).toHaveURL(/modules\/http-intent-evidence-crud/);

  await page.reload();
  await expect(page.getByTestId('learning-flow-summary')).toBeVisible();

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
  await expect(page.getByRole('button', { name: /A click starts a conversation, current step/ })).toBeVisible();
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
  await expect(page.getByRole('button', { name: /A click starts a conversation, current step/ })).toBeVisible();
  // Steps stay reachable after a reset, but none of them is answered any more.
  await expect(page.getByRole('button', { name: /Build an exchange that matches the intent, not answered yet/ })).toBeEnabled();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'A click starts a conversation' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Build an exchange that matches the intent, not answered yet/ })).toBeEnabled();

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
  await expect(page.getByText(/communicates each region/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // The reference guide is a set of native disclosure sections.
  await expect(page.getByRole('heading', { name: 'The HTML you will keep looking up' })).toBeVisible();
  const placeholderRule = page.getByText(/it disappears as soon as the user types/);
  await expect(placeholderRule).toBeHidden();
  await page.getByText('Forms and labels', { exact: true }).click();
  await expect(placeholderRule).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('radio', { name: 'Navy' }).click();
  await page.getByRole('button', { name: 'Check answer' }).click();
  await expect(page.getByText(/p\.notice is more specific/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await expect(page.getByRole('heading', { name: 'From boxes to layout' })).toBeVisible();
  await expect(page.getByText(/box-sizing: border-box/).first()).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  await completeCategoryCases(page, ['Flexbox', 'Grid', 'display: none', 'visibility: hidden']);
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByLabel('Element for each announcement').selectOption('article');
  await page.getByLabel('Selector for the shared class').selectOption('.announcement');
  await page.getByLabel('Layout for rows and columns').selectOption('grid');
  await page.getByLabel('Why do these choices fit?').fill('The article element gives each announcement its own meaning, the class selector reaches every card that shares it, and grid coordinates the rows and columns.');
  await expect(page.getByTestId('written-answer-count')).toHaveText(/\d+ \/ 20 words/);
  await page.getByRole('button', { name: 'Check page plan' }).click();
  await expect(page.getByText(/connects meaning/)).toBeVisible();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByTestId('learning-flow-summary')).toBeVisible();

  await page.reload();
  await expect(page.getByTestId('learning-flow-summary')).toBeVisible();
  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the Lecture 2 practice moves from judgement to writing real markup', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/html-css-practice');
  await expect(page.getByRole('heading', { name: 'Practice: write the markup' })).toBeVisible();

  // Four conceptual judgements.
  const answers = [
    /Make each announcement an <article>/,
    /Form A uses get so the filtered view has a shareable URL/,
    /Rust, because the selector with an id outranks/,
    /Grid, because aligning items across rows/,
  ];
  for (const answer of answers) {
    await page.getByRole('radio', { name: answer }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  // Fragment completion: document structure and metadata.
  await expect(page.getByRole('heading', { name: /This page is missing everything/ })).toBeVisible();
  await page.getByLabel('Your HTML').fill(`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lab timetable</title>
  </head>
  <body><h1>Lab timetable</h1></body>
</html>`);
  await page.getByRole('button', { name: 'Check my HTML' }).click();
  await expect(page.getByText('Every requirement is met.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // Fragment completion: an accessible form.
  await page.getByLabel('Your HTML').fill(`<form action="/lab-signup" method="post">
  <label for="name">Full name</label>
  <input type="text" id="name" name="name">
  <label for="email">Email address</label>
  <input type="email" id="email" name="email">
  <label for="lab">Preferred lab</label>
  <select id="lab" name="lab"><option value="u45">U45</option></select>
  <button type="submit">Sign up</button>
</form>`);
  await page.getByRole('button', { name: 'Check my HTML' }).click();
  await expect(page.getByText('Every requirement is met.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();

  // The full build, with its sandboxed preview.
  await expect(page.getByRole('heading', { name: 'A page for the student film club' })).toBeVisible();
  const frame = page.locator('iframe[title="Preview of your page"]');
  await expect(frame).toHaveAttribute('sandbox', '');

  await page.getByLabel('Your HTML').fill(`<!DOCTYPE html>
<html lang="en">
  <head><meta charset="utf-8"><title>Student Film Club</title></head>
  <body>
    <header>
      <h1>Student Film Club</h1>
      <nav><ul><li><a href="/screenings">Screenings</a></li></ul></nav>
    </header>
    <main>
      <h2>This week</h2>
      <article><h3>Tuesday</h3><img src="a.jpg" alt="A still from the film"><p>18:30 in U45.</p></article>
      <article><h3>Thursday</h3><img src="b.jpg" alt="Another still"><p>19:00 in U47.</p></article>
    </main>
    <footer><p>Run by students.</p></footer>
  </body>
</html>`);
  await page.getByRole('button', { name: 'Check my HTML' }).click();
  await expect(page.getByText('Every requirement is met.')).toBeVisible();

  // The preview shows the page without running anything.
  await expect(frame.contentFrame().getByRole('heading', { name: 'Student Film Club' })).toBeVisible();

  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByTestId('learning-flow-summary')).toBeVisible();
  await expect(page.getByText(/You used the solution on/)).toHaveCount(0);

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('a stuck student can read the solution and continue, and the module says so', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/http-crud-quick-check');

  const wrong = page.getByRole('radio', { name: /Students will not need to install anything/ });
  await expect(page.getByRole('button', { name: /Show solution and continue/ })).toHaveCount(0);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await wrong.click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Try again' }).click();
  }

  await page.getByRole('button', { name: /Show solution and continue/ }).click();
  await expect(page.getByRole('heading', { name: /^Solution/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Why this is the answer' })).toBeVisible();
  await page.getByTestId('assisted-continue').click();

  await expect(page.getByText(/Completed with help/)).toBeVisible();
  await expect(page.locator('.learning-flow-navigation').getByRole('button', { name: 'Continue' })).toBeEnabled();

  // The assisted outcome survives a reload and is named in the summary.
  await page.reload();
  await expect(page.getByText(/Completed with help/)).toBeVisible();

  await expectNoHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('the HTML editor is fully operable from the keyboard', async ({ page }) => {
  await page.goto('/#/modules/html-css-practice');

  // Skip past the four conceptual activities to the first writing exercise.
  for (const answer of [
    /Make each announcement an <article>/,
    /Form A uses get so the filtered view has a shareable URL/,
    /Rust, because the selector with an id outranks/,
    /Grid, because aligning items across rows/,
  ]) {
    await page.getByRole('radio', { name: answer }).click();
    await page.getByRole('button', { name: 'Check answer' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
  }

  const editor = page.getByLabel('Your HTML');
  await expect(editor).toBeVisible();

  // Reach the editor by tabbing, type into it, then reach the check button.
  for (let press = 0; press < 25; press += 1) {
    if (await editor.evaluate((element) => document.activeElement === element)) break;
    await page.keyboard.press('Tab');
  }
  await expect(editor).toBeFocused();

  await page.keyboard.press('Control+a');
  await page.keyboard.type('<!DOCTYPE html>');
  await expect(editor).toHaveValue('<!DOCTYPE html>');

  const checkButton = page.getByRole('button', { name: 'Check my HTML' });
  for (let press = 0; press < 10; press += 1) {
    if (await checkButton.evaluate((element) => document.activeElement === element)) break;
    await page.keyboard.press('Tab');
  }
  await expect(checkButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByText(/requirements met/)).toBeVisible();
});

test('the Lecture 2 modules preserve their task hierarchy at 320, 390, and desktop widths', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'));
  test.setTimeout(90_000);

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());

    await page.goto('/#/modules/html-structure-css-layout');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Give a news page meaningful structure' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/tmp/shots/html-css-study-${width}.png`, fullPage: true });

    // The reference guide, with a long code sample open.
    await page.getByLabel('Site navigation').selectOption('nav');
    await page.getByLabel('Primary page content').selectOption('main');
    await page.getByLabel('Independent news story').selectOption('article');
    await page.getByRole('button', { name: 'Check structure' }).click();
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.getByText('The shape of a document', { exact: true }).click();
    await expect(page.getByText('<!DOCTYPE html>').first()).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/tmp/shots/html-reference-${width}.png`, fullPage: true });

    await page.goto('/#/modules/html-css-practice');
    await expect(page.getByRole('heading', { name: 'When a div is the right answer' })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/tmp/shots/html-css-practice-${width}.png`, fullPage: true });
  }
});

test('the HTML editor and its preview fit narrow screens', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('desktop'));
  test.setTimeout(90_000);

  for (const width of [320, 390, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.goto('/#/modules/html-css-practice');

    for (const answer of [
      /Make each announcement an <article>/,
      /Form A uses get so the filtered view has a shareable URL/,
      /Rust, because the selector with an id outranks/,
      /Grid, because aligning items across rows/,
      ]) {
      await page.getByRole('radio', { name: answer }).click();
      await page.getByRole('button', { name: 'Check answer' }).click();
      await page.getByRole('button', { name: 'Continue' }).click();
    }

    await expect(page.getByLabel('Your HTML')).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await page.screenshot({ path: `/tmp/shots/html-editor-${width}.png`, fullPage: true });
  }
});

test('a student can move through a module without answering, and finish anyway', async ({ page }) => {
  const errors = collectRuntimeErrors(page);
  await page.goto('/#/modules/http-crud-quick-check');

  // Forward past the opening question without touching it.
  await expect(page.getByText(/Not answered yet/)).toBeVisible();
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Order an exchange that passes through a proxy' })).toBeVisible();

  // Back again, and the first question is still there and still unanswered.
  await page.locator('.learning-flow-navigation').getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('heading', { name: 'Argue the trade-off, not the slogan' })).toBeVisible();
  await expect(page.getByText(/Not answered yet/)).toBeVisible();

  // Jump straight to the last activity, which was never reached.
  await page.getByRole('button', { name: /Build the exchange that removes a saved item/ }).click();
  await expect(page.getByRole('heading', { name: 'Build the exchange that removes a saved item' })).toBeVisible();

  // Answer just this one, then finish with the rest blank.
  await page.getByLabel('HTTP method').selectOption('delete');
  await page.getByLabel('Target path').selectOption('saved-item');
  await page.getByLabel('Response status family').selectOption('success');
  await page.getByRole('button', { name: 'Send this exchange' }).click();
  await expect(page.getByText('This exchange matches the intent.')).toBeVisible();

  await page.getByRole('button', { name: 'Finish' }).click();
  const summary = page.getByTestId('learning-flow-summary');
  await expect(summary).toBeVisible();
  await expect(page.getByText(/You answered 1 of 9 steps/)).toBeVisible();
  await expect(page.getByText(/You left 8 steps unanswered/)).toBeVisible();

  // The blanks are named, and there is a way straight back to the first one.
  await expect(summary.getByRole('listitem').first()).toContainText('Argue the trade-off');
  await page.getByRole('button', { name: /Go to the first unanswered step/ }).click();
  await expect(page.getByRole('heading', { name: 'Argue the trade-off, not the slogan' })).toBeVisible();

  expect(errors).toEqual([]);
});

test('finishing with blanks still marks the module complete on the course map', async ({ page }, testInfo) => {
  await page.goto('/#/modules/http-crud-quick-check');
  // Jump to the last activity and finish without answering anything at all.
  await page.getByRole('button', { name: /Build the exchange that removes a saved item/ }).click();
  await page.getByRole('button', { name: 'Finish' }).click();
  await expect(page.getByTestId('learning-flow-summary')).toBeVisible();
  await expect(page.getByText(/You answered 0 of 9 steps/)).toBeVisible();

  await page.goto('/#/');
  if (testInfo.project.name.startsWith('mobile')) {
    await page.getByRole('button', { name: 'Toggle course navigation' }).click();
  }
  await expect(page.getByRole('link', { name: /01\.1 Practice: reason about HTTP/ })).toBeVisible();
  await expect(page.getByText('25%')).toBeVisible();
});

test('the course opens dark and remembers an explicit choice', async ({ page }) => {
  // Even a student whose device asks for light sees the course open dark.
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('/#/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

  // Nothing is stored until the student actually picks a theme.
  expect(await page.evaluate(() => localStorage.getItem('sdu-learning-theme'))).toBeNull();

  await page.getByRole('button', { name: /Switch to light mode/ }).click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  expect(await page.evaluate(() => localStorage.getItem('sdu-learning-theme'))).toBe('light');

  // The choice survives a reload and outranks the default.
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
});
