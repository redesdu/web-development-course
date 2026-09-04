import { BookOpen, CheckCircle2, Home, Menu, RotateCcw, X } from 'lucide-react';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { Link, NavLink, Outlet, ScrollRestoration } from 'react-router-dom';
import { COURSE } from '@/course/course.config';
import { COURSE_MODULES } from '@/course/modules';
import { useCourseProgress } from '@/hooks/useCourseProgress';
import { beginCourseStorageReset } from '@/lib/courseStorage';
import { ThemeToggle } from './ThemeToggle';

export function AppShell() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const resetCancelRef = useRef<HTMLButtonElement>(null);
  const { completedSlugs } = useCourseProgress();

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
    <div className="app-shell" data-geometry={COURSE.theme.geometry} style={theme}>
      <header className="topbar">
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
        <aside className={`sidebar ${menuOpen ? 'is-open' : ''}`}>
          <nav aria-label="Course navigation">
            <NavLink className={({ isActive }) => `nav-item nav-home ${isActive ? 'is-active' : ''}`} to="/" end onClick={() => setMenuOpen(false)}>
              <Home size={17} /> Course overview
            </NavLink>
            <p className="nav-label">Course path</p>
            {COURSE_MODULES.map((module) => (
              <NavLink
                className={({ isActive }) => `nav-item ${isActive ? 'is-active' : ''}`}
                key={module.slug}
                to={`/modules/${module.slug}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-number">{String(module.number).padStart(2, '0')}</span>
                <span>{module.title}</span>
                {completedSlugs.includes(module.slug) && <CheckCircle2 className="nav-check" size={16} aria-label="Completed" />}
              </NavLink>
            ))}
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
