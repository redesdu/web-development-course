import type { CourseConfig } from './types';

/**
 * This is the first code file an instructor or agent should customize.
 * Keep course content in modules; keep course-wide identity here.
 */
export const COURSE: CourseConfig = {
  institution: 'University of Southern Denmark',
  code: 'COURSE-101',
  title: 'Your Course Title',
  shortTitle: 'Course Companion',
  term: 'Semester and year',
  description:
    'A focused, interactive companion that helps students prepare, practise, and check their understanding.',
  contact: 'Instructor name · instructor@sdu.dk',
  // Change this when creating a course. It keeps browser progress separate from other courses.
  storageNamespace: 'course-101',
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
    rationale: 'Neutral starter theme. Replace it after inspecting representative course material and approved brand guidance.',
    sourceRefs: [
      {
        label: 'Course visual direction',
        path: 'materials/course-info.md',
        locator: 'Course visual direction',
      },
    ],
  },
};
