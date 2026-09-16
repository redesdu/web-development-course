import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleSequenceProvider } from '@/course/ModuleSequenceContext';
import { COURSE_MODULES } from './index';
import HtmlCssPracticeModule from './HtmlCssPracticeModule';

const module = COURSE_MODULES.find((entry) => entry.slug === 'html-css-practice')!;

function renderModule() {
  return render(
    <MemoryRouter>
      <ModuleSequenceProvider previous={{ slug: 'html-structure-css-layout', number: 3, title: 'HTML structure and CSS layout' }}>
        <HtmlCssPracticeModule module={module} />
      </ModuleSequenceProvider>
    </MemoryRouter>,
  );
}

function stepLabels() {
  return screen.getAllByRole('button')
    .filter((button) => button.className.includes('learning-flow-dot'))
    .map((button) => button.getAttribute('aria-label'));
}

describe('Lecture 2 practice', () => {
  beforeEach(() => localStorage.clear());

  it('runs four conceptual activities, two fragment exercises, and one full build', () => {
    renderModule();

    expect(stepLabels()).toEqual([
      'When a div is the right answer, current step, not answered yet',
      'Choose the method from the consequence, not answered yet',
      'Predict the winning rule, not answered yet',
      'Pick the layout the content actually needs, not answered yet',
      'Complete the document and its metadata, not answered yet',
      'Make this sign-up form accessible and submittable, not answered yet',
      'Build a semantic page from nothing, not answered yet',
    ]);
  });

  it('opens on a semantics judgement that the rules alone do not settle', () => {
    renderModule();

    expect(screen.getByRole('heading', { name: 'When a div is the right answer' })).toBeInTheDocument();
    expect(screen.getByText(/purely so one CSS grid rule can position them/)).toBeInTheDocument();
  });

  it('rejects the plausible reading that semantic elements are always better', () => {
    renderModule();

    fireEvent.click(screen.getByRole('radio', { name: /using it everywhere is an improvement/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByText(/Semantic elements help only when they are true/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled();
    expect(screen.getByText(/Not answered yet/)).toBeInTheDocument();
  });

  it('accepts the reading that separates meaning from a styling wrapper', async () => {
    renderModule();

    fireEvent.click(screen.getByRole('radio', { name: /Make each announcement an <article>/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    await waitFor(() => expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled());
  });
});
