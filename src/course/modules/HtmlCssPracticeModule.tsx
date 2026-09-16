import { HtmlExercise } from '@/components/HtmlExercise';
import { KnowledgeCheck, type KnowledgeCheckOption } from '@/components/KnowledgeCheck';
import { LearningFlow, type LearningFlowStep } from '@/components/LearningFlow';
import { LearningModuleLayout } from '@/components/LearningModuleLayout';
import type { ModulePageProps } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import {
  everyControlHasLabel,
  everyControlHasName,
  everyImageHasAlt,
  formUsesMethod,
  hasCharset,
  hasDoctype,
  hasElement,
  hasExactlyOne,
  hasLangAttribute,
  hasNoScript,
  hasNonEmptyTitle,
  hasViewport,
  headingOrderIsSound,
  inputTypesInclude,
  nestingIsValid,
  usesSemanticRegions,
} from '@/lib/htmlChecks';

/**
 * Applied practice for Lecture 2.
 *
 * Four conceptual activities ask for a judgement that the lecture's rules do not
 * settle by themselves, then three writing exercises move from completing a
 * fragment to building a page from nothing.
 */

interface ConceptItem {
  id: string;
  title: string;
  scenario: string;
  question: string;
  hint: string;
  options: KnowledgeCheckOption[];
}

