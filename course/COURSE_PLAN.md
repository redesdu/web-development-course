# Course plan

Status: **proposed for instructor review**

Lifecycle stage: **planning**

## Course promise

This platform helps students turn a system requirement into a justified, modular full-stack web application and explain how its browser-server communication, security, performance, and architecture choices work.

## Audience and role

- Learners: software-engineering students beginning web development
- Prior knowledge: basic programming experience; little reliable web-development knowledge
- Platform role: ungraded preparation, weekly exercise support, and exam revision
- Relationship to assessment: formative support only; no graded tasks, assignment solutions, restricted exam material, or claims that platform completion affects grades
- Language: English

## Learner model

- Students can write basic programs and reason about variables, control flow, and functions.
- They may recognise web technologies by name without being able to explain how browser, network, server, and application code cooperate.
- Recurring difficulties are theory-to-code transfer, request-response tracing, method and status selection, diagnosis from evidence, and non-functional tradeoffs.
- Confidence and prior framework exposure will vary. The platform should introduce mechanisms before framework vocabulary and permit review without penalising experienced learners.
- Students must be able to perform independently during graded coding assignments and restricted-aid examination conditions. Practice should build explanation and debugging habits rather than supply finished solutions.

## Course-level outcomes

By the end of the course, students should be able to:

1. Evaluate system and user requirements and justify when a web application is or is not an appropriate solution.
2. Trace and explain how a browser and server exchange and process data using URLs, HTTP requests, responses, methods, status codes, headers, and bodies.
3. Design and implement a dynamic interface and server-side processing that together meet stated requirements.
4. Design and implement a modular distributed CRUD application, including a coherent mapping from user intent to HTTP and MVC responsibilities.
5. Apply and justify security, efficiency, scalability, interoperability, and testing practices, then diagnose functional, performance, and security failures using evidence.
6. Explain the relationship between requirements, theory, architecture, code, and observed behaviour in a fresh project case.

## How the platform should support the course

- Keep one visible course path connecting preparation, lecture concepts, exercise work, and revision.
- Begin modules with a concrete system decision or observable failure, then introduce formal terminology when it helps students explain the mechanism.
- Ask students to predict requests, trace state across browser and server, construct messages, diagnose failures, compare designs, and explain decisions.
- Use examples that resemble project domains without generating a student's graded solution.
- Keep explanatory feedback visible until the learner chooses to continue. Support retry, reset, return visits, keyboard use, and narrow screens.
- Use device-local progress for orientation only. Do not imply grading, instructor reporting, mastery, or synchronization.
- Add integrated revision practice only when it retrieves or transfers a stated performance. Do not default every item to multiple choice.

## Course visual direction

- Direction: technical, restrained, spacious, diagram-led
- Representative source evidence and locators: `../materials/theory/slides/lecture-1.pptx`, slides 1, 2, 11, 17, 32, 33, 48, 52-57, 59-69, 79-84
- Preserve: strong hierarchy, generous whitespace, black-and-white clarity, sparse warm divider accents, and simple client-server diagrams
- Adapt: convert dense protocol tables and message samples into responsive, readable traces with explicit labels
- Reject: slide-sized text blocks, tiny labels, screenshots used as explanation, decorative historical images, and unapproved branding
- Palette roles: aligned with the AI101 course shell (`aiml-sdu/ai101`) at instructor request, so the two SDU courses read as one family. Near-neutral zinc surfaces, a single blue accent, flat panels separated by hairline borders rather than raised cards, and distinct success, warning, and error roles in light and dark modes. Muted text and dark accent text are one step darker and lighter than the source respectively, because the source values did not reach 4.5:1 on this course's surfaces.
- Typography: Inter with a system sans-serif fallback for headings and body, matching the AI101 stack; system monospace for HTTP and code samples
- Geometry and density: balanced corners and moderate density, with one main cognitive task per section. Layout, navigation, and component structure are unchanged from this course's own design; only palette, type, and surface treatment follow AI101.
- Theme default: dark, matching the AI101 companion course. An explicit choice from the theme control is remembered and overrides it on every later visit. Nothing is written to storage until the student presses the control.
- Diagram and image treatment: accessible line diagrams, labelled states, and text alternatives; no source screenshots or third-party media
- Brand and asset rights: original deck, SDU logo, historical screenshots, and third-party images may not be published
- Instructor approval: rights boundary confirmed. The AI101 alignment was requested by the instructor on 15 September 2026; the derived palette still needs a look beside the pilot before it is called final.

