import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleSequenceProvider } from '@/course/ModuleSequenceContext';
import { COURSE_MODULES } from './index';
import HttpCrudQuickCheckModule from './HttpCrudQuickCheckModule';

const module = COURSE_MODULES.find((entry) => entry.slug === 'http-crud-quick-check')!;

function renderModule() {
  return render(
    <MemoryRouter>
      <ModuleSequenceProvider next={{ slug: 'html-structure-css-layout', number: 3, title: 'HTML structure and CSS layout' }}>
        <HttpCrudQuickCheckModule module={module} />
      </ModuleSequenceProvider>
    </MemoryRouter>,
  );
}

describe('Lecture 1 practice', () => {
  beforeEach(() => localStorage.clear());

  it('opens on a scenario that has to be interpreted, not recalled', () => {
    renderModule();

    expect(screen.getByRole('heading', { name: 'Argue the trade-off, not the slogan' })).toBeInTheDocument();
    expect(screen.getByText(/booking tool for lab equipment/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
  });

  it('runs a scenario set and lets the student reach any activity at once', () => {
    renderModule();

    const stepButtons = screen.getAllByRole('button')
      .filter((button) => button.className.includes('learning-flow-dot'));
    expect(stepButtons).toHaveLength(9);
    expect(stepButtons.some((button) => button.hasAttribute('disabled'))).toBe(false);
  });

  it('covers the trade-off, sequence, message, URL, status, CRUD, diagnosis, and construction targets', () => {
    renderModule();
    const labels = screen.getAllByRole('button')
      .filter((button) => button.className.includes('learning-flow-dot'))
      .map((button) => button.getAttribute('aria-label'));

    expect(labels).toEqual([
      'Argue the trade-off, not the slogan, current step, not answered yet',
      'Order an exchange that passes through a proxy, not answered yet',
      'Read a message that does not work, not answered yet',
      'Two URLs, one difference that matters, not answered yet',
      'Use the status as evidence, not answered yet',
      'Same screen, different intent, not answered yet',
      'Diagnose a request that contradicts itself, not answered yet',
      'Build the exchange that changes a booking, not answered yet',
      'Build the exchange that removes a saved item, not answered yet',
    ]);
  });

  it('rejects a defensible but wrong reading of the trade-off', () => {
    renderModule();

    fireEvent.click(screen.getByRole('radio', { name: /Students will not need to install anything/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByText(/A benefit is not a trade-off/)).toBeInTheDocument();
    // The student may move on regardless; the step simply stays unanswered.
    expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled();
    expect(screen.getByText(/Not answered yet/)).toBeInTheDocument();
  });

  it('accepts the reading that names what the department gives up', async () => {
    renderModule();

    fireEvent.click(screen.getByRole('radio', { name: /Bookings concentrate on one server/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByText(/That is the trade-off/)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled());
  });

  it('lets a stuck student continue with help after three wrong answers', async () => {
    renderModule();

    for (let attempt = 0; attempt < 3; attempt += 1) {
      fireEvent.click(screen.getByRole('radio', { name: /Students will not need to install anything/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
      fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    }

    fireEvent.click(screen.getByRole('button', { name: /Show solution and continue/ }));
    expect(screen.getByRole('heading', { name: /Solution/ })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('assisted-continue'));

    await waitFor(() => expect(screen.getByText(/Completed with help/)).toBeInTheDocument());
  });
});