const CONCEPTS: ConceptItem[] = [
  {
    id: 'semantics-judgement',
    title: 'When a div is the right answer',
    scenario:
      'A page shows a list of course announcements. Each announcement has a heading, a date, and a paragraph, and each one is also published on its own page. The developer wraps every announcement in <section>, then wraps all of them together in another <section> purely so one CSS grid rule can position them.',
    question: 'Which change would improve this markup?',
    hint: 'Ask of each wrapper: could this be lifted out of the page and still make sense? And does this wrapper mean anything, or does it only exist for CSS?',
    options: [
      {
        id: 'article-inside-div',
        label: 'Make each announcement an <article>, and make the outer wrapper a <div>.',
        correct: true,
        feedback:
          'Each announcement is published on its own page, so it stands alone and <article> states that. The outer wrapper exists only to give the grid rule something to style, so <div> is the honest choice. A wrapper with no meaning is exactly what <div> is for.',
      },
      {
        id: 'all-sections-fine',
        label: 'Nothing needs to change. <section> is a semantic element, so using it everywhere is an improvement over <div>.',
        feedback:
          'Semantic elements help only when they are true. A <section> claims a thematic grouping, so using one as a styling wrapper tells assistive technology about a region that does not exist.',
      },
      {
        id: 'all-divs',
        label: 'Replace both with <div>, since CSS grid works the same either way.',
        feedback:
          'That is right about the CSS and wrong about the announcements. The layout would be identical, but the fact that each announcement stands on its own would be thrown away.',
      },
      {
        id: 'main-each',
        label: 'Make each announcement a <main>, because each one is the primary content of its own page.',
        feedback:
          'There is only one <main> per page, and on this page the main content is the whole list. The individual page is a different document.',
      },
    ],
  },
  {
    id: 'form-judgement',
    title: 'Choose the method from the consequence',
    scenario:
      'A course site has two forms. Form A filters the reading list by topic and week; students often want to send a colleague the exact filtered view. Form B changes a student\'s notification email address.',
    question: 'Which pairing of methods fits, and why?',
    hint: 'One of these two forms produces something worth putting in a URL. The other produces something that must never end up in a browser history entry.',
    options: [
      {
        id: 'get-then-post',
        label: 'Form A uses get so the filtered view has a shareable URL; form B uses post because it changes stored data.',
        correct: true,
        feedback:
          'That is the reasoning. A get puts the fields in the query string, which is what makes the filtered list linkable. Changing an address is a change to server data, and post keeps it out of the URL, out of history, and out of an accidental repeat from a refresh.',
      },
      {
        id: 'both-post',
        label: 'Both should use post, because post is the more secure method.',
        feedback:
          'Post is not encryption; only HTTPS protects the message. Choosing post for the filter would also throw away the shareable URL, which the scenario says students want.',
      },
      {
        id: 'get-then-get',
        label: 'Both should use get, because both forms send only a few short fields.',
        feedback:
          'Field size is not the criterion. A get that changes the stored email address would put it in the URL and make a refresh repeat the change.',
      },
      {
        id: 'post-then-get',
        label: 'Form A uses post to keep the reading list private; form B uses get so the new address is visible for confirmation.',
        feedback:
          'This inverts both decisions. It hides something the students explicitly want to share, and exposes something that should not appear in a URL.',
      },
    ],
  },
  {
    id: 'cascade-judgement',
    title: 'Predict the winning rule',
    scenario:
      'A stylesheet contains these rules, in this order:\n\n.card p { color: grey; }\narticle p { color: black; }\n#featured p { color: rust; }\np { color: navy; }\n\nThe page contains:\n\n<article id="featured" class="card">\n  <p>Room U45 is free.</p>\n</article>',
    question: 'What colour is the paragraph, and what decided it?',
    hint: 'Count, for each selector, how many ids, how many classes, and how many element names it uses. Source order only settles a tie.',
    options: [
      {
        id: 'rust-by-id',
        label: 'Rust, because the selector with an id outranks the ones built from classes and element names.',
        correct: true,
        feedback:
          'Correct. An id counts for more than any number of classes or element names, so #featured p wins outright. The fact that the plain p rule comes last in the file never gets to matter, because source order only breaks a tie between selectors of equal weight.',
      },
      {
        id: 'navy-by-order',
        label: 'Navy, because the p rule appears last and later rules override earlier ones.',
        feedback:
          'Later rules win only against rules of the same weight. A bare element selector is the weakest of the four, so its position cannot rescue it.',
      },
      {
        id: 'grey-by-class',
        label: 'Grey, because .card p is the only selector that uses the element\'s class.',
        feedback:
          'A class outranks an element name, so .card p beats article p. It still loses to a selector containing an id.',
      },
      {
        id: 'black-by-element',
        label: 'Black, because article p describes the element most accurately.',
        feedback:
          'Accuracy of description is not what the cascade measures. article p is two element names, which is the second weakest of these four selectors.',
      },
    ],
  },
  {
    id: 'layout-judgement',
    title: 'Pick the layout the content actually needs',
    scenario:
      'A dashboard shows a variable number of status cards. The designer wants them to fill the available width, wrap onto new lines as the window narrows, and keep their tops and bottoms aligned in neat rows so the page does not look ragged.',
    question: 'Which mechanism fits, and why?',
    hint: 'The requirement mentions both filling a row and lining up across rows. Ask which mechanism can see both directions at once.',
    options: [
      {
        id: 'grid-auto-fit',
        label: 'Grid, because aligning items across rows as well as along them needs a mechanism that controls both directions.',
        correct: true,
        feedback:
          'Grid is the fit. Flexbox wraps happily, but each wrapped line sizes itself independently, so rows end up ragged. Grid places items into a shared column structure, which is what keeps the rows aligned.',
      },
      {
        id: 'flex-wrap',
        label: 'Flexbox with wrapping, because the cards flow along one axis and wrap when there is no more room.',
        feedback:
          'This gets the wrapping right and the alignment wrong. Flex lines do not know about each other, so cards in one row will not line up with those in the next, which is the ragged look the designer is trying to avoid.',
      },
      {
        id: 'float',
        label: 'Floats, because they were designed to flow blocks alongside each other and wrap.',
        feedback:
          'Floats do wrap, but they were designed for text flowing around an image and give no control over alignment between rows.',
      },
      {
        id: 'inline-block',
        label: 'display: inline-block, because the cards then sit in a line and wrap like words in a paragraph.',
        feedback:
          'They would wrap, but they would also inherit whitespace gaps and baseline alignment from text layout, and nothing would align the rows.',
      },
    ],
  },
];

const DOCUMENT_STARTER = `<html>
  <head>
    <title></title>
  </head>
  <body>
    <h1>Lab timetable</h1>
  </body>
</html>`;

const DOCUMENT_SOLUTION = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Lab timetable</title>
  </head>
  <body>
    <h1>Lab timetable</h1>
  </body>