## Concept map and difficult transitions

```text
user and system requirements
    -> decide whether web delivery is appropriate
    -> browser, network, server, and front-end/back-end responsibilities
    -> HTTP request and response cycle
    -> URL + method + headers/body + status
    -> CRUD intent and application behaviour
    -> modular MVC and distributed architecture
    -> security, performance, scalability, interoperability, and testing
    -> evidence-based diagnosis and design justification
```

Threshold concepts and recurring misconceptions:

- A web application is a distributed system, not simply a page or a chosen framework.
- The browser and server exchange messages with defined semantics. A visible UI action does not directly call a database operation.
- HTTP methods and status codes communicate intent and outcome; they are not arbitrary labels.
- CRUD and HTTP are related but not one-to-one. Both `PUT` and `PATCH` can support update behaviour with different semantics.
- HTTPS protects communication but does not by itself make an application secure.
- Performance, security, scalability, and testability are design concerns across components, not a final checklist.
- A symptom in the interface may originate in request construction, transport, server processing, data handling, or response interpretation.

## Proposed learning path

Detailed module boundaries are proposed only where current source material supports them. Later modules remain provisional until their slides, labs, and practice material are available.

| No. | Module | Source boundary | Intended outcome | Conceptual hinge or misconception | Candidate interaction and learner action | Connection and time | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | Choosing web for a real requirement | Lecture 1, slides 12-16 and 34-38 | Judge whether a web solution fits a case and justify the choice using benefits, constraints, and user needs | Web technology is not automatically the best delivery choice | Prediction and comparison: choose web or non-web, then test the choice against a changed constraint | Opens the course; 15-20 min | proposed |
| 2 | From user action to request and response | Lecture 1, slides 36 and 49-58 | Trace one browser action across client, network, proxy, and server and explain which side initiates each HTTP exchange | The interface, internet, and server are not one process | Step-through trace: place and explain request/response states | Prerequisite for HTTP semantics; 20-25 min | proposed |
| 3 | HTTP intent, evidence, and CRUD | Lecture 1, slides 31-85; focused evidence on slides 34-38, 49-69, and 81-83 | Construct and diagnose a request/response pair, choose a defensible method and status family, and connect the exchange to CRUD intent | CRUD intent does not map mechanically to one HTTP verb or guarantee a successful outcome | Construction and diagnosis: assemble an exchange, inspect a near miss, and transfer to a new project case | First registered pilot; 25-35 min | implemented; instructor review pending |
| 4 | Quick check: web apps, HTTP, and CRUD | Lecture 1, slides 36-38, 49, 54, 59-69, and 81-83 | Retrieve and distinguish core ideas immediately after the lesson | Recognition does not replace construction or explanation | Nine retryable MCQs with explanatory feedback | Follows the HTTP pilot; 15 min | implemented; instructor review pending |
| 5 | HTML structure and CSS layout | Lecture 2, slides 2-68; focused evidence on slides 11-23, 30-34, and 36-65 | Choose meaningful HTML structure, trace CSS matching and cascade, and apply layout decisions to a fresh page | HTML meaning, selector matching, cascade, and layout are different parts of one interface mechanism | Semantic construction, cascade prediction, layout classification, and a fresh page plan | Follows HTTP foundations; 30-40 min | implemented; instructor review pending |
| 6 | Practice: structure and style a web page | Lecture 2, slides 11-23, 30-34, and 36-65 | Retrieve selector language, distinguish HTML/CSS responsibilities, and produce a fresh interface plan | Recognition alone cannot establish the ability to structure and style a page | Classification, flashcards, one method MCQ, selector matching, and short application | Follows the Lecture 2 lesson; 15-25 min | implemented; instructor review pending |
| 7 | Why HTTP changed | Lecture 1, slides 70-79; note on slide 76 | Compare selected protocol versions and explain why connection reuse, multiplexing, and QUIC address different constraints | Newer HTTP is not merely a faster version number | Simulation or comparison: predict latency and blocking consequences under fixed inputs | After the request/response model; 15-20 min | proposed, factual review needed |
| 8 | Project reasoning and independent explanation | Lecture 1, slides 22-24 and 27-30 | Explain a project decision by linking requirements, theory, architecture, code, and non-functional consequences without copying a solution | A working implementation is not sufficient evidence of understanding | Diagnosis and short explanation with a fresh, non-graded case | Bridges to exercises and revision; 15-20 min | proposed |
| 9 | Dynamic browser behaviour | Lecture 1, slide 7; detailed source pending | Implement and diagnose interfaces that respond to user input and server data | UI state and server state are related but distinct | State trace and debugging; exact design after source review | After front-end foundations; time pending | provisional |
| 10 | Server-side processing and MVC | Lecture 1, slides 7, 8, 15, 23; detailed source pending | Design and implement logically grouped server-side responsibilities using MVC | A framework does not create modularity automatically | Request-to-controller/model/view trace | After HTTP and CRUD; time pending | provisional |
| 11 | Secure web applications | Lecture 1, slides 6-8, 19, 22, 30, 38, 50; detailed source pending | Apply and justify controls for injection, XSS, authentication, and transport security | HTTPS is only one layer of application security | Threat diagnosis and secure-code comparison | After end-to-end application flow; time pending | provisional |
| 12 | Performance, scalability, and testing | Lecture 1, slides 6-8, 12, 22, 37-38; detailed source pending | Measure behaviour, locate bottlenecks, reason about concurrent use, and choose appropriate tests | Performance and scalability are observable system properties, not vague quality labels | Parameter comparison and evidence-based diagnosis | After full-stack architecture; time pending | provisional |
| 13 | Integrated design justification | Lecture 1, slides 22-24 and course objectives; later sources pending | Defend a complete web-system design and diagnose a fresh failure using course concepts | Good decisions must connect requirements, mechanisms, and evidence | Capstone case analysis without reproducing graded tasks | Final synthesis and revision; time pending | provisional |

