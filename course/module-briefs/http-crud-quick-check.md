# Practice: reason about HTTP exchanges

- Status: implemented; instructor factual review pending
- Kind: formative practice
- Source boundary: `materials/slides/lecture-1.pptx`, slides 36-38, 49, 54, 59-69, and 81-83
- Coverage IDs retrieved: `COV-003`, `COV-006`, `COV-007`, `COV-009`, `COV-010`, `COV-011`, `COV-012`, and `COV-015`
- Audience for this set: third-semester software-engineering students immediately after the related lesson
- Estimated time: 20-30 minutes
- Stakes: ungraded, anonymous, browser-local; no analytics or instructor reporting

## Practice objective

Students apply the Lecture 1 ideas to situations they have not seen, rather than matching a sentence to a definition. Each item asks for a decision that the vocabulary alone does not settle.

## Format rationale

The previous version of this set used nine recall MCQs. Recognition of a definition is a weak proxy for the course outcome, which is to trace, diagnose, and construct exchanges. `materials/course-info.md` records the instructor's practice strategy as request-response tracing, message construction, method and status diagnosis, and design decisions, and explicitly asks that MCQ not be used for every target.

Three interaction families are now used:

- Scenario judgement, where the wrong options are positions a student could defend and the feedback names the governing rule.
- Ordering, where a five-step exchange through a proxy has to be rebuilt from its dependencies.
- Construction, where a request and response are assembled from an intent and diagnosed field by field.

## Item design

| # | Activity | Target or misconception | Interaction | Source |
| --- | --- | --- | --- | --- |
| 1 | Argue the trade-off | A benefit is not a trade-off; shared data forces server execution and concurrency | Scenario judgement | Slides 36-38 |
| 2 | Order an exchange through a proxy | A proxy relays but does not become the initiating client | Ordering | Slides 49, 54 |
| 3 | Read a message that does not work | The blank line is structure, not formatting; 4xx blames the request | Scenario judgement | Slides 66-68, 60-65 |
| 4 | Two URLs, one difference | Path identifies the resource; collection and item differ | Scenario judgement | Slide 69 |
| 5 | Use the status as evidence | A 2xx locates the fault in the browser's handling of the response | Scenario judgement | Slides 54-58, 60-65 |
| 6 | Same screen, different intent | Create adds to a collection; update modifies what exists | Scenario judgement | Slides 81-83 |
| 7 | Diagnose a contradictory request | A working result does not make GET an honest verb for deletion | Scenario judgement | Slides 59, 81-83 |
| 8 | Build an update exchange | PATCH on the item path, reported with 2xx | Construction | Slides 59, 69, 81-83 |
| 9 | Build a delete exchange | DELETE on the item path, reported with 2xx | Construction | Slides 59, 69, 81-83 |

## Feedback and state

- Each activity stays visible after feedback, and feedback names the rule rather than only marking the answer.
- Construction items diagnose each field separately, so a partly correct answer is told which decision changed the meaning.
- After three incorrect attempts the student is offered a hint and then the solution with its reasoning, shown as two separate parts. Continuing records the step as `assisted`: it counts towards completion, carries no penalty, and is named in the local completion summary.
- Answers, feedback, attempt counts, and current position persist locally through stable IDs and reset through the course-wide Start over control.

## Accessibility and rights

- Questions use native radio inputs. Ordering uses labelled move-earlier and move-later buttons rather than drag and drop, so the activity is fully keyboard operable.
- No slide asset, logo, screenshot, or source image is published.
- The practice uses the shared course theme and navigation.

## Open review

- The scenarios, distractors, and feedback need instructor factual review before this module can move from `draft` to `ready`.
- The campus-proxy framing in item 2 is an instructional example, not a claim about SDU network configuration.
