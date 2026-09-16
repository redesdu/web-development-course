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
    // Palette roles derived from the AI101 course shell (aiml-sdu/ai101), whose
    // published tokens were read in OKLCH and converted to sRGB here. Two values
    // are deliberately darker or lighter than the source so that muted text and
    // accent text clear 4.5:1 on every surface this course puts them on.
    primary: '#1644b1',
    accent: '#2c64ed',
    light: {
      background: '#ffffff',
      surface: '#ffffff',
      surfaceSoft: '#f3f4f6',
      surfaceMuted: '#fafafa',
      text: '#0a090f',
      bodyCopy: '#3f3f46',
      // AI101 uses #71717a here. That reads at 4.39:1 on the soft surface, so
      // this course darkens it one step rather than shipping failing contrast.
      mutedText: '#66666f',
      line: '#e6e7ea',
      accentText: '#1644b1',
    },
    dark: {
      background: '#09090e',
      surface: '#101017',
      surfaceSoft: '#0d0d14',
      surfaceMuted: '#1e1e25',
      text: '#f9fafb',
      bodyCopy: '#d4d4d8',
      mutedText: '#a1a5ab',
      line: '#2b2b33',
      // The source's dark primary is a button fill, not a text colour. Lightened
      // for use as text, where it reaches 8:1 on the dark background.
      accentText: '#7ea2ff',
    },
    typography: {
      body: "Inter, ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      heading: "Inter, ui-sans-serif, system-ui, -apple-system, 'system-ui', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    },
    geometry: 'balanced',
    rationale: 'Adopts the AI101 course shell palette and type stack so the two SDU courses read as one family: near-neutral zinc surfaces, a single blue accent, and flat bordered panels instead of raised cards. Muted and accent text are adjusted from the source where its values did not meet 4.5:1 on this course\'s surfaces.',
    sourceRefs: [
      {
        label: 'Lecture 1 visual direction',
        path: 'materials/slides/lecture-1.pptx',
        locator: 'slides 1, 2, 11, 17, 32, 33, 48, 52-57, 59-69, and 79-84',
      },
    ],
  },
};
