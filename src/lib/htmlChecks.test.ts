import {
  allChecksPassed,
  everyControlHasLabel,
  everyControlHasName,
  everyImageHasAlt,
  formUsesMethod,
  hasCharset,
  hasDoctype,
  hasExactlyOne,
  hasLangAttribute,
  hasNoScript,
  hasNonEmptyTitle,
  hasViewport,
  headingOrderIsSound,
  inputTypesInclude,
  nestingIsValid,
  runHtmlChecks,
  sanitizeForPreview,
  usesSemanticRegions,
} from './htmlChecks';

function check(source: string, rule: ReturnType<typeof hasDoctype>) {
  return runHtmlChecks(source, [rule])[0].passed;
}

describe('document and metadata checks', () => {
  test('hasDoctype accepts only a real doctype at the start', () => {
    expect(check('<!DOCTYPE html><html></html>', hasDoctype())).toBe(true);
    expect(check('  <!doctype html>\n<html></html>', hasDoctype())).toBe(true);
    expect(check('<html></html>', hasDoctype())).toBe(false);
    expect(check('<p>text</p><!DOCTYPE html>', hasDoctype())).toBe(false);
  });

  test('hasLangAttribute requires a non-empty language', () => {
    expect(check('<html lang="en"><body></body></html>', hasLangAttribute())).toBe(true);
    expect(check('<html lang=""><body></body></html>', hasLangAttribute())).toBe(false);
    expect(check('<html><body></body></html>', hasLangAttribute())).toBe(false);
  });

  test('hasCharset and hasViewport look in the head', () => {
    const good = '<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>';
    expect(check(good, hasCharset())).toBe(true);
    expect(check(good, hasViewport())).toBe(true);
    expect(check('<html><head></head><body></body></html>', hasCharset())).toBe(false);
  });

  test('a viewport without device-width does not count', () => {
    expect(check('<html><head><meta name="viewport" content="initial-scale=1"></head></html>', hasViewport())).toBe(false);
  });

  test('hasNonEmptyTitle rejects an empty title', () => {
    expect(check('<html><head><title>Timetable</title></head></html>', hasNonEmptyTitle())).toBe(true);
    expect(check('<html><head><title></title></head></html>', hasNonEmptyTitle())).toBe(false);
    expect(check('<html><head><title>   </title></head></html>', hasNonEmptyTitle())).toBe(false);
  });
});

describe('headingOrderIsSound', () => {
  test('accepts a hierarchy that steps down one level at a time', () => {
    expect(check('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2>', headingOrderIsSound())).toBe(true);
  });

  test('rejects a skipped level', () => {
    expect(check('<h1>A</h1><h3>C</h3>', headingOrderIsSound())).toBe(false);
  });

  test('rejects a page that does not start at h1', () => {
    expect(check('<h2>B</h2><h3>C</h3>', headingOrderIsSound())).toBe(false);
  });

  test('rejects a page with no headings at all', () => {
    expect(check('<p>Just text</p>', headingOrderIsSound())).toBe(false);
  });

  test('allows going back up more than one level', () => {
    expect(check('<h1>A</h1><h2>B</h2><h3>C</h3><h2>D</h2><h1>E</h1>', headingOrderIsSound())).toBe(true);
  });
});

describe('accessibility checks', () => {
  test('everyImageHasAlt accepts an empty alt for decoration', () => {
    expect(check('<img src="a.png" alt="A workbench"><img src="line.png" alt="">', everyImageHasAlt())).toBe(true);
  });

  test('everyImageHasAlt rejects a missing attribute', () => {
    expect(check('<img src="a.png" alt="ok"><img src="b.png">', everyImageHasAlt())).toBe(false);
  });

  test('everyControlHasLabel accepts a for and id pair', () => {
    expect(check('<label for="e">Email</label><input id="e" name="e">', everyControlHasLabel())).toBe(true);
  });

  test('everyControlHasLabel accepts a wrapping label', () => {
    expect(check('<label>Email <input name="e"></label>', everyControlHasLabel())).toBe(true);
  });

  test('everyControlHasLabel rejects plain text beside a control', () => {
    expect(check('Email <input name="e">', everyControlHasLabel())).toBe(false);
  });

  test('everyControlHasLabel rejects a for that points nowhere', () => {
    expect(check('<label for="email">Email</label><input id="e-mail" name="e">', everyControlHasLabel())).toBe(false);
  });

  test('everyControlHasLabel ignores buttons, which take no separate label', () => {
    expect(check('<label for="e">Email</label><input id="e" name="e"><input type="submit" value="Go">', everyControlHasLabel())).toBe(true);
  });

  test('everyControlHasName rejects a control the server will never receive', () => {
    expect(check('<label for="e">Email</label><input id="e" name="email">', everyControlHasName())).toBe(true);
    expect(check('<label for="e">Email</label><input id="e">', everyControlHasName())).toBe(false);
  });
});

describe('form checks', () => {
  test('formUsesMethod compares case-insensitively', () => {
    expect(check('<form method="POST"></form>', formUsesMethod('post'))).toBe(true);
    expect(check('<form method="get"></form>', formUsesMethod('post'))).toBe(false);
    expect(check('<form></form>', formUsesMethod('post'))).toBe(false);
  });

  test('inputTypesInclude treats a missing type as text', () => {
    expect(check('<input><input type="email">', inputTypesInclude(['text', 'email']))).toBe(true);
    expect(check('<input><input type="tel">', inputTypesInclude(['text', 'email']))).toBe(false);
  });
});

