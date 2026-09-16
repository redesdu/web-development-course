# Course release record

Status: **blocked**

Audit date: **11 September 2026, CEST**

The current learner experience passes the complete local engineering gate, but it is not responsible to publish yet. No registered module has instructor-approved `ready` status, all 27 coverage decisions remain unresolved for release, the source-material repository boundary is not safe to assume, and the release owner, URL, support route, remote Pages settings, and rollback revision are not confirmed.

## Release target

- Intended audience: third-semester Software Engineering students with basic programming experience and little reliable prior web-development knowledge
- Course identity: the official course code is not provided; the interface currently uses `WEB-DEVELOPMENT`
- Platform role: ungraded preparation, weekly exercise support, and exam revision; completion does not affect assessment
- Candidate content: two Lecture 1 modules and two Lecture 2 modules, totalling approximately 100 minutes
- Target environment: GitHub Pages through the repository's manual deployment workflow
- Target URL: not confirmed
- Target date: not scheduled
- Release owner and rollback owner: not confirmed
- Learner support contact: not confirmed; current itslearning guidance remains the only recorded contact route
- Candidate state: uncommitted working tree based on commit `0e5c99b4b63fd6d767f28b5e611eca1fd0282bc0` on `main`
- Remote state: `origin/main` and remote `HEAD` resolved to the same commit on 11 September 2026; the candidate changes are therefore local only
- Deployment authorization: not granted; no workflow was dispatched and no deployment or repository-setting change was performed

## Content approval

There are **no registry entries with status `ready`**. All four current learner-facing drafts were nevertheless audited so that the decision covers the complete candidate platform.

| Module or practice | Registry status | Source boundary checked | Instructor approval | Representative learner observation | Release finding |
| --- | --- | --- | --- | --- | --- |
| HTTP intent, evidence, and CRUD | draft | Lecture 1, slides 31-85; focused evidence on 34-38, 49-69, and 81-83 | not recorded | not run | Mechanism, construction, diagnosis, and transfer are represented. The former invalid status-line and reset-completion defects are corrected and covered by tests. Factual wording, answers, examples, and depth still require instructor approval. |
| Quick check: web apps, HTTP, and CRUD | draft | Lecture 1, slides 36-38, 49, 54, 59-69, and 81-83 | not recorded | not run | Nine easy, retryable MCQs retrieve the intended lesson knowledge with explanatory feedback. The wording and distractors still require instructor approval. |
| HTML structure and CSS layout | draft | Lecture 2, slides 2-68; focused evidence on 11-23, 30-34, and 36-65 | not recorded | not run | Semantic HTML, selector matching, a bounded cascade example, layout classification, and fresh application are represented. The chosen depth and qualifications to simplified source claims require instructor approval. |
| Practice: structure and style a web page | draft | Lecture 2, slides 11-23, 30-34, and 36-65 | not recorded | not run | Classification, flashcards, one MCQ, selector tracing, layout decisions, and short application align with the production objective. Difficulty and clarity have not been observed with representative students. |

Content findings:

- Source boundaries and claimed evidence are documented in all four module briefs and the module registry.
- Learner-facing content uses `CRUD` while preserving the source's `CURD` typo as a documented source issue.
- The HTTP lesson qualifies the deck's absolute client-initiation wording and uses concrete response status lines such as `201 Created`.
- The Lecture 2 lesson limits its cascade claim to a bounded same-origin normal-declaration example, describes Flexbox through its main axis, and uses qualified GET/POST language.
- Examples are new formative cases. No graded portfolio solution, unpublished exam, or student submission is reproduced.
- The course visual direction is implemented from representative material but has not been approved by the instructor.
- `materials/course-info.md` and the material-inventory section of `course/COURSE_PLAN.md` still describe Lecture 1 as the only current source even though Lecture 2 and lab folders now exist. The release inventory is therefore not yet canonical.
- `course/module-briefs/http-intent-evidence-crud.md` still describes the source deck as external while the file now exists under `materials/slides/`; this traceability statement needs reconciliation with the approved repository rights boundary.

## Content coverage

The local coverage gate reported **27 items**:

- `reviewed`: 0
- `deferred`: 2
- `excluded`: 0
- `implemented` but not instructor-reviewed: 14
- `planned`: 9
- `unassigned`: 2

Release-blocking groups:

- Unassigned items: `COV-005`, `COV-016`
- Planned: `COV-001`, `COV-002`, `COV-004`, `COV-008`, `COV-013`, `COV-014`, `COV-017`, `COV-018`, `COV-019`
- Implemented but unreviewed: `COV-003`, `COV-006`, `COV-007`, `COV-009`, `COV-010`, `COV-011`, `COV-012`, `COV-015`, `COV-020`, `COV-021`, `COV-022`, `COV-023`, `COV-024`, `COV-025`
- Deferred without a recorded instructor decision: `COV-026` for the portfolio task boundary and `COV-027` for HTML history enrichment

