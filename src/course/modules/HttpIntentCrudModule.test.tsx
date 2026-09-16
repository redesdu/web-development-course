import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { ExchangeBuilder, TransferExplanation } from './HttpIntentCrudModule';

describe('HTTP pilot interactions', () => {
  beforeEach(() => localStorage.clear());

  it('recovers from malformed state and explains an incorrect exchange before revision', async () => {
    localStorage.setItem(courseStorageKey('http-exchange-builder', 'reservation-create'), '0');
    const onComplete = vi.fn();
    render(<ExchangeBuilder onComplete={onComplete} />);

    expect(screen.getByLabelText('HTTP method')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('HTTP method'), { target: { value: 'get' } });
    fireEvent.change(screen.getByLabelText('Target path'), { target: { value: 'reservation-item' } });
    fireEvent.change(screen.getByLabelText('Response status family'), { target: { value: 'client-error' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send this exchange' }));

    expect(screen.getByRole('status')).toHaveTextContent('One or more fields change the meaning.');
    expect(screen.getByRole('status')).toHaveTextContent('POST communicates that creation intent.');
    expect(onComplete).not.toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Revise exchange' }));
    fireEvent.change(screen.getByLabelText('HTTP method'), { target: { value: 'post' } });
    fireEvent.change(screen.getByLabelText('Target path'), { target: { value: 'reservation-collection' } });
    fireEvent.change(screen.getByLabelText('Response status family'), { target: { value: 'success' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send this exchange' }));

    expect(screen.getByRole('status')).toHaveTextContent('This exchange matches the intent.');
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
  });

  it('restores a resolved exchange and its explanation after remounting', async () => {
    const onComplete = vi.fn();
    const { unmount } = render(<ExchangeBuilder onComplete={onComplete} />);
    fireEvent.change(screen.getByLabelText('HTTP method'), { target: { value: 'post' } });
    fireEvent.change(screen.getByLabelText('Target path'), { target: { value: 'reservation-collection' } });
    fireEvent.change(screen.getByLabelText('Response status family'), { target: { value: 'success' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send this exchange' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    unmount();

    render(<ExchangeBuilder onComplete={vi.fn()} />);
    expect(screen.getByLabelText('HTTP method')).toHaveValue('post');
    expect(screen.getByRole('status')).toHaveTextContent('This exchange matches the intent.');
  });

  const explanation = [
    'The browser sends a DELETE request naming restaurant 42, the server checks the request and removes',
    'that saved item, then the response tells the browser to update the visible list.',
  ].join(' ');

  it('keeps a written transfer explanation and transparent self-check on revisit', async () => {
    const onComplete = vi.fn();
    const { unmount } = render(<TransferExplanation onComplete={onComplete} />);

    fireEvent.change(screen.getByLabelText('Your explanation'), { target: { value: explanation } });
    fireEvent.click(screen.getByRole('button', { name: 'Compare explanation' }));
    expect(screen.getByText('Compare these four parts')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'I compared all four parts' }));
    await waitFor(() => expect(onComplete).toHaveBeenCalledTimes(1));
    unmount();

    render(<TransferExplanation onComplete={vi.fn()} />);
    expect(screen.getByLabelText('Your explanation')).toHaveValue(explanation);
    expect(screen.getByText(/Comparison complete\./)).toBeInTheDocument();
  });

  describe('the twenty-word minimum on the DELETE case', () => {
    it('states the requirement before the student writes', () => {
      render(<TransferExplanation onComplete={vi.fn()} />);
      expect(screen.getByText(/Write at least 20 words/)).toBeInTheDocument();
      expect(screen.getByTestId('written-answer-count')).toHaveTextContent('0 / 20 words');
    });

    it('holds back the comparison until the answer is long enough', () => {
      render(<TransferExplanation onComplete={vi.fn()} />);
      const field = screen.getByLabelText('Your explanation');

      fireEvent.change(field, { target: { value: 'The browser sends a DELETE request and the list updates.' } });
      expect(screen.getByTestId('written-answer-count')).toHaveTextContent('10 / 20 words');
      expect(screen.getByRole('button', { name: 'Compare explanation' })).toBeDisabled();

      fireEvent.change(field, { target: { value: explanation } });
      expect(screen.getByRole('button', { name: 'Compare explanation' })).toBeEnabled();
    });

    it('still loads a shorter answer saved before the requirement existed', () => {
      localStorage.setItem(
        courseStorageKey('http-transfer', 'saved-restaurant-delete'),
        JSON.stringify({ version: 1, text: 'An answer saved earlier.', submitted: true, confirmed: true }),
      );

      render(<TransferExplanation onComplete={vi.fn()} />);
      expect(screen.getByLabelText('Your explanation')).toHaveValue('An answer saved earlier.');
      expect(screen.getByText(/Comparison complete\./)).toBeInTheDocument();
    });
  });
});
