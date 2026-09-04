import type { CourseConfig } from './types';

/**
 * This is the first code file an instructor or agent should customize.
 * Keep course content in modules; keep course-wide identity here.
 */
export const COURSE: CourseConfig = {
  institution: 'University of Southern Denmark',
  code: 'WEB-DEVELOPMENT',
  title: 'Web Development',
  shortTitle: 'Web Development',
  term: 'First semester',
  description:
    'Trace how browser and server behaviour connects requirements, HTTP, code, and system quality.',
  // Change this when creating a course. It keeps browser progress separate from other courses.
  storageNamespace: 'sdu-web-development-2026',
  // Keep former namespace values here so Reset all progress also removes pre-migration state.
  legacyStorageNamespaces: ['course-101'],
  theme: {
    // This neutral starter must be replaced during onboarding with roles derived from representative material.
    primary: '#18253f',
    accent: '#c2412d',
    light: {
      background: '#f7f5ef',
      surface: '#fffdf9',
      surfaceSoft: '#f0eee8',
      surfaceMuted: '#eeeae2',
      text: '#1d2635',
      bodyCopy: '#505968',
      mutedText: '#596373',
      line: '#dedbd2',
      accentText: '#a83723',
    },
    dark: {
      background: '#0c1321',
      surface: '#182238',
      surfaceSoft: '#111a2b',
      surfaceMuted: '#121c2e',
      text: '#eef2fb',
      bodyCopy: '#b7c0d1',
      mutedText: '#a8b2c5',
      line: '#2c3850',
      accentText: '#ff9b88',
    },
    typography: {
      body: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    geometry: 'balanced',
    rationale: 'A restrained, spacious system theme adapts Lecture 1\'s strong hierarchy and simple diagrams without reproducing unapproved slide assets.',
    sourceRefs: [
      {
        label: 'Lecture 1 visual direction',
        path: 'materials/slides/lecture-1.pptx',
        locator: 'slides 1, 2, 11, 17, 32, 33, 48, 52-57, 59-69, and 79-84',
      },
    ],
  },
};
