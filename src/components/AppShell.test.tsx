import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { AppShell } from './AppShell';

vi.mock('@/hooks/useCourseProgress', () => ({
  useCourseProgress: () => ({ completedSlugs: [], isCompleted: () => false, setCompleted: vi.fn() }),
}));

function renderShell(initialEntry: string) {
  const router = createMemoryRouter([
    { path: '*', element: <AppShell /> },
  ], { initialEntries: [initialEntry] });
  return render(<RouterProvider router={router} />);
}

describe('AppShell lecture navigation', () => {
  it('opens the active lecture and lets learners collapse and expand groups', async () => {
    renderShell('/modules/html-css-practice');

    const lectureOne = screen.getByRole('button', { name: /Lecture 1 Introduction to Web Development/ });
    const lectureTwo = screen.getByRole('button', { name: /Lecture 2 HTML, CSS, and Layout/ });

    expect(lectureOne).toHaveAttribute('aria-expanded', 'false');
    expect(lectureTwo).toHaveAttribute('aria-expanded', 'true');
    expect(screen.queryByRole('link', { name: /02 Quick check/ })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /04 Practice: structure and style/ })).toBeInTheDocument();

    await lectureOne.click();
    expect(lectureOne).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('link', { name: /02 Quick check/ })).toBeInTheDocument();

    await lectureOne.click();
    expect(lectureOne).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('link', { name: /02 Quick check/ })).not.toBeInTheDocument();
  });
});
