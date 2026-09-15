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
  term: 'Third semester',
  description:
    'Trace how browser and server behaviour connects requirements, HTTP, code, and system quality.',
  // Change this when creating a course. It keeps browser progress separate from other courses.
  storageNamespace: 'sdu-web-development-2026',
  // Keep former namespace values here so Reset all progress also removes pre-migration state.
  legacyStorageNamespaces: ['course-101'],
  theme: {
    // This neutral starter must be replaced during onboarding with roles derived from representative material.
    primary: '#27324a',
    accent: '#5b5bd6',
    light: {
      background: '#f8fafc',
      surface: '#ffffff',
      surfaceSoft: '#f1f5f9',
      surfaceMuted: '#eef2f7',
      text: '#172033',
      bodyCopy: '#4b5568',
      mutedText: '#64748b',
      line: '#dbe2ec',
      accentText: '#4b4bb8',
    },
    dark: {
      background: '#0f172a',
      surface: '#172033',
      surfaceSoft: '#131c2d',
      surfaceMuted: '#111a2b',
      text: '#f1f5f9',
      bodyCopy: '#b9c3d4',
      mutedText: '#9aa8bd',
      line: '#2c3a52',
      accentText: '#aeb4ff',
    },
    typography: {
      body: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      heading: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    geometry: 'balanced',
    rationale: 'A neutral slate interface with a restrained blue-violet accent adapts AI101\'s focused course shell while keeping this course\'s diagram-led, system-font, rights-safe direction.',
    sourceRefs: [
      {
        label: 'Lecture 1 visual direction',
        path: 'materials/slides/lecture-1.pptx',
        locator: 'slides 1, 2, 11, 17, 32, 33, 48, 52-57, 59-69, and 79-84',
      },
    ],
  },
};
