import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleSequenceProvider } from '@/course/ModuleSequenceContext';
import HttpCrudQuickCheckModule from './HttpCrudQuickCheckModule';

describe('HTTP and CRUD quick check', () => {
  beforeEach(() => localStorage.clear());

  it('starts with an unanswered first question and keeps later questions locked', () => {
    render(
      <MemoryRouter>
        <ModuleSequenceProvider previous={{ slug: 'http-intent-evidence-crud', number: 1, title: 'HTTP intent, evidence, and CRUD' }}>
          <HttpCrudQuickCheckModule
            module={{
              slug: 'http-crud-quick-check', number: 2, lecture: { id: 'lecture-1', number: 1, title: 'Introduction to Web Development' }, kind: 'practice', title: 'Quick check: web apps, HTTP, and CRUD',
              summary: 'Retrieve core ideas from Lecture 1.', estimatedMinutes: 15, objectives: [], sourceRefs: [], status: 'draft', Component: HttpCrudQuickCheckModule,
            }}
          />
        </ModuleSequenceProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Which description best matches a web application?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'A reason to use web technology' })).toBeDisabled();
  });
});
