# Course release record

Status: **blocked**

Audit date: **3 September 2026, CEST**

The local engineering gate passes, but the course is not responsible to publish yet. There are no ready modules, factual approval and coverage decisions are incomplete, the registered draft module has two release-blocking learner-flow defects, and the remote deployment environment and rollback owner cannot be verified.

## Release target

- Intended audience: third-semester Software Engineering students with basic programming experience and little reliable prior web-development knowledge
- Target environment or URL: GitHub Pages is planned; the published URL and repository Pages setting have not been confirmed
- Target date: not scheduled
- Release owner and support contact: not confirmed; current itslearning guidance remains the student contact route
- Assessment relationship: ungraded preparation, weekly exercise support, and exam revision; no graded task, assignment solution, or restricted exam material
- Candidate state audited: uncommitted working tree based on repository commit `c3fd0a4c6fea5ea140a1ccbdf14376352afa25e7`
- Deployment authorization: not granted and no deployment was performed

## Content approval

There are **no modules with registry status `ready`**. The only registered route was audited as a draft because it is the complete current learner-facing platform.

| Module or practice | Registry status | Source checked | Instructor approval | Student observation | Notes |
| --- | --- | --- | --- | --- | --- |
| HTTP intent, evidence, and CRUD | draft | slides 31-85 checked during pilot creation and review; focused evidence on slides 34-38, 49-69, and 81-83 | not recorded | not run | Source brief exists, but factual and coverage corrections remain. The browser audit reproduced an invalid HTTP response line and a reset/completion defect. |

Content findings:

- The brief distinguishes the confirmed `CRUD` terminology from the `CURD` typo in the source.
- The pilot uses new campus-equipment and saved-restaurant examples rather than restricted assignment or examination material.
- The builder displays `HTTP/1.1 2xx success` as if it were a complete response start line. A family label is not a valid concrete status line.
- The transfer activity can be confirmed, reset to an empty answer, and then finished because the learning-flow completion state is not revoked.
- The opening mechanism trace and worked-message step complete automatically. This weakens the evidence behind progress but is secondary to the two defects above.
- The source trail names `materials/slides/lecture-1.pptx`, but that repository-relative file does not exist. The instructor-owned deck remains outside the repository.

## Content coverage

- Coverage ledger checked against the current 85-slide material inventory on 3 September 2026.
- Ledger counts from the passing local gate: 19 total; 2 unassigned, 9 planned, 8 implemented, 0 reviewed, 0 deferred, and 0 excluded.
- Unassigned items: `COV-005` and `COV-016`.
- Planned but unimplemented items: `COV-001`, `COV-002`, `COV-004`, `COV-008`, `COV-013`, `COV-014`, `COV-017`, `COV-018`, and `COV-019`.
- Implemented but not instructor-reviewed items: `COV-003`, `COV-006`, `COV-007`, `COV-009`, `COV-010`, `COV-011`, `COV-012`, and `COV-015`.
- Deferred items with instructor-confirmed reasons: none.
- Excluded items with instructor-confirmed reasons: none.
- Unreadable source regions: none recorded; factual uncertainty remains around the simplified HTTP evolution and QUIC material assigned to planned items `COV-013` and `COV-014`.
- The pilot currently overstates the evidence for `COV-003` and `COV-011`. Slide 59 methods outside the CRUD subset also need a teaching destination or an instructor-confirmed scope decision before `COV-009` can be considered complete.

Release remains blocked until every in-scope item is reviewed, deferred, or excluded with the required instructor decision.

## Rights and privacy

