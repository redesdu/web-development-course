# Practice: write the markup

- Status: implemented; instructor factual review pending
- Kind: formative practice
- Source boundary: `materials/slides/lecture-2.pptx`, slides 11-23, 30-34, and 36-65
- Coverage IDs retrieved: `COV-020`, `COV-021`, `COV-022`, `COV-023`, `COV-024`, `COV-025`
- Audience: third-semester software-engineering students immediately after the Lecture 2 lesson
- Estimated time: 20-30 minutes
- Stakes: ungraded, anonymous, browser-local; no analytics or instructor reporting

## Practice objectives

Students can:

1. Decide when a semantic element is honest and when a `div` is the correct answer.
2. Choose a form method and a layout mechanism from the consequence each one has, not from a slogan.
3. Complete a document head and an accessible form so that both do their job.
4. Write a semantic, accessible page for a case they have not seen, and check it against stated requirements.

## Format rationale and progression

The previous version used flashcards and classification, which test recall of syntax. Recall is not the objective here: students who can name every element still produce pages made entirely of `div`. The set now moves from judgement to production.

1. Four conceptual activities, each posing a case where the lecture's rules do not settle the answer by themselves: semantics, form method, cascade specificity, and layout mechanism. Distractors are positions a student could defend, so choosing well needs interpretation.
2. Two fragment-completion exercises, where markup that renders but does not work has to be repaired: a document head missing its metadata, and a form whose controls are unlabelled, unnamed, and unsubmittable.
3. One full editor, where a semantic page for a student film club is written from a bare document.

## Checking

Student HTML is parsed with `DOMParser` and inspected as a tree, not matched with a regular expression. Checks cover document structure and metadata, element nesting, heading hierarchy, semantic regions, image alternatives, and label, name, type, and method on form controls. Each requirement is reported separately, so a partly correct answer shows what is still missing rather than a single pass or fail.

Two rules read the source instead of the tree, and the code says why: a browser repairs a doctype-less document and a block inside a paragraph before the tree can be inspected, so the mistake would otherwise be invisible.

## Safety of the editor

- The preview is an `iframe` with an empty `sandbox` attribute, so it has no script execution, no same-origin access, no form submission, and no navigation.
- The markup is additionally stripped of `script`, `iframe`, `object`, `embed`, `link`, inline event handlers, and `javascript:` URLs, and is given a `Content-Security-Policy` of `default-src 'none'` before it is inserted.
- These are independent layers. The preview cannot run student code or reach the network even if one of them were ignored.
- The exercises are HTML only. CSS remains the subject of questions and analysis, as recorded in the course assumptions.

## Feedback and state

- Requirements stay visible after a check and clear when the student edits again.
- After three failed checks the student is offered a hint, then the solution and its reasoning as two separate parts, then a Continue that records the step as `assisted`. The work the student wrote is never replaced.
- Editor contents, check results, attempt counts, and position persist locally and reset both per exercise and through the course-wide Start over control.

## Accessibility and rights

- The editor is a labelled `textarea` reachable and operable by keyboard. The preview `iframe` is titled and described.
- Check results pair an icon with text and an assistive-technology prefix, so nothing is carried by colour alone.
- The workspace collapses to a single column below 800 px.
- No slide asset, logo, screenshot, or source image is published. The film club case is invented for this exercise.

## Open review

- The conceptual cases, distractors, feedback, and worked solutions need instructor factual review before this module can move from `draft` to `ready`.
- The cascade item uses a bounded example with no `!important`, no inline styles, and no layer or origin interaction. Confirm that this is the intended depth.
