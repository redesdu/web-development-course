import HttpIntentCrudModule from './HttpIntentCrudModule';
import type { LearningModule } from '../types';

/**
 * Agents add new modules here after creating the corresponding component.
 * Keep module numbers unique and order the array in the intended course sequence.
 * Dedicated practice stays in this sequence with kind: 'practice'.
 */
export const COURSE_MODULES: LearningModule[] = [
  {
    slug: 'http-intent-evidence-crud',
    number: 1,
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
];
