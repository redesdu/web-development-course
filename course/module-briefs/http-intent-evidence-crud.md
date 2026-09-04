# HTTP intent, evidence, and CRUD

- Status: implemented; instructor factual review pending
- Kind: lesson
- Source boundary: `materials/slides/lecture-1.pptx`, slides 31-85
- Instructional focus inside that boundary: slides 34-38, 49-69, and 81-83
- Coverage IDs claimed: `COV-003`, `COV-006`, `COV-007`, `COV-009`, `COV-010`, `COV-011`, `COV-012`, `COV-015`
- Audience: first-semester software-engineering students with basic programming knowledge and little reliable web-development knowledge
- Estimated time: 25-35 minutes
- Previous knowledge this module activates: a program receives input, performs work, and produces output
- What this module prepares students for next: front-end and server-side implementation, DevTools network inspection, MVC request handling, and later security and performance reasoning

## Learning objectives

After the module, students can:

1. Trace a browser action through an HTTP request, server work, response, and interface update.
2. Read the method, URL or path, headers, body, and status family as evidence about an exchange.
3. Construct a defensible request and response for a CRUD intent.
4. Explain the mechanism in a fresh application case without relying on the worked example.

## Source notes and terminology

- Slides 34-38 motivate web applications and identify distributed-system benefits and difficulties.
- Slides 49-58 introduce HTTP, intermediaries, client-server roles, and request-response behaviour.
- Slides 59-69 cover methods, status families, message structure, and URL parts.
- Slides 81-83 connect HTTP methods with CRUD operations and project work.
- The deck says `CURD` on slides 80-83. The confirmed course terminology is `CRUD`; learner-facing content uses the confirmed correction and keeps the source issue visible here.
- Slides 54 and 58 describe server initiation too absolutely. This module teaches the ordinary browser-initiated HTTP exchange shown by the deck without claiming that all modern browser-server communication works only that way.
- Slide 67 presents a compressed GET example with a body. The worked example uses a clearer POST request and labels every message part.
- Slides 40-47, 70-79, and 84-85 remain inside the inspected source boundary but do not support this module's single target mechanism. Web history, protocol evolution, QUIC, and hands-on DevTools use retain their own destinations in the course plan.
- The campus equipment and saved-restaurant cases are new instructional examples, not source examples or graded assignment prompts.

## Coverage evidence

| Coverage ID | Intended depth or performance | Module evidence | Status after implementation |
| --- | --- | --- | --- |
| `COV-003` | Explain browser-accessed remote software | “A click starts a conversation” trace and near miss | implemented |
| `COV-006` | Explain HTTP's client-server role and possible intermediaries | Five-stage mechanism trace with an intermediary note | implemented |
| `COV-007` | Trace an ordinary browser-initiated request-response exchange | Trace explanation plus transfer prompt | implemented |
| `COV-009` | Select an HTTP method for a stated intent | CRUD map and reservation exchange builder | implemented |
| `COV-010` | Interpret 1xx-5xx status families | Status-family reference and builder feedback | implemented |
| `COV-011` | Identify start line, headers, blank line, and body | Annotated worked request and response | implemented |
| `COV-012` | Interpret protocol, host, port, and path | URL anatomy strip in the worked example | implemented |
| `COV-015` | Connect CRUD intent to defensible HTTP operations | CRUD map, builder, and fresh delete case | implemented |

## Conceptual hinge

A user action does not directly change shared server data. It begins a message exchange whose method, target, content, and response carry evidence about the requested operation and its outcome.

## Misconceptions to address

- The browser button directly edits the database.
- HTTP methods are interchangeable labels.
- CRUD maps one-to-one to exactly one method in every design.
- A response proves success even when its status says otherwise.
- A 4xx response means the server crashed, while a 5xx response means the user made a mistake.
- The response can be ignored once the request has been sent.

## Learning sequence

