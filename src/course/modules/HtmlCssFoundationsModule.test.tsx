import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { SemanticBuilder, TransferPlan } from './HtmlCssFoundationsModule';

describe('Lecture 2 study interactions', () => {
  beforeEach(() => localStorage.clear());

  it('recovers from malformed semantic state and preserves a resolved construction', async () => {
    localStorage.setItem(courseStorageKey('html-css-semantic-builder', 'news-page'), '{bad json');
    const onComplete = vi.fn();
    const onReset = vi.fn();
    const { unmount } = render(<SemanticBuilder onComplete={onComplete} onReset={onReset} />);

    expect(screen.getByLabelText('Site navigation')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Site navigation'), { target: { value: 'div' } });
    fireEvent.change(screen.getByLabelText('Primary page content'), { target: { value: 'main' } });
    fireEvent.change(screen.getByLabelText('Independent news story'), { target: { value: 'article' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check structure' }));
    expect(screen.getByRole('status')).toHaveTextContent('hide useful meaning');
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Revise' }));
    fireEvent.change(screen.getByLabelText('Site navigation'), { target: { value: 'nav' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check structure' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    unmount();

    render(<SemanticBuilder onComplete={vi.fn()} onReset={onReset} />);
    expect(screen.getByLabelText('Site navigation')).toHaveValue('nav');
    expect(screen.getByText(/communicates each region/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }));
    expect(screen.getByLabelText('Site navigation')).toHaveValue('');
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it('requires correct structured choices before completing the transfer', async () => {
    const onComplete = vi.fn();
    render(<TransferPlan onComplete={onComplete} onReset={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Element for each announcement'), { target: { value: 'article' } });
    fireEvent.change(screen.getByLabelText('Selector for the shared class'), { target: { value: '#announcement' } });
    fireEvent.change(screen.getByLabelText('Layout for rows and columns'), { target: { value: 'grid' } });
    fireEvent.change(screen.getByLabelText('Why do these choices fit?'), { target: { value: [
      'The article element gives each announcement its own meaning, the class selector reaches every',
      'card that shares it, and grid coordinates the rows and columns the page needs.',
    ].join(' ') } });
    fireEvent.click(screen.getByRole('button', { name: 'Check page plan' }));
    expect(screen.getByText(/Revisit the field/)).toBeInTheDocument();
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Revise' }));
    fireEvent.change(screen.getByLabelText('Selector for the shared class'), { target: { value: '.announcement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check page plan' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  describe('the twenty-word minimum on the page plan', () => {
    it('holds back the check until the reasoning is long enough', () => {
      render(<TransferPlan onComplete={vi.fn()} onReset={vi.fn()} />);
      fireEvent.change(screen.getByLabelText('Element for each announcement'), { target: { value: 'article' } });
      fireEvent.change(screen.getByLabelText('Selector for the shared class'), { target: { value: '.announcement' } });
      fireEvent.change(screen.getByLabelText('Layout for rows and columns'), { target: { value: 'grid' } });

      fireEvent.change(screen.getByLabelText('Why do these choices fit?'), { target: { value: 'Article is meaningful and grid works.' } });
      expect(screen.getByTestId('written-answer-count')).toHaveTextContent('6 / 20 words');
      expect(screen.getByRole('button', { name: 'Check page plan' })).toBeDisabled();
    });

    it('still loads a shorter plan saved before the requirement existed', () => {
      localStorage.setItem(
        courseStorageKey('html-css-transfer', 'course-announcements'),
        JSON.stringify({ version: 1, wrapper: 'article', selector: '.announcement', layout: 'grid', explanation: 'Saved earlier.', submitted: true }),
      );

      render(<TransferPlan onComplete={vi.fn()} onReset={vi.fn()} />);
      expect(screen.getByLabelText('Why do these choices fit?')).toHaveValue('Saved earlier.');
    });
  });
});
