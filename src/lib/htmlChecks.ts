/**
 * Structural checks for student-written HTML.
 *
 * Almost everything here parses the markup with the browser's own `DOMParser`
 * and inspects the resulting tree, which is what the student's browser would
 * really build. Two rules cannot work that way, because the parser repairs the
 * mistake before it can be seen, and those read the source instead. Nothing is
 * ever executed.
 *
 * A check reports one requirement a student can act on. The message says what is
 * missing, not merely that something is wrong.
 */

export interface HtmlCheck {
  id: string;
  /** What the student has to achieve, written as a requirement. */
  label: string;
  run: (document: Document, source: string) => boolean;
}

export interface CheckResult {
  id: string;
  label: string;
  passed: boolean;
}

const HEADING_SELECTOR = 'h1, h2, h3, h4, h5, h6';
const LABELLABLE = 'input, select, textarea';

export function parseHtml(source: string): Document {
  return new DOMParser().parseFromString(source, 'text/html');
}

export function runHtmlChecks(source: string, checks: HtmlCheck[]): CheckResult[] {
  const document = parseHtml(source);
  return checks.map((check) => {
    let passed = false;
    try {
      passed = check.run(document, source);
    } catch {
      // A check that throws on unusual markup reports a failure rather than
      // breaking the exercise the student is in the middle of.
      passed = false;
    }
    return { id: check.id, label: check.label, passed };
  });
}

export function allChecksPassed(results: CheckResult[]) {
  return results.length > 0 && results.every((result) => result.passed);
}

/* ---- Reusable checks ---- */

export function hasDoctype(): HtmlCheck {
  return {
    id: 'doctype',
    label: 'The document starts with <!DOCTYPE html>.',
    // The parser normalises the doctype away from the tree, so this reads the
    // source. It is the one requirement that is genuinely textual.
    run: (_document, source) => /^\s*<!doctype\s+html\s*>/i.test(source),
  };
}

export function hasLangAttribute(): HtmlCheck {
  return {
    id: 'lang',
    label: 'The <html> element declares a language with lang.',
    run: (document) => {
      const html = document.documentElement;
      return html.tagName.toLowerCase() === 'html' && (html.getAttribute('lang') ?? '').trim().length > 0;
    },
  };
}

export function hasCharset(): HtmlCheck {
  return {
    id: 'charset',
    label: 'The head declares a character encoding with <meta charset>.',
    run: (document) => document.querySelector('head meta[charset]') !== null,
  };
}

export function hasViewport(): HtmlCheck {
  return {
    id: 'viewport',
    label: 'The head declares a viewport meta tag so the page works on a phone.',
    run: (document) => {
      const meta = document.querySelector('head meta[name="viewport"]');
      return (meta?.getAttribute('content') ?? '').includes('width=device-width');
    },
  };
}

export function hasNonEmptyTitle(): HtmlCheck {
  return {
    id: 'title',
    label: 'The head contains a <title> with real text in it.',
    run: (document) => (document.querySelector('head title')?.textContent ?? '').trim().length > 0,
  };
}

export function hasElement(id: string, selector: string, label: string): HtmlCheck {
  return { id, label, run: (document) => document.querySelector(selector) !== null };
}

export function hasExactlyOne(id: string, selector: string, label: string): HtmlCheck {
  return { id, label, run: (document) => document.querySelectorAll(selector).length === 1 };
}

/** Headings must start at h1 and never skip a level going down. */
export function headingOrderIsSound(): HtmlCheck {
  return {
    id: 'heading-order',
    label: 'Headings start at <h1> and go down one level at a time without skipping.',
    run: (document) => {
      const levels = [...document.querySelectorAll(HEADING_SELECTOR)]
        .map((heading) => Number(heading.tagName.slice(1)));
      if (levels.length === 0) return false;
      if (levels[0] !== 1) return false;
      return levels.every((level, index) => index === 0 || level - levels[index - 1] <= 1);
    },
  };
}

export function everyImageHasAlt(): HtmlCheck {
  return {
    id: 'image-alt',
    label: 'Every <img> carries an alt attribute, even if it is empty for decoration.',
    run: (document) => [...document.querySelectorAll('img')].every((image) => image.hasAttribute('alt')),
  };
}

/**
 * Every form control is named by a label.
 *
 * A control counts as labelled when a <label for> points at its id, when it sits
 * inside a <label>, or when it carries an aria-label. Buttons and hidden inputs
 * are not included, because neither takes a separate label.
 */
export function everyControlHasLabel(): HtmlCheck {
  return {
    id: 'control-label',
    label: 'Every form control is connected to a label.',
    run: (document) => {
      const controls = [...document.querySelectorAll(LABELLABLE)].filter((control) => {
        const type = (control.getAttribute('type') ?? '').toLowerCase();
        return !['hidden', 'submit', 'reset', 'button'].includes(type);
      });
      if (controls.length === 0) return false;

      return controls.every((control) => {
        const id = control.getAttribute('id');
        const labelledByFor = id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) !== null : false;
        const wrapped = control.closest('label') !== null;
        const ariaLabel = (control.getAttribute('aria-label') ?? '').trim().length > 0;
        return labelledByFor || wrapped || ariaLabel;
      });
    },
  };
}

export function everyControlHasName(): HtmlCheck {
  return {
    id: 'control-name',
    label: 'Every form control has a name, so the server receives its value.',
    run: (document) => {
      const controls = [...document.querySelectorAll(LABELLABLE)].filter((control) => {
        const type = (control.getAttribute('type') ?? '').toLowerCase();
        return !['submit', 'reset', 'button'].includes(type);
      });
      if (controls.length === 0) return false;
      return controls.every((control) => (control.getAttribute('name') ?? '').trim().length > 0);
    },
  };
}