Only `reviewed`, instructor-confirmed `deferred`, and instructor-confirmed `excluded` items are resolved at release. All 27 items therefore require either instructor review of implemented evidence or an explicit approved scope decision before publication.

## Learner experience evidence

- Course coherence: the registered path is Lecture 1 lesson, Lecture 1 retrieval practice, Lecture 2 lesson, then Lecture 2 mixed practice. Previous and next links are registry-driven and passed browser tests.
- Learning rhythm: lessons use concrete cases, mechanism explanations, learner construction or diagnosis, explanatory feedback, and fresh transfer. Lecture 2 practice deliberately mixes formats rather than treating MCQ as the default.
- Feedback and recovery: incorrect feedback, retry, revision, local reset, course-wide reset, completion, reload, and revisit are represented. Reset all progress clears current and declared legacy course state, preserves theme and unrelated browser data, reloads the application, and returns to a fresh first step.
- State restoration: versioned stable IDs and validated course-scoped storage restore resolved answers and explanations. Malformed-state fallbacks and reset-after-completion behaviour have automated coverage.
- Pointer and browser flows: routing, previous/next navigation, incorrect and correct paths, feedback, retry, completion, reload, reset, and return to the course were exercised against the production preview. The browser suite completed the two lesson paths and Lecture 2 practice; it exercised the first resolved item of the nine-question Lecture 1 quick check rather than completing all nine in-browser.
- Mobile behaviour: mobile Chromium passed the shared routes and learner flows. The navigation opens, moves to a module, and closes. Automated and manual checks found no page-level horizontal overflow.
- Manual visual evidence: Lecture 2 lesson and practice screenshots were inspected at 320 px, 390 px, and 1280 px. Controls stack, content hierarchy remains readable, and no clipping or horizontal overflow was observed.
- Course visual direction: technical, restrained, spacious, and diagram-led with system fonts and code-native visuals. Instructor approval is not recorded.
- Representative learner evidence: none. Ease, pacing, navigation comprehension, and whether activities elicit the intended reasoning remain unvalidated with students.

## Accessibility

- Automated axe scans passed for the home page and every registered module in the initial theme in desktop and mobile Chromium. The home page also passed in dark mode.
- Reduced-motion preference was enabled during the automated accessibility scan.
- Native selects, radios, buttons, and textareas have accessible names; feedback is textual and not colour-only.
- One keyboard focus transition in the HTTP lesson passed an end-to-end test. Native-control keyboard behaviour and visible focus styling are present.
- Reflow and overflow were checked at 320 px, 390 px, and 1280 px for the Lecture 2 routes; normal desktop and mobile viewports were exercised for all registered routes.
- Manual gaps: no complete keyboard-only pass across every activity, no screen-reader output check, no 200% zoom review, and no recorded manual verification of every dark-theme module state.
- Automated dark-theme coverage is incomplete because the current axe test scans only the home page after switching themes, not every module.
- The compact theme control has a 38 px minimum height and the Start over control has a 40 px minimum height, below the preferred 44 px touch target. This is an accessibility-quality issue to review before release even though axe did not flag it.

## Rights and privacy

- Confirmed publication boundary: course material may be paraphrased and diagrams may be recreated accessibly; original decks, the SDU logo, historical screenshots, and third-party slide images may not be published without further permission.
- `public/` contains only the code-native favicon.
- The current `dist/` contains only `index.html`, one CSS asset, one JavaScript asset, and the favicon. It contains no PowerPoint, PDF, source screenshot, logo, third-party image, source map, unpublished assessment, credential, or student record.
- The bundle contains the repository-relative source-path strings used by the source trail, but not the source files themselves.
- System font stacks are used. No remote font, analytics, login, synchronization, instructor reporting, or network submission code was found.
- Learner answers and completion are anonymous and browser-local under `sdu-web-development-2026`. Anyone with access to the same browser profile may see that local state; it is not sent to the instructor.
- The reset control accurately states that it deletes saved course answers and completion while leaving the lessons unchanged. It preserves the theme and storage unrelated to this course.
- `materials/slides/lecture-1.pptx`, `materials/slides/lecture-2.pptx`, their Office lock files, and both `materials/labs/lab1-*` folders are untracked and are **not ignored by Git**. They are not present in `dist`, but committing them could expose restricted or unclassified source material through the repository independently of the website.
- The lab files contain generic examples and form fields; no actual student record or credential was found in the text scan. Their publication rights and whether any file is instructor-only or solution material have not been classified.
- Before any push or publication, keep Office lock files out of version control and obtain an instructor-owned decision on whether decks and labs may exist in the remote repository. A rights-safe alternative is to ignore restricted authoring sources while retaining source locators in the briefs.

## Engineering evidence

