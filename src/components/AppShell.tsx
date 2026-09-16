import { BookOpen, CheckCircle2, ChevronRight, FolderOpen, Home, Menu, PanelLeft, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration, useLocation } from 'react-router-dom';
import { COURSE } from '@/course/course.config';
import { COURSE_LECTURES, COURSE_MODULES } from '@/course/modules';
import type { LearningModule } from '@/course/types';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { beginCourseStorageReset } from '@/lib/courseStorage';
import { ThemeToggle } from './ThemeToggle';

function ModuleNavLink({
  module,
  completed,
  onNavigate,
}: {
  module: LearningModule;
  completed: boolean;
  onNavigate: () => void;
}) {
  return (
    <NavLink
      className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
      to={`/modules/${module.slug}`}
      onClick={onNavigate}
    >
      <span className="nav-number">{module.displayNumber}</span>
      <span>{module.title}</span>
      {completed && <CheckCircle2 className="nav-check" size={16} aria-label="Completed" />}
    </NavLink>
  );
}

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const { completedSlugs } = useCourseProgress();
  const location = useLocation();
  const activeLectureId = COURSE_LECTURES.find((lecture) =>
    lecture.modules.some((module) => location.pathname === `/modules/${module.slug}`),
  )?.id;
  const [expandedLectures, setExpandedLectures] = useState<Set<string>>(
    () => new Set([activeLectureId ?? COURSE_LECTURES[0]?.id].filter(Boolean) as string[]),
  );

  useEffect(() => {
    if (!activeLectureId) return;
    setExpandedLectures((current) => {
      if (current.has(activeLectureId)) return current;
      return new Set(current).add(activeLectureId);
    });
  }, [activeLectureId]);

  useEffect(() => {
    if (!confirmingReset) return;
    resetCancelRef.current?.focus();

    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setConfirmingReset(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [confirmingReset]);

  const resetAllProgress = () => {
    beginCourseStorageReset();
    const resetUrl = new URL(window.location.href);
    resetUrl.searchParams.set('reset-course-progress', '1');
    const firstModule = COURSE_MODULES[0];
    resetUrl.hash = firstModule ? `/modules/${firstModule.slug}` : '/';
    // Assigning a URL with a temporary query marker forces a complete document
    // reload; main.tsx clears storage again before React mounts any activity.
    window.location.assign(resetUrl.toString());
  };
  const theme = {
    '--course-primary': COURSE.theme.primary,
    '--course-accent': COURSE.theme.accent,
    '--course-light-background': COURSE.theme.light.background,
    '--course-light-surface': COURSE.theme.light.surface,
    '--course-light-surface-soft': COURSE.theme.light.surfaceSoft,
    '--course-light-surface-muted': COURSE.theme.light.surfaceMuted,
    '--course-light-text': COURSE.theme.light.text,
    '--course-light-body-copy': COURSE.theme.light.bodyCopy,
    '--course-light-muted-text': COURSE.theme.light.mutedText,
    '--course-light-line': COURSE.theme.light.line,
    '--course-light-accent-text': COURSE.theme.light.accentText,
    '--course-dark-background': COURSE.theme.dark.background,
    '--course-dark-surface': COURSE.theme.dark.surface,
    '--course-dark-surface-soft': COURSE.theme.dark.surfaceSoft,
    '--course-dark-surface-muted': COURSE.theme.dark.surfaceMuted,
    '--course-dark-text': COURSE.theme.dark.text,
    '--course-dark-body-copy': COURSE.theme.dark.bodyCopy,
    '--course-dark-muted-text': COURSE.theme.dark.mutedText,
    '--course-dark-line': COURSE.theme.dark.line,
    '--course-dark-accent-text': COURSE.theme.dark.accentText,
    '--course-body-font': COURSE.theme.typography.body,
    '--course-heading-font': COURSE.theme.typography.heading,
  } as CSSProperties;

  return (
    <div className={`app-shell ${sidebarCollapsed ? 'sidebar-collapsed' : ''}`} data-geometry={COURSE.theme.geometry} style={theme}>
      <header className="topbar">
        <button
          type="button"
          className="sidebar-toggle"
          aria-label={sidebarCollapsed ? 'Expand course navigation' : 'Collapse course navigation'}
          aria-expanded={!sidebarCollapsed}
          aria-controls="course-navigation"
          onClick={() => setSidebarCollapsed((value) => !value)}
        >
          <PanelLeft size={18} aria-hidden="true" />
        </button>
        <Link className="brand" to="/" onClick={() => setMenuOpen(false)}>
          <span className="brand-mark"><BookOpen size={20} /></span>
          <span><strong>{COURSE.shortTitle}</strong><small>{COURSE.code}</small></span>
        </Link>
        <div className="topbar-actions">
          <div className="topbar-meta"><span>{COURSE.institution}</span><span>{COURSE.term}</span></div>
          <button
            type="button"
            className="topbar-reset"
            aria-label="Reset all progress"
            onClick={() => {
              setMenuOpen(false);
              setConfirmingReset(true);
            }}
          >
            <RotateCcw size={15} /> <span>Start over</span>
          </button>
          <ThemeToggle />
          <button className="mobile-menu" aria-expanded={menuOpen} aria-label="Toggle course navigation" onClick={() => setMenuOpen((value) => !value)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      <div className="shell-body">
        <aside id="course-navigation" className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
          <nav aria-label="Course navigation">
            <NavLink className={({ isActive }) => `nav-item nav-home ${isActive ? 'is-active' : ''}`} to="/" end onClick={() => setMenuOpen(false)}>
              <Home size={17} /> Course overview
            </NavLink>
            <p className="nav-label">Course path</p>
            {COURSE_LECTURES.map((lecture) => {
              const lessons = lecture.modules.filter((module) => module.kind !== 'practice');
              const exercises = lecture.modules.filter((module) => module.kind === 'practice');
              const isExpanded = expandedLectures.has(lecture.id);
              const lectureContentId = `${lecture.id}-nav-content`;

              return (
                <section className={`nav-lecture ${isExpanded ? 'is-expanded' : ''}`} key={lecture.id}>
                  <button
                    type="button"
                    className="nav-lecture-toggle"
                    aria-expanded={isExpanded}
                    aria-controls={lectureContentId}
                    onClick={() => setExpandedLectures((current) => {
                      const next = new Set(current);
                      if (next.has(lecture.id)) next.delete(lecture.id);
                      else next.add(lecture.id);
                      return next;
                    })}
                  >
                    <span className="nav-lecture-heading">
                      <span>Lecture {lecture.number}</span>
                      <strong>{lecture.title}</strong>
                    </span>
                    <BookOpen className="nav-lecture-icon" size={16} aria-hidden="true" />
                    <ChevronRight size={16} aria-hidden="true" />
                  </button>
                  <div id={lectureContentId} className={`nav-lecture-content ${isExpanded ? 'is-open' : ''}`} aria-hidden={!isExpanded} inert={!isExpanded}>
                    <div className="nav-lecture-lessons">
                    {lessons.map((module) => (
                      <ModuleNavLink
                        key={module.slug}
                        module={module}
                        completed={completedSlugs.includes(module.slug)}
                        onNavigate={() => setMenuOpen(false)}
                      />
                    ))}
                    </div>
                    {exercises.length > 0 && (
                      <div className="nav-exercises">
                        <p><FolderOpen size={14} aria-hidden="true" /> Exercises about Lecture {lecture.number}</p>
                        {exercises.map((module) => (
                          <ModuleNavLink
                            key={module.slug}
                            module={module}
                            completed={completedSlugs.includes(module.slug)}
                            onNavigate={() => setMenuOpen(false)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </nav>
          <div className="sidebar-note">
            <strong>For students</strong>
            <p>Your progress is saved only in this browser.</p>
          </div>
        </aside>
        {menuOpen && <button className="menu-scrim" aria-label="Close navigation" onClick={() => setMenuOpen(false)} />}

        <main className="main-content"><Outlet /></main>
      </div>
      {confirmingReset && (
        <div className="reset-dialog-backdrop">
          <div
            className="reset-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="reset-dialog-title"
            aria-describedby="reset-dialog-description"
          >
            <h2 id="reset-dialog-title">Start this course over?</h2>
            <p id="reset-dialog-description">
              This deletes every saved answer and completion for this course. The lessons themselves will not change.
            </p>
            <div className="reset-dialog-actions">
              <button ref={resetCancelRef} type="button" className="sidebar-reset-cancel" onClick={() => setConfirmingReset(false)}>Cancel</button>
              <button type="button" className="sidebar-reset-confirm" onClick={resetAllProgress}>Delete saved progress</button>
            </div>
          </div>
        </div>
      )}
      <ScrollRestoration />
    </div>
  );
}