describe('nestingIsValid', () => {
  test('accepts correct nesting', () => {
    expect(check('<ul><li>One</li></ul><p>Text</p>', nestingIsValid())).toBe(true);
  });

  test('rejects a list item outside a list', () => {
    expect(check('<div><li>Stray</li></div>', nestingIsValid())).toBe(false);
  });

  test('rejects a block inside a paragraph, which the browser silently repairs', () => {
    expect(check('<p><div>Nope</div></p>', nestingIsValid())).toBe(false);
    expect(check('<p>Before<ul><li>One</li></ul>After</p>', nestingIsValid())).toBe(false);
  });

  test('accepts several separate paragraphs', () => {
    expect(check('<p>One</p><p>Two</p><p>Three</p>', nestingIsValid())).toBe(true);
  });

  test('allows inline elements inside a paragraph', () => {
    expect(check('<p>Room <span>U45</span> is <strong>free</strong>.</p>', nestingIsValid())).toBe(true);
  });
});

describe('structure checks', () => {
  test('usesSemanticRegions requires every named element', () => {
    const page = '<body><header></header><main></main><footer></footer></body>';
    expect(check(page, usesSemanticRegions(['header', 'main', 'footer']))).toBe(true);
    expect(check(page, usesSemanticRegions(['header', 'nav', 'main']))).toBe(false);
  });

  test('hasExactlyOne rejects a second main', () => {
    expect(check('<main></main>', hasExactlyOne('m', 'main', 'One main'))).toBe(true);
    expect(check('<main></main><main></main>', hasExactlyOne('m', 'main', 'One main'))).toBe(false);
  });

  test('hasNoScript keeps the exercise about structure', () => {
    expect(check('<p>Hello</p>', hasNoScript())).toBe(true);
    expect(check('<script>alert(1)</script>', hasNoScript())).toBe(false);
  });
});

describe('runHtmlChecks', () => {
  test('reports each requirement separately with its own message', () => {
    const results = runHtmlChecks('<html><head></head><body><h2>Nope</h2></body></html>', [
      hasDoctype(),
      headingOrderIsSound(),
    ]);

    expect(results).toHaveLength(2);
    expect(results[0]).toMatchObject({ id: 'doctype', passed: false });
    expect(results[0].label).toContain('DOCTYPE');
    expect(allChecksPassed(results)).toBe(false);
  });

  test('passes only when every requirement is met', () => {
    const results = runHtmlChecks('<!DOCTYPE html><html lang="en"><body><h1>A</h1></body></html>', [
      hasDoctype(),
      hasLangAttribute(),
      headingOrderIsSound(),
    ]);
    expect(allChecksPassed(results)).toBe(true);
  });

  test('an empty check list is not a pass', () => {
    expect(allChecksPassed([])).toBe(false);
  });

  test('malformed markup reports failures rather than throwing', () => {
    expect(() => runHtmlChecks('<div><p>unclosed', [nestingIsValid(), headingOrderIsSound()])).not.toThrow();
  });
});

describe('sanitizeForPreview', () => {
  test('removes scripts', () => {
    const output = sanitizeForPreview('<html><body><p>Hi</p><script>alert(1)</script></body></html>');
    expect(output).not.toContain('alert(1)');
    expect(output).not.toContain('<script');
    expect(output).toContain('<p>Hi</p>');
  });

  test('removes inline event handlers', () => {
    const output = sanitizeForPreview('<html><body><button onclick="steal()">Go</button></body></html>');
    expect(output.toLowerCase()).not.toContain('onclick');
    expect(output).toContain('Go');
  });

  test('removes javascript URLs', () => {
    const output = sanitizeForPreview('<html><body><a href="javascript:alert(1)">Go</a></body></html>');
    expect(output.toLowerCase()).not.toContain('javascript:');
  });

  test('removes elements that would fetch from the network', () => {
    const output = sanitizeForPreview('<html><head><link rel="stylesheet" href="data:text/css,body%7B%7D"></head><body><iframe src="data:text/html,page"></iframe></body></html>');
    expect(output).not.toContain('data:text/css');
    expect(output).not.toContain('<link');
    expect(output).not.toContain('<iframe');
  });

  test('keeps a form visible but unable to submit', () => {
    const output = sanitizeForPreview('<html><body><form action="/steal" method="post"><input name="a"></form></body></html>');
    expect(output).not.toContain('/steal');
    expect(output).not.toContain('method=');
    expect(output).toContain('<input');
  });

  test('adds a content policy that blocks outside requests', () => {
    const output = sanitizeForPreview('<html><body><p>Hi</p></body></html>');
    expect(output).toContain('Content-Security-Policy');
    expect(output).toContain("default-src 'none'");
  });

  test('replaces an image the preview cannot fetch with an inline placeholder', () => {
    const output = sanitizeForPreview('<html><body><img src="poster.jpg" alt="A poster"></body></html>');
    expect(output).not.toContain('poster.jpg');
    expect(output).toContain('data:image/svg+xml');
    expect(output).toContain('alt="A poster"');
  });

  test('leaves an image that is already inline data alone', () => {
    const output = sanitizeForPreview('<html><body><img src="data:image/gif;base64,R0lGOD" alt=""></body></html>');
    expect(output).toContain('data:image/gif;base64,R0lGOD');
  });

  test('keeps ordinary structure and inline styles intact', () => {
    const output = sanitizeForPreview('<html><body><main><h1 style="color:navy">Title</h1></main></body></html>');
    expect(output).toContain('<main>');
    expect(output).toContain('color:navy');
  });
});
