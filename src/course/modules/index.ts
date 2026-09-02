import ExampleModule from './ExampleModule';
import ExampleRelationshipModule from './ExampleRelationshipModule';
import ExampleRouteModule from './ExampleRouteModule';
import type { LearningModule } from '../types';

/**
 * Agents add new modules here after creating the corresponding component.
 * Keep module numbers unique and order the array in the intended course sequence.
 * Dedicated practice stays in this sequence with kind: 'practice'.
 */
export const COURSE_MODULES: LearningModule[] = [
  {
    slug: 'example-relationship',
    number: 1,
    title: 'Change one value',
    summary: 'Use a live graph to connect a familiar situation, a formula, and a visual pattern.',
    estimatedMinutes: 6,
    objectives: [
      'separate a starting value from a rate of change',
      'predict how each value changes a straight-line graph',
    ],
    sourceRefs: [],
    status: 'ready',
    Component: ExampleRelationshipModule,
  },
  {
    slug: 'example-route',
    number: 2,
    title: 'Choose a route',
    summary: 'Make a tempting choice on a map, inspect the result, and replace a weak rule with a better one.',
    estimatedMinutes: 7,
    objectives: [
      'compare routes using their complete distance',
      'explain why a short first step does not guarantee a short path',
    ],
    sourceRefs: [],
    status: 'ready',
    Component: ExampleRouteModule,
  },
  {
    slug: 'example-explanation',
    number: 3,
    title: 'Explain the choice',
    summary: 'Commit to a decision, read useful feedback, and test the rule on a fresh case.',
    estimatedMinutes: 8,
    objectives: [
      'recognise the basic structure of a generated learning module',
      'distinguish purposeful interaction from decorative activity',
      'inspect how reasoning-focused feedback behaves',
    ],
    sourceRefs: [],
    status: 'ready',
    Component: ExampleModule,
  },
];
