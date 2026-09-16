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
    displayNumber: '01',
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
    displayNumber: '01.1',
    lecture: LECTURE_ONE,
    kind: 'practice',
    title: 'Practice: reason about HTTP exchanges',
    summary: 'Work through realistic situations: argue a trade-off, order an exchange, diagnose broken and dishonest requests, and construct the exchanges that update and delete.',
    estimatedMinutes: 25,
    objectives: [
      'argue a web-application trade-off from the constraints of a stated situation',
      'order a client, proxy, and server exchange and say why each step depends on the one before',
      'diagnose a malformed message, an ambiguous URL, and a request whose method contradicts its effect',
      'construct the request and response for an update and for a deletion',
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
    displayNumber: '02',
    lecture: LECTURE_TWO,
    title: 'HTML structure and CSS layout',
    summary: 'Connect meaningful HTML structure to CSS selection, cascade, the box model, and responsive layout, with a reference guide you can return to all term.',
    estimatedMinutes: 45,
    objectives: [
      'choose semantic elements and document structure that state what each part of a page is',
      'look up element, metadata, text, link, list, table, form, and attribute rules when you need them',
      'trace selector matching and a limited CSS cascade example',
      'apply structure, the box model, and a layout mechanism to a fresh page',
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
    displayNumber: '02.1',
    lecture: LECTURE_TWO,
    kind: 'practice',
    title: 'Practice: write the markup',
    summary: 'Judge four cases the rules do not settle on their own, complete two broken fragments, then build a semantic page from nothing and have it checked.',
    estimatedMinutes: 25,
    objectives: [
      'decide when a semantic element is honest and when a div is the right answer',
      'choose a form method and a layout mechanism from the consequence each one has',
      'complete a document head and an accessible form so both do their job',
      'write a semantic, accessible page for a new case and check it against the requirements',
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
