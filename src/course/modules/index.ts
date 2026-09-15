import HttpIntentCrudModule from './HttpIntentCrudModule';
import HttpCrudQuickCheckModule from './HttpCrudQuickCheckModule';
import HtmlCssFoundationsModule from './HtmlCssFoundationsModule';
import HtmlCssPracticeModule from './HtmlCssPracticeModule';
import type { CourseLecture, LearningModule } from '../types';

const LECTURE_ONE: CourseLecture = {
  id: 'lecture-1',
  number: 1,
  title: 'Introduction to Web Development',
};

const LECTURE_TWO: CourseLecture = {
  id: 'lecture-2',
  number: 2,
  title: 'HTML, CSS, and Layout',
};

/**
 * Agents add new modules here after creating the corresponding component.
 * Keep module numbers unique and order the array in the intended course sequence.
 * Dedicated practice stays in this sequence with kind: 'practice'.
 */
export const COURSE_MODULES: LearningModule[] = [
  {
    slug: 'http-intent-evidence-crud',
    number: 1,
    lecture: LECTURE_ONE,
    title: 'HTTP intent, evidence, and CRUD',
    summary: 'Trace one browser-server exchange, build a request that matches its intent, and explain the mechanism in a fresh case.',
    estimatedMinutes: 30,
    objectives: [
      'trace a browser action through a request, server work, response, and interface update',
      'read HTTP message parts and status families as evidence about an exchange',
      'construct a defensible request and response for a CRUD intent',
      'explain the mechanism in a fresh application case',
    ],
    sourceRefs: [
      {
        label: 'Lecture 1: Introduction to Web Development',
        path: 'materials/slides/lecture-1.pptx',
        locator: 'slides 31-85; focused evidence on slides 34-38, 49-69, and 81-83',
      },
    ],
    status: 'draft',
    Component: HttpIntentCrudModule,
  },
  {
    slug: 'http-crud-quick-check',
    number: 2,
    lecture: LECTURE_ONE,
    kind: 'practice',
    title: 'Quick check: web apps, HTTP, and CRUD',
    summary: 'Retrieve the key ideas from Lecture 1, get feedback, and retry each question.',
    estimatedMinutes: 15,
    objectives: [
      'identify core web-app, HTTP, URL, status, and CRUD ideas from the lesson',
      'distinguish common HTTP roles and message parts',
    ],
    sourceRefs: [
      {
        label: 'Lecture 1: Introduction to Web Development',
        path: 'materials/slides/lecture-1.pptx',
        locator: 'slides 36-38, 49, 54, 59-69, and 81-83',
      },
    ],
    status: 'draft',
    Component: HttpCrudQuickCheckModule,
  },
  {
    slug: 'html-structure-css-layout',
    number: 3,
    lecture: LECTURE_TWO,
    title: 'HTML structure and CSS layout',
    summary: 'Connect meaningful HTML structure to CSS selection, cascade, spacing, visibility, and responsive layout decisions.',
    estimatedMinutes: 35,
    objectives: [
      'distinguish the responsibilities of HTML and CSS in a web interface',
      'choose semantic elements that communicate the purpose of page regions',
      'trace selector matching and a limited CSS cascade example',
      'apply structure, selector, and layout decisions to a fresh page',
    ],
    sourceRefs: [
      {
        label: 'Lecture 2: HTML, CSS, and layout',
        path: 'materials/slides/lecture-2.pptx',
        locator: 'slides 2-68; focused evidence on slides 11-23, 30-34, and 36-65',
      },
    ],
    status: 'draft',
    Component: HtmlCssFoundationsModule,
  },
  {
    slug: 'html-css-practice',
    number: 4,
    lecture: LECTURE_TWO,
    kind: 'practice',
    title: 'Practice: structure and style a web page',
    summary: 'Retrieve selector language, classify HTML and CSS responsibilities, and apply the rules to a fresh interface.',
    estimatedMinutes: 20,
    objectives: [
      'retrieve compact HTML and CSS syntax from the lesson',
      'classify selector, spacing, visibility, and layout cases',
      'choose a common form method for a stated behaviour',
      'produce a defensible structure-and-style plan for a new interface',
    ],
    sourceRefs: [
      {
        label: 'Lecture 2: HTML, CSS, and layout',
        path: 'materials/slides/lecture-2.pptx',
        locator: 'slides 11-23, 30-34, and 36-65',
      },
    ],
    status: 'draft',
    Component: HtmlCssPracticeModule,
  },
];

export const COURSE_LECTURES = [LECTURE_ONE, LECTURE_TWO].map((lecture) => ({
  ...lecture,
  modules: COURSE_MODULES.filter((module) => module.lecture.id === lecture.id),
}));
