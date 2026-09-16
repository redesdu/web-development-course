import type { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { CodeBlock } from '@/components/CodeBlock';

/**
 * A guide students come back to rather than read once.
 *
 * Every section is a native <details> element, so the browser handles opening,
 * closing, keyboard operation, and in-page find without any script. Nothing is
 * hidden behind a control that assistive technology cannot reach, and the whole
 * guide still prints and searches as one document.
 */

interface GuideSection {
  id: string;
  summary: string;
  body: ReactNode;
}

function Code({ children }: { children: string }) {
  return <CodeBlock>{children}</CodeBlock>;
}

const SECTIONS: GuideSection[] = [
  {
    id: 'anatomy',
    summary: 'Anatomy of an element',
    body: (
      <>
        <p>
          An element is an opening tag, some content, and a closing tag. Attributes live in the opening tag and give the
          browser extra information about that one element.
        </p>
        <Code>{`<a href="/timetable" class="link">Timetable</a>
 |     |                        |        |
 tag   attribute name and value  content  closing tag`}</Code>
        <p>
          A few elements have no content and so have no closing tag. <code>&lt;img&gt;</code>, <code>&lt;br&gt;</code>,
          and <code>&lt;input&gt;</code> are the ones you meet first. Everything else must be closed, and elements must
          be nested rather than overlapped.
        </p>
        <Code>{`<p><strong>Correct</strong> nesting closes the inner element first.</p>
<p><strong>Wrong nesting</p></strong>`}</Code>
      </>
    ),
  },
  {
    id: 'document',
    summary: 'The shape of a document',
    body: (
      <>
        <p>
          Every page has the same skeleton. The doctype tells the browser to use standards mode, <code>&lt;head&gt;</code>
          holds information about the page, and <code>&lt;body&gt;</code> holds what the reader sees.
        </p>
        <Code>{`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lab timetable</title>
  </head>
  <body>
    <h1>Lab timetable</h1>
  </body>
</html>`}</Code>
        <p>
          <strong>Rule of thumb.</strong> If a reader should see it, it belongs in the body. If it describes the page to a
          browser, a search engine, or another program, it belongs in the head.
        </p>
      </>
    ),
  },
  {
    id: 'metadata',
    summary: 'Metadata in the head',
    body: (
      <>
        <ul className="guide-list">
          <li><code>&lt;meta charset="utf-8"&gt;</code> states the character encoding. Without it, accented and non-Latin characters can render as nonsense.</li>
          <li><code>&lt;meta name="viewport" ...&gt;</code> tells a phone to use its real width instead of pretending to be a desktop. A page without it looks zoomed out on mobile.</li>
          <li><code>&lt;title&gt;</code> names the page in the tab, in bookmarks, and in search results. It is the only head element the reader routinely sees.</li>
          <li><code>&lt;meta name="description" ...&gt;</code> offers a summary that search engines may show.</li>
          <li><code>&lt;link rel="stylesheet" href="style.css"&gt;</code> attaches CSS. <code>&lt;script src="app.js" defer&gt;</code> attaches JavaScript.</li>
          <li>The <code>lang</code> attribute on <code>&lt;html&gt;</code> tells screen readers which language to pronounce.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'text',
    summary: 'Text, headings, and emphasis',
    body: (
      <>
        <p>
          Headings run from <code>&lt;h1&gt;</code> to <code>&lt;h6&gt;</code> and describe a hierarchy, not a size. Use
          one <code>&lt;h1&gt;</code> for the page subject, then do not skip a level on the way down. A screen reader
          user navigates a page by jumping between headings, so a broken hierarchy removes their table of contents.
        </p>
        <Code>{`<h1>Lab timetable</h1>
  <h2>Week 40</h2>
    <h3>Monday</h3>
  <h2>Week 41</h2>`}</Code>
        <p>
          <strong>Choose by meaning.</strong> <code>&lt;strong&gt;</code> marks importance and <code>&lt;em&gt;</code>
          marks emphasis; both carry meaning a screen reader can convey. <code>&lt;b&gt;</code> and <code>&lt;i&gt;</code>
          only change appearance. If you want text to look bigger, that is a CSS decision, not a heading level.
        </p>
      </>
    ),
  },
  {
    id: 'links-images',
    summary: 'Links and images',
    body: (
      <>
        <Code>{`<a href="/timetable">This week's timetable</a>
<a href="https://sdu.dk">SDU</a>
<img src="lab-room.jpg" alt="Workbenches and monitors in lab U45">
<img src="divider.png" alt="">`}</Code>
        <p>
          Link text should say where the link goes when read on its own. A page full of links called "click here" is
          unusable for anyone listing the links.
        </p>
        <p>
          <strong>Writing alt text.</strong> Describe what the image conveys in this context, not what it contains in
          general. If the image is purely decorative, use <code>alt=""</code> so it is skipped rather than announced as a
          filename. Leaving <code>alt</code> off entirely is different from an empty one: it makes a screen reader read
          the file name aloud.
        </p>
      </>
    ),
  },
  {
    id: 'lists-tables',
    summary: 'Lists and tables',
    body: (
      <>
        <p>Use <code>&lt;ul&gt;</code> when order does not matter and <code>&lt;ol&gt;</code> when it does. Only <code>&lt;li&gt;</code> may be a direct child of either.</p>
        <Code>{`<ul>
  <li>Bring your laptop</li>
  <li>Bring a charger</li>
</ul>`}</Code>
        <p>
          A table is for data with rows and columns, never for page layout. Give it a <code>&lt;caption&gt;</code> and
          mark the header cells with <code>&lt;th&gt;</code>, so the relationship between a value and its column survives
          for someone who cannot see the grid.
        </p>
        <Code>{`<table>
  <caption>Lab sessions in week 40</caption>
  <thead>
    <tr><th>Day</th><th>Room</th></tr>
  </thead>
  <tbody>
    <tr><td>Monday</td><td>U45</td></tr>
  </tbody>
</table>`}</Code>
      </>
    ),
  },
  {
    id: 'containers',
    summary: 'Containers and the flow of the page',
    body: (
      <>
        <p>
          <code>&lt;div&gt;</code> groups a block of content and <code>&lt;span&gt;</code> wraps part of a line. Neither
          says anything about meaning. They exist for the cases where you need a hook for styling and no meaningful
          element applies.
        </p>
        <p>
          Block-level elements start on a new line and take the full width available. Inline elements sit inside a line of
          text. That distinction is why a <code>&lt;div&gt;</code> inside a <code>&lt;p&gt;</code> is invalid: a paragraph
          contains text, not blocks.
        </p>
        <Code>{`<div class="card">
  <p>Room <span class="room">U45</span> is free.</p>
</div>`}</Code>
      </>
    ),
  },
  {
    id: 'semantic',
    summary: 'Semantic elements',
    body: (
      <>
        <p>
          These elements look like a <code>&lt;div&gt;</code> and behave like one, but they also state the purpose of the
          region. Browsers, search engines, and assistive technology all read that purpose.
        </p>
        <ul className="guide-list">
          <li><code>&lt;header&gt;</code> introductory content for the page or for one section.</li>
          <li><code>&lt;nav&gt;</code> a block of major navigation links.</li>
          <li><code>&lt;main&gt;</code> the primary content, used once per page.</li>
          <li><code>&lt;article&gt;</code> content that would still make sense somewhere else on its own.</li>
          <li><code>&lt;section&gt;</code> a thematic grouping, normally with a heading.</li>
          <li><code>&lt;aside&gt;</code> content related to the main content but not part of it.</li>
          <li><code>&lt;footer&gt;</code> closing information for the page or a section.</li>
        </ul>
        <p>
          <strong>Choosing between them.</strong> Ask whether the block could be lifted out and still make sense. If yes,
          it is an <code>&lt;article&gt;</code>. If it is a themed part of this page, it is a <code>&lt;section&gt;</code>.
          If it has no purpose beyond grouping for CSS, it is a <code>&lt;div&gt;</code>, and that is a legitimate answer.
        </p>
      </>
    ),
  },
  {
    id: 'forms',
    summary: 'Forms and labels',
    body: (
      <>
        <Code>{`<form action="/subscribe" method="post">
  <label for="email">Email address</label>
  <input type="email" id="email" name="email" required>

  <label for="room">Preferred room</label>
  <select id="room" name="room">
    <option value="u45">U45</option>
  </select>

  <button type="submit">Subscribe</button>
</form>`}</Code>
        <p>
          <strong>Label to control.</strong> The <code>for</code> attribute of the label must equal the <code>id</code> of
          the control. That link is what lets a screen reader announce the field, and what makes clicking the label focus
          the field. Placeholder text is not a label: it disappears as soon as the user types.
        </p>
        <p>
          <strong>Why <code>name</code> matters.</strong> The <code>id</code> connects the label; the <code>name</code> is
          the key the server receives. A control with no <code>name</code> is simply not submitted.
        </p>
        <p>
          <strong>Choosing a method.</strong> Use <code>get</code> when the form asks for something and the query belongs
          in a shareable URL, such as a search. Use <code>post</code> when the submission changes data or carries anything
          that should not sit in a browser history entry.
        </p>
        <p>
          The <code>type</code> attribute selects the right keyboard on a phone and the browser's own validation, so
          <code>email</code>, <code>number</code>, <code>date</code>, and <code>password</code> are worth using over a
          plain <code>text</code>.
        </p>
      </>
    ),
  },
  {
    id: 'attributes',
    summary: 'Attributes you will use constantly',
    body: (
      <>
        <ul className="guide-list">
          <li><code>id</code> names one element. It must be unique on the page.</li>
          <li><code>class</code> labels any number of elements that share a purpose or a style.</li>
          <li><code>href</code> on a link and <code>src</code> on an image or script name a target resource.</li>
          <li><code>alt</code> gives an image a text alternative.</li>
          <li><code>for</code> and <code>name</code> connect a form control to its label and to the server.</li>
          <li><code>lang</code> declares the language of the page or a passage.</li>
        </ul>
        <p>
          <strong>id or class?</strong> Use <code>id</code> when exactly one thing can hold that name, for example a
          label target or a link anchor. Use <code>class</code> for styling. Because an <code>id</code> has to be unique,
          styling with one guarantees the rule can never apply to a second element, and it raises specificity in a way
          that becomes hard to override later.
        </p>
        <Code>{`<label for="email">Email</label>
<input id="email" name="email" class="field field-wide">`}</Code>
      </>
    ),
  },
];

export function HtmlReference() {
  return (
    <section className="html-reference" aria-labelledby="html-reference-title">
      <p className="eyebrow"><BookOpen size={16} aria-hidden="true" /> Reference</p>
      <h3 id="html-reference-title">The HTML you will keep looking up</h3>
      <p className="html-reference-intro">
        Open the part you need. This stays here for the rest of the course, so there is no reason to memorise it now.
        Each section gives the shape of the markup, a short example, and the rule for choosing between similar options.
      </p>

      {SECTIONS.map((section) => (
        <details key={section.id} className="html-reference-section">
          <summary>{section.summary}</summary>
          <div className="html-reference-body">{section.body}</div>
        </details>
      ))}
    </section>
  );
}
