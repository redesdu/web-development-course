# HTML structure and CSS layout

- Status: implemented; instructor factual review pending
- Kind: lesson
- Source boundary: `materials/slides/lecture-2.pptx`, slides 2-68
- Instructional focus: slides 11-23, 30-34, and 36-65
- Coverage IDs claimed: `COV-020`, `COV-021`, `COV-022`, `COV-023`, `COV-024`, `COV-025`
- Audience: third-semester software-engineering students encountering front-end foundations
- Estimated time: 30-40 minutes
- Prerequisite: ordinary HTTP request-response behaviour from the Lecture 1 pilot

## Learning objectives

After the module, students can:

1. Distinguish the responsibilities of HTML and CSS in a web interface.
2. Choose semantic elements that communicate the purpose of page regions.
3. Trace selector matching and a limited, same-origin CSS cascade example.
4. Apply structure, selector, and layout decisions to a fresh page.

## Source and scope notes

- Slides 11-18 introduce HTML documents, elements, tags, and attributes.
- Slides 19-23 introduce form controls and simplified GET and POST examples.
- Slides 30-34 introduce semantic HTML and its value for machine interpretation and accessibility.
- Slides 36-55 introduce CSS rules, inclusion methods, selectors, combinators, pseudo-classes, and pseudo-elements.
- Slides 56-65 introduce the box model, block and inline layout, visibility, alignment, Flexbox, and Grid.
- Slides 3-5 describe a portfolio task. The module does not reproduce or solve that task.
- Slides 24-29 provide a brief HTML history timeline. It remains enrichment because it does not support the target performance.
- The source simplifies cascade precedence and says `!important` always wins. The module teaches only a bounded same-origin, normal-declaration example until the instructor confirms broader depth.
- The source describes Flexbox axes as horizontal and vertical. The module uses main-axis language because `flex-direction` can change the physical direction.
- All course-news, announcement, toolbar, gallery, and search cases are new formative examples.

## Conceptual hinge

HTML communicates structure and meaning. CSS first matches elements through selectors, then the cascade resolves competing declarations, and layout rules determine how the selected elements occupy space.

## Likely misconceptions

- HTML decides visual layout while CSS supplies page meaning.
- A visually identical `div` communicates the same structure as a semantic element.
- A class name is written without a full stop in a CSS selector.
- The last rule always wins, regardless of selector specificity.
- Flexbox is always horizontal and Grid is always vertical.
- `display: none` and `visibility: hidden` have the same layout effect.

## Learning sequence

1. Contrast the roles of HTML and CSS through a course-news example.
2. Construct semantic structure for navigation, main content, and an independent article.
3. Read the anatomy of a CSS rule and predict the winner in a bounded cascade example.
4. Classify layout and visibility requirements by mechanism.
5. Plan a responsive announcements page in a fresh context.

## Interaction contract

- Learner action: choose semantic elements, predict a CSS result, classify layout requirements, and construct a fresh page plan.
- Conceptual target: connect structure, selector matching, cascade, and layout rather than treating CSS as decoration applied everywhere.
- Visible response: selections assemble into a page plan and receive field-specific explanations.
- Feedback: explain which requirement each element, selector, or layout mechanism satisfies and why a near miss fails.
- Completion event: correct structured decisions plus an original explanation for the fresh page.
- Transfer: plan a responsive announcement interface that does not reuse the worked news-card wording.

## State contract

- Input state: stable semantic choices and learner explanation text.
- Derived state: field completeness and correctness.
- Persisted state: versioned semantic IDs and text through course-scoped storage.
- Navigation state: stable step IDs managed by `LearningFlow`.
- Terminal state: the fresh page plan is submitted with correct structured choices.
- Recovery state: missing, malformed, stale, or out-of-range data opens a valid fresh activity.
- Reset state: local activity reset revokes its step completion; course Start over clears the whole path.

## Accessibility, rights, and visual fit

- Core actions use labelled native selects, radio controls, buttons, and a textarea.
- Classification uses buttons and does not require dragging.
- Feedback uses text and status regions, not colour alone.
- Code examples scroll or wrap safely on narrow screens.
- No slide, logo, screenshot, comic, third-party image, or portfolio answer is republished.
- The module inherits the shared course palette, typography, controls, and navigation.

## Open instructor decisions

- Confirm whether HTML history is examinable. Default: enrichment, not practised.
- Confirm the intended depth for CSS cascade, form semantics, pseudo-elements, Flexbox, and Grid.
- Confirm factual and pedagogical accuracy before changing the registry status from `draft`.


## Update: reference guide, box model, and completion (this revision)

- Estimated time raised to 45 minutes to account for the reference guide and the box-model section.
- A consultable HTML guide was added as an autocompleting step. It uses native `<details>` sections, so the browser provides opening, closing, keyboard operation, and in-page find without script, and every section is reachable by assistive technology. Sections cover element anatomy, document shape, metadata, text and heading hierarchy, links and images with `alt`, lists and tables, containers, semantic elements, forms with label, `id`, `name`, type and method, and the common attributes including the difference between `id` and `class`. Each section pairs a short example with the rule for choosing between similar options.
- A box-model step was added covering content, padding, border, margin, and `box-sizing`, and connecting Flexbox and Grid back to the parent element that has to exist in the markup before it can be styled.
- The written transfer answer now applies the shared twenty-word minimum, with the requirement stated before writing and a live `N / 20 words` counter. Answers saved before the requirement existed still load.
- Finishing the module now shows a completion summary in place, rather than recording completion invisibly. See `docs/ai101-reference-standard.md` and the shared `LearningFlow` component.
- The cascade check now offers a hint and a separated solution after three incorrect attempts, recording the step as `assisted`.
