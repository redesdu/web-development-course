import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'sdu-learning-theme';

/** The course opens dark, the way the AI101 companion course does. */
const DEFAULT_THEME: Theme = 'dark';

function storedChoice(): Theme | null {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'light' || stored === 'dark' ? stored : null;
  } catch {
    return null;
  }
}

/**
 * Dark by default, light whenever the student asks for it.
 *
 * Nothing is written to storage on load, so a first visit is not silently
 * pinned to a theme the student never chose. Only an actual press of this
 * control is remembered, and it then wins on every later visit.
 */
export function ThemeToggle() {
  const [choice, setChoice] = useState<Theme | null>(storedChoice);
  const theme = choice ?? DEFAULT_THEME;
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  }, [theme]);

  useEffect(() => {
    if (choice === null) return;
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, choice);
    } catch {
      // The theme still applies for this visit if storage is unavailable.
    }
  }, [choice]);

  return (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${nextTheme} mode`}
      title={`Switch to ${nextTheme} mode`}
      onClick={() => setChoice(nextTheme)}
    >
      <span className="theme-toggle-icon" aria-hidden="true">
        {theme === 'light' ? <Moon size={17} /> : <Sun size={17} />}
      </span>
      <span className="theme-toggle-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
    </button>
  );
}
