import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { PracticeApplication } from './HtmlCssPracticeModule';

describe('Lecture 2 practice transfer', () => {
  beforeEach(() => localStorage.clear());

  it('falls back from malformed state, explains a near miss, and restores success', async () => {
    localStorage.setItem(courseStorageKey('html-css-practice-application', 'resource-search'), JSON.stringify({ version: 1, method: 'unknown', element: 'form', css: '.result', explanation: '', submitted: false }));
    const onComplete = vi.fn();
    const { unmount } = render(<PracticeApplication onComplete={onComplete} onReset={vi.fn()} />);
    expect(screen.getByLabelText('Common form method')).toHaveValue('');

    fireEvent.change(screen.getByLabelText('Common form method'), { target: { value: 'post' } });
    fireEvent.change(screen.getByLabelText('Element for the controls'), { target: { value: 'form' } });
    fireEvent.change(screen.getByLabelText('Selector for all results'), { target: { value: '.result' } });
    fireEvent.change(screen.getByLabelText('Explain how HTML and CSS divide the work.'), { target: { value: 'HTML gives the search controls meaning while CSS styles the result list.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check application' }));
    expect(screen.getByRole('status')).toHaveTextContent('does not match');
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Revise' }));
    fireEvent.change(screen.getByLabelText('Common form method'), { target: { value: 'get' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check application' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    unmount();

    render(<PracticeApplication onComplete={vi.fn()} onReset={vi.fn()} />);
    expect(screen.getByLabelText('Common form method')).toHaveValue('get');
    expect(screen.getByRole('status')).toHaveTextContent('matches the stated behaviour');
  });
});
