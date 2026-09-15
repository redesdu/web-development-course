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
    expect(screen.getByRole('status')).toHaveTextContent('communicates each region');
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
    fireEvent.change(screen.getByLabelText('Why do these choices fit?'), { target: { value: 'The element gives meaning and the selector should reach every announcement card.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check page plan' }));
    expect(screen.getByRole('status')).toHaveTextContent('Revisit the field');
    expect(onComplete).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Revise' }));
    fireEvent.change(screen.getByLabelText('Selector for the shared class'), { target: { value: '.announcement' } });
    fireEvent.click(screen.getByRole('button', { name: 'Check page plan' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });
});
