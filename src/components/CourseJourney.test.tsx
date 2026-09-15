import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { COURSE_MODULES } from '@/course/modules';
import { CourseJourney, groupModulesByLecture } from './CourseJourney';

describe('CourseJourney', () => {
  it('groups lessons and exercises under their lecture', () => {
    const groups = groupModulesByLecture(COURSE_MODULES);

    expect(groups.map((group) => [group.number, group.title, group.modules.length])).toEqual([
      [1, 'Introduction to Web Development', 2],
      [2, 'HTML, CSS, and Layout', 2],
    ]);
  });

  it('renders every module inside a clearly labelled lecture and exercises directory', () => {
    render(
      <MemoryRouter>
        <CourseJourney modules={COURSE_MODULES} completedSlugs={[COURSE_MODULES[0].slug]} />
      </MemoryRouter>,
    );

    expect(screen.getAllByRole('listitem')).toHaveLength(COURSE_MODULES.length);
    expect(screen.getByRole('heading', { name: 'Introduction to Web Development' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'HTML, CSS, and Layout' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Exercises about Lecture 1' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'Exercises about Lecture 2' })).toBeVisible();
    for (const module of COURSE_MODULES) {
      expect(screen.getByRole('link', { name: new RegExp(module.title) })).toHaveAttribute(
        'href',
        `/modules/${module.slug}`,
      );
    }
    expect(screen.getByText('Lesson completed')).toBeVisible();
  });

  it('handles a course plan before its first module is ready', () => {
    render(
      <MemoryRouter>
        <CourseJourney modules={[]} completedSlugs={[]} />
      </MemoryRouter>,
    );

    expect(screen.getByText('No modules are ready yet.')).toBeInTheDocument();
  });
});