- Publication boundary confirmed on 2 September 2026: source material may be paraphrased and diagrams may be recreated accessibly; the deck, SDU logo, historical screenshots, and third-party slide images may not be published.
- Theme implementation uses system font stacks and code-native CSS. It does not fetch or bundle a remote font.
- `public/` contains only a generic code-native favicon.
- The 364 KiB production bundle contains `index.html`, one CSS asset, one JavaScript asset, and the generic favicon. It contains no PowerPoint, PDF, source screenshot, SDU logo, third-party image, unpublished assessment, credential, or student record.
- The institution name and generic student scenarios are ordinary course content, not personal data.
- Learner responses and completion remain browser-local through the course-scoped storage helper. No analytics, login, synchronization, or instructor reporting code was found.
- The interface says, “Your progress is saved only in this browser.” This accurately describes the current implementation.
- The missing repository-relative source trail is a traceability blocker, not a bundle leak. Do not copy the deck into `public/` to resolve it.

## Learner experience evidence

- Course visual direction: implemented from representative material, but instructor approval is not recorded.
- Automated accessibility: the local Playwright suite passed its axe scan on the home page and registered module in the initial theme at desktop and mobile widths, and on the home page in dark mode. It does not scan the module itself in dark mode.
- Dark-theme issue: source-trail code uses `#6f6c65` on the dark surface and does not meet normal-text contrast. This route is outside the current dark-module axe coverage.
- Keyboard: the first step transition and focus movement passed. Native controls expose labels and visible focus rules. A complete manual keyboard and screen-reader pass has not been recorded.
- Desktop browser: home, routing, incorrect answer, explanatory feedback, revision, correct answer, reload restoration, transfer, reset, completion, and return to the course map were exercised against the production preview.
- Mobile and reflow: manual checks at 320 px and 390 px found no page-level horizontal overflow. The 390 px navigation opened, navigated, and closed correctly. The automated mobile browser path also passed.
- State restoration: a correct builder response and its feedback survived reload.
- Reset recovery: failed. Reset clears the transfer response but does not revoke the completed step, so Finish remains enabled.
- Course-wide recovery: a two-step Start over control clears answers and completion from the current namespace and the explicitly declared legacy `course-101` namespace, forces a full document reload, and opens the first module with empty activities. It preserves the theme and unrelated browser storage. Desktop and mobile browser regressions pass.
- Protocol display: failed. The assembled response preview renders a status family as a literal response line.
- Console and page errors: none observed manually; automated browser tests also reported none.
- Reduced motion: Playwright emulates reduced motion for accessibility scans, and CSS removes meaningful transition duration. Manual assistive-technology output has not been recorded.
- Target size: the 34 px progress controls and 38 px compact theme control are smaller than the course's preferred touch target, although automated axe checks did not flag them.
- Representative learners identifying their position and useful next action: not observed.
- Representative learners performing the intended reasoning rather than completing clicks: not observed.

## Engineering evidence

- `npm ci`: passed on 3 September 2026; 97 packages installed, 0 reported vulnerabilities. npm warned that optional `fsevents` install scripts are not allowlisted.
- `npm run ci`: passed locally after the corrected shared reset-progress change on 3 September 2026 at approximately 10:29 CEST.
- Unit and guard tests: 12 test files and 27 tests passed. Release-readiness guard, harness, skill mirrors, content voice, and coverage checks passed for the current non-ready authoring state.
- Production build: TypeScript and Vite passed; 1,839 modules transformed. Output was approximately 0.55 KiB HTML, 38.79 KiB CSS, and 323.48 KiB JavaScript before the favicon.
- Browser suite: 13 tests passed and 1 desktop-only mobile-menu case was intentionally skipped. Desktop and mobile Chromium covered routing, the pilot path, state reload, keyboard focus, mobile navigation, reset-all confirmation, reset from an active module, fresh-step recovery, overflow, browser errors, and automated accessibility.
- Test gap: no test covers reset after a completed transfer, revoking step completion, or validity of the rendered HTTP response start line.
- `npm run check:release`: failed as designed on 3 September 2026 because the record is not `ready` and `Open blockers` is not `- None.`.
- Remote GitHub Actions run: not verified. GitHub CLI is unavailable locally, and the anonymous repository URL returned 404, which may indicate a private repository or inaccessible remote.
- Dependency update path: monthly grouped npm and GitHub Actions Dependabot updates target `dev`; CI runs on pull requests and pushes to `dev` and `main`.
- Working tree: contains uncommitted course and pilot changes. The audited production bundle therefore does not correspond to the recorded base commit alone.

