# SDU Interactive Learning Platform Template

Build an interactive course companion from your own teaching material with help from an agentic coding tool.

You remain the subject expert. The agent inventories material, asks about decisions only you can make, proposes a learning structure, builds one module at a time, tests learner flows, and leaves an inspectable source trail.

This is not an automatic slide converter. A good result helps students predict, practise, compare, construct, debug, or explain. It does not merely restyle a lecture deck.

The end goal is twofold: every instructor-confirmed item in scope is intentionally covered, deferred, or excluded, and the resulting course earns a Brilliant and Duolingo level of clarity through focused problem solving, a coherent learning path, reliable state, useful feedback, and careful visual craft. The names express an ambition, not a promise that styling or automation can guarantee equivalence.

## Start here as an instructor

### 1. Create your course repository

For a new course, use GitHub's **Use this template** button. This creates a clean repository without carrying the template's history. Fork the repository only when you want to contribute changes back to the template.

You need:

- [Node.js](https://nodejs.org/) 22.12 or newer;
- Git and a GitHub account if you want GitHub Pages deployment;
- Codex, Claude Code, OpenCode, Pi, or another coding agent that reads repository instructions.

If your university already supports one of these tools, use the approved tool. If you have no existing standard, Codex is the simplest first choice for this template. Claude Code is a sound alternative for institutions that already use Anthropic. OpenCode suits teams that need model-provider or local-model choice. Pi is intended for people who want to configure a minimal terminal agent themselves and understand that it has no built-in sandbox or permission prompts.

Read [docs/choosing-an-agent.md](docs/choosing-an-agent.md) before buying a subscription or adding course material. It explains the tools, model selection, current Arena evidence, permissions, cost, privacy, and a small pilot for comparing candidates.

Then run:

```bash
git clone <your-new-course-repository-url>
cd <your-course-repository>
npm install
npm run dev
```

Open the local address printed by Vite. The initial site contains disposable examples that demonstrate graphs, maps, feedback, state restoration, and shared navigation.

If you do not normally use a terminal, ask your coding agent:

> Read README.md and use the manage-course-lifecycle skill. Check that this template runs locally, then guide me through the instructor tutorial one step at a time. Do not change course content until you have inspected what is already here.

The detailed walkthrough is in [docs/instructor-tutorial.md](docs/instructor-tutorial.md).

### 2. Add your teaching material

Keep original inputs in the matching folder:

```text
materials/
├── course-info.md       shared course context
├── slides/              PDF, PPTX, or exported slides
├── labs/                lab sheets, notebooks, and starter code
├── practice/            formative questions and solutions
├── readings/            readings that may be used as authoring sources
├── datasets/            small teaching datasets and data notes
└── assets/              diagrams and media cleared for reuse
```

Do not put student data, unpublished exams, credentials, confidential files, or material you are not allowed to publish in a public repository. Files in `materials/` are authoring sources and are not deployed unless code imports or copies them, but repository visibility still matters.

### 3. Onboard the course before generating it

Use this prompt:

> Use the onboard-course skill. Inspect my material and help me define what students should be able to do, where they struggle, and how this platform should support the course. Ask at most three focused questions at a time and offer a reasonable default. Prepare the course plan, but do not build modules yet.

The agent updates `materials/course-info.md`, records only confirmed durable decisions in `course/MEMORY.md`, inventories the sources, and proposes a coherent map in `course/COURSE_PLAN.md`. It also derives a course-wide visual direction from representative material, records the evidence, and maps it to accessible theme roles. The plan includes a coverage ledger so every required concept, procedure, representation, misconception, lab capability, or practice expectation has an explicit destination.

### 4. Build one representative module

Do not generate the whole course first. Choose one module that includes a difficult concept, a plausible misconception, and a useful learner action.

> Use the create-study-module skill to build one pilot module from `materials/slides/week-01.pdf`, slides 4 to 12. It should prepare first-semester students to explain the mechanism and apply it to a new case. Ask if an instructor-owned decision would materially change the result.

The agent creates a module brief, implements the module inside the shared shell, registers it once, adds behavior tests, runs the build, and inspects the real learner flow.

### 5. Review, practise, and release

Use a critical review before scaling:

> Use the review-learning-module skill on the pilot. Compare it with its sources and brief. Check pedagogy, voice, accessibility, state restoration, mobile behavior, and code. Diagnose before editing.

Practice is optional. It may be embedded inside a lesson or added as a normal `kind: 'practice'` stop on the same course path. Keeping it in the shared path avoids a second navigation model.

> Use the create-practice-set skill to propose formative practice for the pilot. Choose MCQ, classification, flashcards, tracing, or short application tasks from the knowledge students need to retrieve or produce. Do not assume MCQ is the right format.

Before publishing:

> Use the prepare-course-release skill. Audit every ready module, rights and privacy, browser flows, CI, the production bundle, deployment settings, and rollback notes. Update course/RELEASE.md. Do not deploy unless I explicitly ask.

## The course lifecycle

| Stage | Main result | Skill |
| --- | --- | --- |
| Template setup | Local site runs; identity and storage namespace are unique | `manage-course-lifecycle` |
| Discovery | Material inventory and reviewed course map | `onboard-course` |
| Pilot | One complete vertical slice | `create-study-module` |
| Practice | Optional evidence-based practice node or embedded check | `create-practice-set` |
| Scale | More modules following confirmed pilot lessons | `create-study-module` |
| Review | Source, pedagogy, accessibility, UX, and engineering findings | `review-learning-module` |
| Debug | Reproduction, root cause, fix when requested, regression test; see [docs/debugging.md](docs/debugging.md) | `debug-learning-experience` |
| Release | Dated readiness evidence and deployment decision | `prepare-course-release` |
| Iterate | Student and instructor observations become scoped corrections | `manage-course-lifecycle` |

Use the lifecycle skill when you are unsure what comes next. For a broad course redesign or release, ask the agent to use its planning mode if available. For one clear, reversible module change, planning mode is usually unnecessary overhead.

## What the template already provides

- React, TypeScript, Vite, hash routing, and relative production assets;
- a responsive course journey generated from one typed module registry;
- one shared module frame with course navigation and previous or next links;
- course-scoped browser progress with safe, versioned interaction persistence;
- reusable knowledge checks, classification practice, step flows, flashcards, graph exploration, and route comparison;
- light and dark themes, visible focus, reduced-motion support, and narrow-screen layouts;
- material-derived palette, typography, and geometry tokens with an inspectable rationale and source trail;
- source references on every real module;
- a course-wide content coverage ledger that distinguishes reviewed, deferred, excluded, and unresolved material;
- course memory, course planning, module briefs, and a release record that work across coding agents;
- anti-slop voice checks plus human cold-read guidance;
- unit and component-integration tests for learner state and reusable interactions;
- Playwright tests against the production bundle for desktop, mobile, navigation, persistence, browser errors, and automated accessibility checks;
- GitHub Actions for clean installation, merge-time CI, retained browser evidence, and a separate manual Pages release;
- Dependabot configuration for npm and GitHub Actions updates.
- A lightweight contribution workflow through `dev`; see [CONTRIBUTING.md](CONTRIBUTING.md).

The starter deliberately has no login, analytics, grade book, LMS integration, backend, or synchronized progress. Adding any of those requires explicit privacy, governance, support, and assessment decisions.

## How the project is built

The repository separates evidence, teaching decisions, implementation, and verification:

```text
instructor material
      ↓
course context + durable memory
      ↓
reviewed course plan
      ↓
source-bounded module brief
      ↓
React module + shared interactions + registry
      ↓
unit tests + browser tests + instructor review
      ↓
GitHub Pages release + student observation
```

The main layers are:

```text
materials/                  preserved instructor-owned inputs
course/                     memory, course plan, module briefs, release evidence
src/course/                 course identity, modules, examples, and registry
src/components/             reusable course-neutral learning mechanics
src/lib/courseStorage.ts    safe course-scoped browser persistence
.agents/skills/             canonical portable agent workflows
.claude/skills/             generated Claude-compatible mirrors
docs/                       human and agent standards
e2e/                        real-browser learner-flow tests
.github/workflows/          CI and GitHub Pages deployment
```

`src/course/modules/index.ts` is the single source of truth for module order, routes, the sidebar, the winding path, completion identity, and previous or next navigation. A normal module must not create its own router, sidebar, header, or progress system.

Read [docs/architecture.md](docs/architecture.md) for technical boundaries and [docs/harness.md](docs/harness.md) for the agent execution loop.

Read [docs/content-coverage-standard.md](docs/content-coverage-standard.md) for the course-wide source ledger and [docs/experience-quality-standard.md](docs/experience-quality-standard.md) for the operational Brilliant and Duolingo quality bar.

Read [docs/theme-standard.md](docs/theme-standard.md) for turning representative teaching material into one accessible course-wide visual system without copying slide layouts or unapproved assets.

## Choose a coding agent and model

The coding agent and the model are separate choices. Codex, Claude Code, OpenCode, and Pi are programs that read the repository and use tools. GPT and Claude names refer to models that may run inside them. A model can behave differently when another tool supplies different instructions, context, permissions, or commands.

Use the tool approved by your university. If there is no approved default, start with Codex for the first pilot and compare it with Claude Code only if the pilot exposes a real shortcoming. OpenCode is useful when provider choice or local inference is required. Pi gives experienced users more control, but its default security model is unsuitable for a novice who expects approval prompts or a sandbox.

The current Arena results are dated evidence, not a permanent recommendation. On 24 August 2026, [Agent Arena](https://arena.ai/leaderboard/agent) ranks Claude Opus 5 High first and GPT-5.6 Sol at xHigh fourth. On 21 August 2026, [Code Arena WebDev](https://arena.ai/leaderboard/code/webdev) ranks Claude Opus 5 Max first and GPT-5.6 Sol in the Codex harness seventh. Some Arena model names are not selectable in the corresponding coding tool. Follow the tool's official model picker, then run the same source-bounded pilot before scaling.

OpenAI currently recommends GPT-5.6 Sol for complex reasoning and coding, with Terra and Luna as lower-cost choices. Claude Code recommends Sonnet for daily coding and Opus for complex reasoning. The full recommendation, official setup links, availability warning, comparison rubric, and maintenance date are in [docs/choosing-an-agent.md](docs/choosing-an-agent.md).

## Agent compatibility

Canonical project instructions live in `AGENTS.md`. Canonical workflows live in `.agents/skills/`. `CLAUDE.md` imports the same instructions, and `npm run sync:skills` generates Claude-compatible skill mirrors.

| Tool | Explicit example |
| --- | --- |
| Codex | `$create-study-module Build one module from slides 4 to 12…` |
| Claude Code | `/create-study-module Build one module from slides 4 to 12…` |
| OpenCode | `Use the create-study-module skill to build…` |
| Pi | `/skill:create-study-module Build one module from slides 4 to 12…` |

Natural language selection may work, but naming the skill makes the workflow easier to teach and audit. Other agentic coding tools can use the same repository if they read `AGENTS.md` and `SKILL.md`; tool-specific plan modes and permissions still differ.

## Useful commands

```bash
npm run dev             # local authoring server
npm test                # unit, component-integration, coverage, voice, and harness checks
npm run test:e2e        # build, preview, and test the production site in desktop and mobile browsers
npm run test:e2e:debug  # step through a browser failure
npm run build           # tests, type-check, and production bundle
npm run ci              # full local release gate including browser QA
npm run preview         # preview the production bundle
npm run check:voice     # mechanical learner-copy warning signs
npm run check:coverage  # release guard for the course-wide coverage ledger
npm run check:release   # validate a completed release record before deployment
npm run check:harness   # required docs, skills, state, and compatibility contracts
npm run sync:skills     # update generated Claude skill mirrors
```

For the first local browser run:

```bash
npx playwright install chromium
npm run test:e2e
```

CI installs Chromium automatically. Browser runs exercise the built `dist/` through `vite preview`, not the development server. GitHub Actions retains the Playwright report, screenshots, traces, and test results when they exist.

## Deployment

The included Pages workflow is manual. Pushing to `main` runs CI but does not publish the course. Deployment proceeds only after the same build and browser gates pass and `course/RELEASE.md` passes the release-readiness check.

1. Push the course repository to GitHub.
2. In **Settings → Pages**, choose **GitHub Actions** as the source.
3. Review `course/RELEASE.md` with the instructor.
4. Mark the release record `ready` only when its evidence is complete, then run `npm run check:release`.
5. Manually run **Deploy to GitHub Pages**.
6. Open the published URL and repeat the smoke path.

Hash routing and relative assets allow deployment from a repository subpath without server rewrite rules. See [docs/release-guide.md](docs/release-guide.md) for CI, rollback, and release evidence.

## Quality principles

- Start from an observable change in the learner.
- Account for every in-scope content item. A mention is not coverage when the objective requires calculation, implementation, critique, design, or transfer.
- Keep claims traceable to instructor material or an approved external source.
- Use interaction only when prediction, manipulation, comparison, construction, tracing, retrieval, or feedback improves learning.
- Give reasoning-focused feedback and keep it visible until explicit continuation.
- Store stable IDs, not array positions or visible labels. Treat missing or malformed browser state as a fresh activity.
- Preserve resolved answers when learners move backward, forward, leave, and return.
- Test with keyboard input, 320 px and 390 px widths, desktop, reduced motion, and real browser errors.
- Treat “Duolingo meets Brilliant” as product shorthand: a clear course path plus focused problem solving, never copied branding or decorative gamification.
- Do not call a module ready until the instructor has checked disciplinary accuracy. Passing automation is necessary engineering evidence, not proof of learning.

## Current release status

The template has automated unit, component, build, harness, voice, coverage, production-browser, and accessibility gates. It is still a release candidate for university-wide use, not proof that a course is factually correct or teaches well. Pilot it with courses that differ in discipline, source format, learner profile, and teaching style. Record where instructors or students hesitate, then correct the shared harness before wider distribution.

The research and product decisions behind the template are summarized in [docs/research-basis.md](docs/research-basis.md).