## Shared conventions

- Language and terminology: English; use the source terms consistently and correct `CURD` to `CRUD`
- Code and protocol notation: use monospace blocks, preserve capitalization for HTTP methods, label start line, headers, blank line, and body explicitly
- Feedback: explain the governing mechanism, name the likely assumption behind a wrong path, and point to a better next check
- Interaction rhythm: concrete problem, learner commitment, visible consequence, explanation, near miss, practice, explicit continuation, and fresh transfer where the objective needs it
- Completion: record meaningful learner action, not page visitation; restore resolved answers and explanations on revisit
- Navigation and progress: use the shared registry-driven path and anonymous local progress
- Practice: embedded checks plus optional integrated revision modules on the same path
- Practice retry: allow retries after explanatory feedback; never auto-advance or clear feedback on a timer
- Proposed storage namespace: `sdu-web-development-2026`; confirm or replace before pilot implementation and keep stable afterward

## Material inventory

| Path | Type | Relevant topics | Publication constraint | Inspection notes |
| --- | --- | --- | --- | --- |
| `../materials/course-info.md` | Markdown summary | organization, outcomes, assessment, project, AI policy | paraphrase only; current itslearning information remains authoritative | Fully readable; derived from Lecture 1 slides 5-30 |
| `../materials/theory/slides/lecture-1.pptx` | PowerPoint, 85 slides | orientation, web-app motivation, HTTP/HTTPS, methods, status, messages, URLs, HTTP evolution, QUIC, CRUD, DevTools | do not publish deck, logo, screenshots, or third-party images; accessible recreation allowed | All slides rendered and text extracted; only substantive speaker note found is slide 76: “What is the difference between TCP and UDP?” |
| `../materials/theory/slides/~$lecture-1.pptx` and `~$Lecture 1...pptx` | temporary PowerPoint lock files | none | do not use | Office lock files, excluded from content inventory |
| repository `materials/` subfolders | placeholder READMEs | future slides, labs, readings, practice, datasets, assets | unknown until supplied | No additional teaching sources currently present |