export function formUsesMethod(method: 'get' | 'post'): HtmlCheck {
  return {
    id: 'form-method',
    label: `The form submits with method="${method}".`,
    run: (document) => {
      const form = document.querySelector('form');
      if (!form) return false;
      return (form.getAttribute('method') ?? '').toLowerCase() === method;
    },
  };
}

export function inputTypesInclude(types: string[]): HtmlCheck {
  return {
    id: 'input-types',
    label: `The form uses the input types the data needs: ${types.join(', ')}.`,
    run: (document) => {
      const present = new Set(
        [...document.querySelectorAll('input')].map((input) => (input.getAttribute('type') ?? 'text').toLowerCase()),
      );
      return types.every((type) => present.has(type));
    },
  };
}

const BLOCK_TAGS = new Set([
  'div', 'p', 'ul', 'ol', 'section', 'article', 'header', 'footer', 'nav', 'main',
  'aside', 'table', 'form', 'blockquote', 'pre', 'figure', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

/**
 * Did the student open a block element inside a paragraph?
 *
 * The parser cannot answer this. Given `<p><div>x</div></p>` it closes the
 * paragraph, promotes the div to a sibling, and discards the stray `</p>`, so
 * the finished tree looks like correct markup that simply says something else.
 * This walks the source tags instead and reports the mistake the student made.
 */
function paragraphContainsBlock(source: string): boolean {
  const tagPattern = /<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g;
  let insideParagraph = false;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(source)) !== null) {
    const tag = match[1].toLowerCase();
    const closing = match[0].startsWith('</');

    if (tag === 'p') {
      if (closing) insideParagraph = false;
      else if (insideParagraph) return true;
      else insideParagraph = true;
      continue;
    }

    if (insideParagraph && !closing && BLOCK_TAGS.has(tag)) return true;
  }

  return false;
}

/**
 * Elements are nested where they are allowed to be.
 *
 * This covers the mistakes that actually appear in a first HTML assignment
 * rather than the whole content model.
 */
export function nestingIsValid(): HtmlCheck {
  return {
    id: 'nesting',
    label: 'Elements are nested where they are allowed: list items inside a list, no blocks inside a paragraph.',
    run: (document, source) => {
      const strayListItems = [...document.querySelectorAll('li')]
        .some((item) => !['ul', 'ol', 'menu'].includes(item.parentElement?.tagName.toLowerCase() ?? ''));
      if (strayListItems) return false;

      if (paragraphContainsBlock(source)) return false;

      const strayCells = [...document.querySelectorAll('td, th')]
        .some((cell) => cell.parentElement?.tagName.toLowerCase() !== 'tr');
      return !strayCells;
    },
  };
}

/** A page that leans on <div> where a meaningful element exists. */
export function usesSemanticRegions(required: string[]): HtmlCheck {
  return {
    id: 'semantic-regions',
    label: `The page uses the meaningful region elements it needs: ${required.map((tag) => `<${tag}>`).join(', ')}.`,
    run: (document) => required.every((tag) => document.querySelector(tag) !== null),
  };
}

export function hasNoScript(): HtmlCheck {
  return {
    id: 'no-script',
    label: 'The page contains no <script>. This exercise is about structure only.',
    run: (document) => document.querySelector('script') === null,
  };
}

/**
 * Remove anything the preview must never run or fetch.
 *
 * The iframe is already sandboxed without `allow-scripts`, and a content policy
 * is added on top. This strips the obvious cases as well, so the preview cannot
 * execute the student's code or reach the network by any of the three routes.
 */
/**
 * A stand-in for any image the preview must not fetch.
 *
 * A student writing `<img src="poster.jpg">` has no such file here, and letting
 * the request be attempted and refused fills the console with errors that have
 * nothing to teach them. Swapping in an inline placeholder keeps the promise
 * that the preview makes no network request, and still shows the box the image
 * will occupy in the layout.
 */
const IMAGE_PLACEHOLDER =
  'data:image/svg+xml;utf8,' + encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160">'
    + '<rect width="240" height="160" fill="#e8e6e0"/>'
    + '<rect x="0.5" y="0.5" width="239" height="159" fill="none" stroke="#bdb9b0"/>'
    + '<text x="120" y="85" font-family="sans-serif" font-size="13" fill="#6b6760" text-anchor="middle">image</text>'
    + '</svg>',
  );

export function sanitizeForPreview(source: string): string {
  const document = parseHtml(source);

  for (const node of document.querySelectorAll('script, iframe, object, embed, link, form')) {
    if (node.tagName.toLowerCase() === 'form') {
      // Keep the form's fields visible so the student can see the layout, but
      // strip what it would submit to. The sandbox blocks submission anyway.
      node.removeAttribute('action');
      node.removeAttribute('method');
      continue;
    }
    node.remove();
  }

  for (const element of document.querySelectorAll('*')) {
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      const value = attribute.value.trim().toLowerCase();
      if (name.startsWith('on')) element.removeAttribute(attribute.name);
      if ((name === 'src' || name === 'href') && value.startsWith('javascript:')) {
        element.removeAttribute(attribute.name);
      }
    }
  }

  for (const image of document.querySelectorAll('img')) {
    const source = (image.getAttribute('src') ?? '').trim();
    if (!source.startsWith('data:')) image.setAttribute('src', IMAGE_PLACEHOLDER);
  }

  const policy = document.createElement('meta');
  policy.setAttribute('http-equiv', 'Content-Security-Policy');
  policy.setAttribute('content', "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src 'none'");
  document.head.prepend(policy);

  return `<!DOCTYPE html>${document.documentElement.outerHTML}`;
}