- `npm ci`: passed locally on 11 September 2026; 97 packages installed and 0 vulnerabilities reported. npm warned that optional `fsevents` install scripts are not allowlisted; the production build and browser suite succeeded without them.
- `npm run ci`: passed locally on 11 September 2026 against the clean install and production preview.
- Unit and component tests: 15 files and 32 tests passed.
- Release-guard tests: 6 passed.
- Coverage-guard tests: 4 passed; the ledger correctly remains non-ready.
- Harness, skill-mirror, and content-voice checks: passed across 35 harness artifacts, 7 skills, and 48 learner-content files.
- Production build: TypeScript and Vite passed; 1,845 modules transformed.
- Production output: 0.55 kB HTML, 42.89 kB CSS, and 366.15 kB JavaScript, plus the favicon. Total `dist/` size was approximately 412 KiB.
- Browser suite: 22 discovered tests; 20 passed and 2 intentional cross-project skips. Desktop and mobile Chromium covered registered routes, accessibility scans, critical lesson and practice flows, focus, reload, persistence, reset, navigation, runtime errors, and overflow.
- Runtime errors: no unexpected console or page errors were reported by the covered flows.
- Local repository state: dirty and uncommitted. The tested bundle therefore does not correspond to a reproducible release commit or tag.
- Remote CI for the candidate: not run because the candidate is not committed or pushed. A local pass is not evidence of a successful GitHub Actions run.
- CI workflow: pull requests and pushes to `main` or `dev` use Node 22, `npm ci`, Chromium installation, and `npm run ci`; Playwright evidence is retained for 14 days.
- Dependency update path: grouped monthly npm and GitHub Actions Dependabot updates target `dev`. No remote `dev` branch was returned by the remote branch check, so that target branch must be created or the Dependabot target changed before relying on this maintenance path.

## Deployment and rollback

- Vite uses relative assets and the application uses hash routing, which is compatible with repository-subpath GitHub Pages hosting without server rewrite rules.
- Deployment is intentionally manual through `workflow_dispatch`; a push to `main` does not publish the site.
- The deployment workflow performs a clean install, installs Chromium, reruns `npm run ci`, requires `npm run check:release`, uploads `dist/`, and deploys to the `github-pages` environment.
- GitHub Pages source, repository visibility, environment protection, required reviewers, branch protection, and remote workflow history were not verified from local repository data.
- No public URL or successful remote deployment smoke test is recorded.
- No last-known-good published commit or release tag exists. The current base commit is not a validated release candidate because the audited course work is uncommitted.
- Required rollback preparation: after approval, commit or tag the exact candidate and record that reference and an owner here. If a published release fails, select the recorded last-known-good ref and rerun the manual Pages workflow. Do not edit `dist/` by hand.
- Browser-local progress during rollback: the current namespace is `sdu-web-development-2026` and saved schemas use validation and safe fallback. A future namespace or schema change needs migration or explicit reset behaviour tested before deployment.

## Open blockers

- Obtain instructor factual and pedagogical approval for all four modules before any registry status changes to `ready`.
- Resolve every coverage item through review or an instructor-confirmed deferred or excluded decision, including `COV-005`, `COV-016`, `COV-026`, and `COV-027`.
- Reconcile the course material inventory and Lecture 1 brief with the actual Lecture 2 and lab sources and the approved repository rights boundary.
- Decide whether the PowerPoint and lab sources may be committed to the remote repository; keep Office lock files out of version control.
- Obtain instructor approval of the course-wide visual direction and observe representative students using the pilots.
- Complete and record keyboard-only, screen-reader, 200% zoom/reflow, target-size, and dark-theme module checks.
- Confirm the official course code, target URL, launch date, release owner, rollback owner, support contact, Pages settings, environment reviewer protection, and branch-protection policy.
- Fix the Dependabot target or create the intended `dev` branch, then obtain a successful remote CI run for the committed release candidate.
- Commit or tag the approved candidate and record a last-known-good revision before deployment.

## Decision log

- **11 September 2026:** release remains **blocked**. A clean install, complete local CI gate, production-bundle inspection, rights/privacy scan, desktop/mobile browser flows, and deployment-configuration review passed in their stated scope. No deployment was attempted.
- **11 September 2026:** expanded the release audit from one Lecture 1 route to all four registered drafts, including the Lecture 1 practice and both Lecture 2 routes. Recorded 27 coverage items, zero instructor-reviewed items, and the remaining instructor-owned source and scope decisions.
- **11 September 2026:** confirmed that the earlier HTTP status-line and reset-state defects are corrected and covered by current tests. They are no longer release blockers.
- **11 September 2026:** confirmed that the production bundle excludes source decks and labs, while separately identifying the untracked and unignored authoring files as a repository-publication rights risk.
- **3 September 2026:** release was first marked **blocked** after the initial Lecture 1 audit. The subsequent reset-generation guard prevents a stale open page from restoring cleared course state.