The source material currently sits outside the repository. This is usable for onboarding but makes future source trails non-portable. Before module authoring, place approved authoring copies under repository `materials/` or document a stable external source process. Do not put restricted source files in `public/`.

## Content coverage ledger

Eight items are implemented in the pilot; the remaining items are `planned` or `unassigned`. Nothing is instructor-reviewed yet.

| ID | Source and locator | Required content or performance | Importance | Destination | Evidence expected | Status | Decision note |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `COV-001` | Lecture 1, slides 12-16 | Distinguish concepts and techniques from particular tools and frameworks | core | Module 1 and later modules | Technology-choice explanation and transfer case | planned | Confirmed in current scope |
| `COV-002` | Lecture 1, slides 34-38 | Judge when a web application is and is not appropriate | core | Module 1 | Constraint comparison and written justification | planned | Confirmed north-star component |
| `COV-003` | Lecture 1, slides 36-38 | Explain browser-accessed remote software and its benefits and difficulties | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | Trace and near miss; scenario judgement that separates a benefit from a trade-off | implemented | Instructor review pending |
| `COV-004` | Lecture 1, slide 38 | Relate performance, scalability, security, personalization, and authentication to distributed web use | supporting | Modules 1, 9, 10 | Initial classification plus later applied evidence | planned | Depth awaits later sources |
| `COV-005` | Lecture 1, slides 40-47 | Recognise selected stages and interpretations of web evolution | enrichment | Module 1 or explicit exclusion | Short context note, if retained | unassigned | Web 1.0/Web 3.0 framing needs instructor review |
| `COV-006` | Lecture 1, slides 49-53 | Explain HTTP's role in layered client-server communication, including intermediaries | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | Five-stage trace and a keyboard-operable ordering activity for an exchange through a proxy | implemented | Recreated in HTML; no third-party diagram republished; instructor review pending |
| `COV-007` | Lecture 1, slides 54-58 | Trace the request-response pattern and identify the initiating party | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | Trace, proxy ordering activity, and a status-as-evidence diagnosis | implemented | Qualified as an ordinary browser-initiated exchange; instructor review pending |
| `COV-008` | Lecture 1, slide 50 | Explain what HTTPS/TLS adds and what it does not guarantee | core | Modules 2 and 9 | HTTP/HTTPS comparison and security near miss | planned | Security depth awaits later source |
| `COV-009` | Lecture 1, slide 59 | Select and explain HTTP methods for a stated intent | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | Builder, update and delete construction activities, and a diagnosis of a method that contradicts its effect | implemented | Instructor review pending |
| `COV-010` | Lecture 1, slides 60-65 | Interpret 1xx-5xx status families as response evidence | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | Diagnostic feedback and a fault-location scenario where a 2xx is the evidence | implemented | No http.cat image republished; instructor review pending |
| `COV-011` | Lecture 1, slides 66-68 | Identify and construct start line, headers, blank line, and optional body | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | Worked messages, builder, and a diagnosis of a request whose missing blank line causes a 400 | implemented | Replaces compressed GET-body example; instructor review pending |
| `COV-012` | Lecture 1, slide 69 | Interpret protocol, host, port, and path in a URL | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | URL anatomy strip and a collection-versus-item interpretation scenario | implemented | Instructor review pending |
| `COV-013` | Lecture 1, slides 70-77 | Compare selected HTTP versions and the problems their changes address | supporting | Module 4 | Fixed-case comparison with explanation | planned | Dates and simplified feature claims need factual review |
| `COV-014` | Lecture 1, slides 78-79 and note 76 | Explain the role of QUIC, TLS, connection IDs, reliability, and multiple streams at an introductory level | supporting | Module 4 | TCP/UDP prerequisite check and stream comparison | planned | Only explicit speaker note asks for TCP/UDP distinction |
| `COV-015` | Lecture 1, slides 81-83 | Map Create, Read, Update, and Delete intent to defensible HTTP operations in a project context | core | HTTP intent, evidence, and CRUD; Lecture 1 practice | CRUD map, builder, a twenty-word written transfer on the DELETE case, and update and delete construction activities | implemented | Uses confirmed `CRUD` correction; instructor review pending |
| `COV-016` | Lecture 1, slide 84 | Use Chrome DevTools to inspect a real exchange | core lab capability | Module 3 or lab support | Network-panel observation and evidence capture | unassigned | Slide is a title only; lab instructions or instructor input required |
| `COV-017` | Lecture 1, slide 28 | Propose a suitable project and justify why web delivery fits | core practice | Modules 1 and 5; exercise session | Fresh project-choice explanation | planned | Must not become a graded-project solution generator |
| `COV-018` | Lecture 1, slides 22-24 | Explain links among requirements, theory, code, architecture, security, and performance | core | Modules 5 and 11 | Short explanation and integrated case analysis | planned | Use novel formative cases only |
| `COV-019` | Lecture 1, slides 29-30 | Follow academic-honesty and no-AI boundaries for assessed coding | administrative | Course orientation outside graded practice | Clear policy signpost to current itslearning guidance | planned | Policy may change; itslearning is authoritative |
| `COV-020` | Lecture 2, slides 11-18 | Read and construct basic HTML document structure, elements, and attributes | core | HTML structure and CSS layout; Lecture 2 practice | Consultable HTML guide covering element anatomy, document shape, metadata, text, links, images, lists, tables, containers, and attributes; plus a document-and-metadata completion exercise checked with `DOMParser` | implemented | Instructor review pending |
| `COV-021` | Lecture 2, slides 19-23 | Choose a common form method for a clearly stated retrieval or submission behaviour | core | HTML structure and CSS layout; Lecture 2 practice | Guide section on method, label, id, name, and type; a two-form judgement decided by consequence; and an accessible-form completion exercise | implemented | Uses qualified common-case wording; instructor review pending |
| `COV-022` | Lecture 2, slides 30-34 | Choose semantic HTML elements and explain why meaning matters | core | HTML structure and CSS layout; Lecture 2 practice | Semantic construction, a judgement on when a div is the honest answer, and a full page build checked for semantic regions, heading order, and image alternatives | implemented | No source diagram republished; instructor review pending |
| `COV-023` | Lecture 2, slides 36-41 and 47-50 | Explain the roles and basic anatomy of a CSS rule and stylesheet | core | HTML structure and CSS layout; Lecture 2 practice | HTML/CSS contrast, rule anatomy, responsibility classification | implemented | Instructor review pending |
| `COV-024` | Lecture 2, slides 42-55 | Interpret common selectors and trace a bounded cascade example | core | HTML structure and CSS layout; Lecture 2 practice | Cascade prediction in the lesson, and a four-rule specificity judgement where source order is the tempting wrong answer | implemented | Bounded example with no !important, inline styles, layers, or origin interaction; broader cascade and pseudo-element depth needs instructor review |
| `COV-025` | Lecture 2, slides 56-65 | Distinguish box-model spacing, visibility behaviour, Flexbox, and Grid | core | HTML structure and CSS layout; Lecture 2 practice | Box-model explanation covering content, padding, border, margin, and box-sizing; layout classification; and a judgement where wrapping alone does not settle Flexbox against Grid | implemented | Uses main-axis wording instead of fixed horizontal/vertical claim; instructor review pending |
| `COV-026` | Lecture 2, slides 3-10 | Plan a portfolio interface and identify listed UX problems | administrative and applied | External portfolio task; module introduction only | Instructor-owned portfolio submission and later design practice | deferred | Do not reproduce or solve assessed portfolio work; exact platform role needs instructor confirmation |
| `COV-027` | Lecture 2, slides 24-29 | Recall selected HTML history milestones | enrichment | Optional context | No required learner evidence in the current pilot | deferred | Default enrichment boundary; confirm if examinable |