1. Begin with a student reserving shared equipment and ask what actually crosses the network.
2. Trace browser action, request, server work, response, and browser update.
3. Read a new POST request and 201 response by their parts, then connect status families and CRUD intent.
4. Construct the method, target path, and response family for a reservation case. Incorrect combinations receive field-level explanations and remain available for revision.
5. Explain a fresh delete case in a different domain, compare it with four mechanism criteria, and self-confirm the comparison before completing the module.

## Learner-facing voice

- Familiar opening situation or question: reserving a camera in a campus equipment site
- Formal terms introduced after: the learner sees the five-stage exchange in plain language
- Near miss: “The button deletes or creates the database row” skips the network message, server decision, and response
- Cold-read concerns: avoid framework vocabulary, unexplained protocol shorthand, and claims that every application uses identical endpoint paths

## Interaction rationale

- AI101 interaction family in `docs/ai101-reference-standard.md`: construction and diagnosis, followed by explanation transfer
- Closest course-neutral implementation in `src/course/modules/examples/`: `RouteExplorer.tsx` for commitment and explanatory feedback; shared `LearningFlow` for explicit continuation and restored state
- Learner action: select the request method, target path, and response family for a stated create intent, then write an explanation for a fresh delete case
- Conceptual target: connect user intent to an inspectable HTTP exchange rather than treating the interface as a direct database control
- Visible response: the selected fields assemble into a request-response preview and field-level diagnostic feedback; the transfer answer reveals a four-part comparison
- Feedback for correct and incorrect paths: explain what each chosen field communicates and which assumption a mismatch reveals
- Meaningful completion event: a correct constructed exchange plus a written fresh-case explanation that the learner compares against all four mechanism parts
- Revisit and reset behaviour: selections, diagnostic feedback, explanation, and self-check restore after reload; learners can revise without losing orientation
- Input state: fixed scenario, stable field options, learner selections, and learner explanation text
- Derived state: field correctness, complete exchange, explanation length, and comparison confirmation
- Persisted state: versioned JSON for the builder and transfer explanation, plus the shared learning-flow state
- Navigation state: current step and stable completed step IDs managed by `LearningFlow`
- Terminal state: the transfer comparison is confirmed and the learner explicitly presses Finish
- Recovery state: missing, malformed, stale, unknown, or out-of-range saved values return to a valid fresh state
- Stable IDs: `post`, `reservation-collection`, `success`; `trace-mechanism`, `read-messages`, `build-exchange`, `transfer-explanation`
- Storage schema version: 1 for both concept-specific activities; malformed-state fallback is empty selections or an empty explanation
- Transfer outside the interaction: explain a saved-restaurant DELETE exchange without reusing the reservation wording

## Assessment and feedback

The module is formative and ungraded. It does not use assignment code or restricted examination questions. Automatic feedback evaluates the structured exchange. The written explanation uses a transparent self-comparison rather than pretending to grade free text.

## Evidence of transfer

The final case changes the domain, CRUD intent, method, target path, and visible UI consequence. The learner must explain the whole mechanism in their own words before seeing the comparison criteria.

## Accessibility and media

- All core actions use labelled native selects, buttons, and a textarea.
- Feedback uses text and live regions rather than colour alone.
- The mechanism trace is an ordered HTML list with a complete text equivalent.
- Message examples scroll within their own frame on narrow screens.
- No original slide, logo, screenshot, illustration, or third-party image is reproduced.

## Visual fit

- Shared course theme followed: yes
- Concept-specific treatment: restrained line-like sequence, monospace messages, and high-contrast diagnostic panels
- Intentional deviation from `docs/theme-standard.md`: none
- Asset and font rights: system fonts and code-native HTML/CSS only

## Platform integration

- Uses the shared `LearningModuleLayout`: yes
- Registry position: first and currently only learner-facing course module; examples are removed from the registry but retained as authoring references
- Kind: lesson

## Open questions

- Instructor factual review is required before changing registry status from `draft` to `ready`.
- The source file is available in the attached course folder at `../materials/theory/slides/lecture-1.pptx`; the registry uses the instructor-requested stable source path `materials/slides/lecture-1.pptx`. The authoring copy should be placed there only if repository publication rights permit it.
