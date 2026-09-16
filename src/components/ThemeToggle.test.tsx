import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.style.removeProperty('color-scheme');
  });

  it('restores and persists the learner theme', () => {
    window.localStorage.setItem('sdu-learning-theme', 'dark');
    render(<ThemeToggle />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('sdu-learning-theme')).toBe('light');
    expect(screen.getByRole('button', { name: 'Switch to dark mode' })).toBeInTheDocument();
  });

  it('opens dark when the learner has never chosen', () => {
    render(<ThemeToggle />);

    expect(document.documentElement.dataset.theme).toBe('dark');
    // A first visit must not silently pin a theme the learner never picked.
    expect(window.localStorage.getItem('sdu-learning-theme')).toBeNull();
  });

  it('stores a choice only once the learner makes one', () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole('button', { name: 'Switch to light mode' }));

    expect(document.documentElement.dataset.theme).toBe('light');
    expect(window.localStorage.getItem('sdu-learning-theme')).toBe('light');
  });
});