## Risks, contradictions, and open decisions

- The available deck covers only course orientation and the first introduction lecture. Full-course module boundaries and coverage cannot be finalized until later slides, labs, readings, assignments, and permitted practice material are supplied.
- The schedule and assessment policy are explicitly preliminary. The platform must direct students to current itslearning guidance rather than present dates as permanent.
- Slides 80-83 repeatedly say `CURD`; learner-facing material should use `CRUD`.
- Slides 54 and 58 say a server cannot send anything unless the client asks. That is a useful basic HTTP request-response model but is too absolute for modern browser-server communication and should be qualified before publication.
- Slide 67 appears to show a body on a `GET` example and compresses the request line and headers. Use a clearer, standards-aligned formative example after instructor review.
- Slides 70-79 compress protocol history, dates, multiplexing, QUIC, TCP, UDP, reliability, and security into brief claims. They need factual review and a clearer prerequisite boundary before Module 4 is approved.
- Slide 47 combines decentralized Web3 and Semantic Web claims. Treat it as enrichment or revise its framing after instructor review.
- Slide 84 names Chrome DevTools but supplies no inspectable procedure. `COV-016` remains unassigned until a lab demonstration or expected capability is provided.
- Original visual assets and third-party material cannot be published under the confirmed rights boundary.
- Course code, term, exact accessibility needs, later-source boundaries, and final visual approval remain open.