</html>`;

const FORM_STARTER = `<form>
  Full name
  <input>

  Email address
  <input>

  Preferred lab
  <select>
    <option value="u45">U45</option>
    <option value="u47">U47</option>
  </select>

  <button>Sign up</button>
</form>`;

const FORM_SOLUTION = `<form action="/lab-signup" method="post">
  <label for="name">Full name</label>
  <input type="text" id="name" name="name" required>

  <label for="email">Email address</label>
  <input type="email" id="email" name="email" required>

  <label for="lab">Preferred lab</label>
  <select id="lab" name="lab">
    <option value="u45">U45</option>
    <option value="u47">U47</option>
  </select>

  <button type="submit">Sign up</button>
</form>`;

const PAGE_STARTER = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Student Film Club</title>
  </head>
  <body>
    <!-- Build the page here. -->
  </body>
</html>`;

const PAGE_SOLUTION = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Student Film Club</title>
  </head>
  <body>
    <header>
      <h1>Student Film Club</h1>
      <nav>
        <ul>
          <li><a href="/screenings">Screenings</a></li>
          <li><a href="/join">Join</a></li>
        </ul>
      </nav>
    </header>

    <main>
      <h2>This week</h2>

      <article>
        <h3>Tuesday: Stalker</h3>
        <img src="stalker.jpg" alt="Three figures walking through an overgrown industrial landscape">
        <p>Doors open at 18:30 in lecture hall U45.</p>
      </article>

      <article>
        <h3>Thursday: Yi Yi</h3>
        <img src="yiyi.jpg" alt="A boy photographing the back of a stranger's head">
        <p>Doors open at 19:00 in lecture hall U47.</p>
      </article>
    </main>

    <footer>
      <p>Run by students, open to everyone.</p>
    </footer>
  </body>