## Deployment and rollback

- Deployment method in the repository: manual `Deploy to GitHub Pages` workflow.
- Local workflow behavior: clean install, Chromium install, full CI, release guard, `dist/` upload, then deployment to the `github-pages` environment.
- Automatic publication: disabled. A push to `main` does not deploy.
- Remote repository settings: Pages source, environment protection, required reviewers, branch protection, and workflow history were not verifiable from this environment.
- Deployment performed during this audit: none.
- Last known good published revision: none recorded.
- Repository baseline: `c3fd0a4c6fea5ea140a1ccbdf14376352afa25e7` is the initial commit, not a validated release candidate.
- Required rollback preparation: after fixes and approval, commit or tag the exact release candidate and record its hash here. If a published release fails, manually run the Pages workflow for the recorded last-known-good ref. Do not edit `dist/` by hand.
- Browser progress during rollback: current schemas use version 1 and namespace `sdu-web-development-2026`; the former `course-101` namespace is declared in `legacyStorageNamespaces` so Reset all progress can remove pre-migration state. Add any future former namespace to that list; schema changes still need explicit migration or safe fallback testing.

## Open blockers

- Promote no module until the instructor has reviewed factual content, answers, examples, terminology, and source boundaries. There are currently zero ready modules.
- Resolve all 11 unassigned or planned coverage items and review the 8 implemented items, or record instructor-approved deferred or excluded decisions.
- Replace the invalid assembled response line with a concrete valid status line while retaining status-family reasoning.
- Make Reset revoke transfer and flow completion, prevent empty restored confirmation, and add regression tests for reset-after-completion and reload.
- Correct overclaimed coverage evidence, especially `COV-003`, `COV-009`, and `COV-011`.
- Establish a valid, rights-safe repository-relative source trail without publishing the restricted deck.
- Fix dark-theme source-trail contrast and scan every registered module in both themes. Record manual keyboard, screen-reader, zoom/reflow, and focus evidence.
- Obtain instructor approval of the course visual direction and observe representative learners.
- Confirm the course code or term, storage namespace, target date, target URL, release owner, and support contact.
- Verify remote Actions, Pages source, environment reviewer protection, branch protection, and one successful remote CI run.
- Commit or tag the approved release candidate and record a last-known-good revision and rollback owner.

## Decision log

- **3 September 2026:** release marked **blocked**. Local clean install, CI, production build, rights inspection, desktop flow, and 320 px and 390 px checks passed in their recorded scope. Publication was not attempted because content approval, coverage, critical learner-flow corrections, accessibility evidence, and operations ownership remain unresolved.
- **3 September 2026:** added and verified a course-wide Reset all progress control. Full CI passed afterward. This recovery improvement does not resolve the pilot's transfer reset defect or the other release blockers above.
- **3 September 2026:** reproduced and corrected a late persistence write that could leave the lesson on step 3 after a course-wide reset. Reset now forces one clean startup, clears course state again before React renders, closes the mobile drawer, and returns to the overview. Full CI passed after the correction.
- **3 September 2026:** diagnosed surviving progress from the harness's former `course-101` storage namespace. The course config now declares legacy namespaces and the shared reset helper clears only the current course plus those declared migrations. Targeted unit tests, production build, desktop and mobile reset regressions, and the live localhost flow passed.
- **3 September 2026:** added a reset-generation guard after stale in-memory lesson state reappeared following a restart. A page instance loaded before Reset all progress can no longer write its old answers or step position back into storage. The reset stayed at step 1 after a second live reload, and targeted desktop and mobile regressions passed.