## Pilot decision

- First vertical slice: **HTTP intent, evidence, and CRUD** within the requested slides 31-85 boundary, with focused evidence from slides 34-38, 49-69, and 81-83
- Why it is representative: it joins theory to project behaviour, exposes several recurring misconceptions, supports construction and diagnosis rather than passive recall, and can be checked through a fresh project case without revealing graded solutions
- Candidate interaction family: construction and diagnosis with a short step-through trace
- Success evidence: students can build and explain a plausible request/response exchange for a fresh CRUD action, diagnose one malformed or semantically weak exchange, and justify the correction
- Instructor approval: implementation requested; factual and pedagogical review pending

## Practice strategy

- Put short prediction, tracing, construction, and diagnosis checks inside study modules.
- Add dedicated revision practice as normal modules on the shared path only after enough source-backed items exist.
- Use MCQ selectively for recognition and discrimination. Use message construction, ordering, debugging, and short explanation when the target is performance or transfer.
- Do not reuse graded assignment prompts or restricted exam questions.
- Explain both correct and likely incorrect reasoning. Keep feedback visible until explicit continuation, allow retry/reset, and restore resolved feedback on revisit.

## Lifecycle evidence still needed

- Template setup: starter runs locally; example module source files remain as authoring references but are not registered as course content
- Material inventory: complete for the attached folder on 2 September 2026
- Extraction: all 85 slides rendered and text-extracted; one substantive speaker note found; diagrams and screenshots visually reviewed; no embedded media beyond still images detected
- Coverage and scope: initial ledger proposed; instructor review still required
- Pilot brief and implementation: implemented in `course/module-briefs/http-intent-evidence-crud.md` and `src/course/modules/HttpIntentCrudModule.tsx`; instructor review pending
- Browser and accessibility QA: production build passed; Playwright passed the full pilot path, persistence after reload, keyboard activation and focus movement, mobile navigation, overflow checks, and automated accessibility scans in desktop and mobile Chromium; desktop and 320px screenshots were visually inspected on 2 September 2026
- Instructor factual review: required for the flagged HTTP, Web history, and QUIC claims
- Representative learner observation: required after a pilot is available
- Release readiness and publication approval: not started