</html>`;

export default function HtmlCssPracticeModule({ module }: ModulePageProps) {
  const { setCompleted } = useCourseProgress();

  const conceptSteps: LearningFlowStep[] = CONCEPTS.map((item) => ({
    id: item.id,
    title: item.title,
    sectionLabel: 'Decide and justify',
    render: ({ completeStep, outcome }) => (
      <>
        <p className="scenario-setup">{item.scenario}</p>
        <KnowledgeCheck
          storageKey={`html-css-concept-${item.id}`}
          question={item.question}
          options={item.options}
          hint={item.hint}
          assistedCompleted={outcome === 'assisted'}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      </>
    ),
  }));

  const steps: LearningFlowStep[] = [
    ...conceptSteps,
    {
      id: 'complete-document',
      title: 'Complete the document and its metadata',
      sectionLabel: 'Complete the fragment',
      render: ({ completeStep, outcome }) => (
        <HtmlExercise
          storageKey="html-practice-document"
          title="This page is missing everything the browser needs to know"
          brief={(
            <p>
              The markup below renders, but it tells the browser nothing about how to read it. Add the doctype, the page
              language, the character encoding, the viewport, and a real page title. Leave the body as it is.
            </p>
          )}
          assistedCompleted={outcome === 'assisted'}
          starter={DOCUMENT_STARTER}
          rows={12}
          showPreview={false}
          checks={[
            hasDoctype(),
            hasLangAttribute(),
            hasCharset(),
            hasViewport(),
            hasNonEmptyTitle(),
          ]}
          hint="Four of the five things go in the head. The fifth is an attribute on the element that wraps the whole document."
          solution={DOCUMENT_SOLUTION}
          solutionExplanation={(
            <ul>
              <li>The doctype puts the browser in standards mode rather than a legacy compatibility mode.</li>
              <li><code>lang="en"</code> tells a screen reader which language to pronounce.</li>
              <li><code>meta charset</code> stops accented characters rendering as nonsense.</li>
              <li>The viewport meta makes a phone use its real width instead of pretending to be a desktop.</li>
              <li>The title names the page in the tab, in bookmarks, and in search results.</li>
            </ul>
          )}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      ),
    },
    {
      id: 'complete-form',
      title: 'Make this sign-up form accessible and submittable',
      sectionLabel: 'Complete the fragment',
      render: ({ completeStep, outcome }) => (
        <HtmlExercise
          storageKey="html-practice-form"
          title="A form that nobody can use and the server never receives"
          brief={(
            <p>
              The text beside each field is plain text, so no control is labelled, nothing carries a name, and the form
              has no method. Sign-ups are stored on the server. Connect every label to its control, give every control a
              name, use the right input types for a name and an email address, and choose the method that fits.
            </p>
          )}
          assistedCompleted={outcome === 'assisted'}
          starter={FORM_STARTER}
          rows={16}
          showPreview={false}
          checks={[
            everyControlHasLabel(),
            everyControlHasName(),
            inputTypesInclude(['text', 'email']),
            formUsesMethod('post'),
          ]}
          hint="A label connects with for, and the control it points at needs a matching id. The id connects the label; the name is what the server receives."
          solution={FORM_SOLUTION}
          solutionExplanation={(
            <ul>
              <li>Each <code>for</code> matches the <code>id</code> of its control, so clicking the label focuses the field and a screen reader announces it.</li>
              <li>Each control has a <code>name</code>. Without one the value is simply not submitted.</li>
              <li><code>type="email"</code> gets the right keyboard on a phone and the browser's own validation.</li>
              <li>A sign-up changes stored data, so <code>post</code> keeps it out of the URL and out of a refresh repeating it.</li>
            </ul>
          )}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      ),
    },
    {
      id: 'build-page',
      title: 'Build a semantic page from nothing',
      sectionLabel: 'Transfer',
      render: ({ completeStep, outcome }) => (
        <HtmlExercise
          storageKey="html-practice-page"
          title="A page for the student film club"
          brief={(
            <>
              <p>
                The club wants a page listing this week's screenings. Each screening is also posted separately on social
                media, so each one stands on its own.
              </p>
              <p>The page needs:</p>
              <ul>
                <li>a header containing the club name as the page heading, and a navigation block of links in a list;</li>
                <li>a main region holding the screenings under a heading for the week;</li>
                <li>two screenings, each one a self-contained item with its own heading, an image, and a paragraph;</li>
                <li>a footer;</li>
                <li>headings that step down one level at a time, and an alt attribute on every image.</li>
              </ul>
              <p>Use the preview to see it, and the reference guide in the previous module if you need the syntax.</p>
            </>
          )}
          assistedCompleted={outcome === 'assisted'}
          starter={PAGE_STARTER}
          rows={20}
          checks={[
            usesSemanticRegions(['header', 'nav', 'main', 'article', 'footer']),
            hasExactlyOne('single-main', 'main', 'The page has exactly one <main>.'),
            hasElement('nav-list', 'nav ul li a', 'The navigation links sit in a list inside <nav>.'),
            hasElement('two-articles', 'main article:nth-of-type(2)', 'The main region holds two self-contained screenings.'),
            headingOrderIsSound(),
            everyImageHasAlt(),
            nestingIsValid(),
            hasNoScript(),
          ]}
          hint="Work outwards. Put the three regions in the body first, then fill each one. The week heading is an h2 under the club name, and each screening heading sits below that."
          solution={PAGE_SOLUTION}
          solutionExplanation={(
            <ul>
              <li><code>&lt;header&gt;</code>, <code>&lt;main&gt;</code>, and <code>&lt;footer&gt;</code> state what each region of the page is for.</li>
              <li>Each screening is an <code>&lt;article&gt;</code> because it is posted on its own elsewhere, which is the test for that element.</li>
              <li>Navigation links go in a list inside <code>&lt;nav&gt;</code>, so they can be counted and skipped as a group.</li>
              <li>The headings run h1 for the club, h2 for the week, h3 for each screening, with no level skipped.</li>
              <li>Each <code>alt</code> describes what the image shows, which is what someone who cannot see it needs.</li>
            </ul>
          )}
          onCorrect={() => completeStep()}
          onAssisted={() => completeStep('assisted')}
        />
      ),
    },
  ];

  return (
    <LearningModuleLayout module={module} manualCompletion={false}>
      <LearningFlow
        storageKey="html-css-practice"
        steps={steps}
        moduleTitle={module.title}
        onFinish={() => setCompleted(module.slug, true)}
      />
    </LearningModuleLayout>
  );
}
