import { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { WrittenAnswer } from './WrittenAnswer';

function Harness({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial);
  return <WrittenAnswer label="Your explanation" value={value} onChange={setValue} />;
}

const twentyWords = Array.from({ length: 20 }, (_, index) => `word${index}`).join(' ');

describe('WrittenAnswer', () => {
  test('states the requirement before the student writes', () => {
    render(<Harness />);
    expect(screen.getByText(/Write at least 20 words/)).toBeInTheDocument();
    expect(screen.getByTestId('written-answer-count')).toHaveTextContent('0 / 20 words');
  });

  test('counts real words as the student writes', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Your explanation'), {
      target: { value: 'the browser sends a request, then waits.' },
    });
    expect(screen.getByTestId('written-answer-count')).toHaveTextContent('7 / 20 words');
  });

  test('explains what is still missing in an accessible message', () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText('Your explanation'), { target: { value: 'too short' } });
    expect(screen.getByRole('status')).toHaveTextContent('18 more words needed');
  });

  test('uses the singular when one word is missing', () => {
    render(<Harness initial={Array.from({ length: 19 }, (_, i) => `w${i}`).join(' ')} />);
    expect(screen.getByRole('status')).toHaveTextContent('1 more word needed');
  });

  test('confirms the requirement once it is met', () => {
    render(<Harness initial={twentyWords} />);
    expect(screen.getByTestId('written-answer-count')).toHaveTextContent('20 / 20 words');
    expect(screen.getByTestId('written-answer-count')).toHaveClass('is-met');
    expect(screen.getByRole('status')).toHaveTextContent('Word requirement met');
  });

  test('shows a shorter answer saved before the requirement existed', () => {
    render(<Harness initial="an answer saved earlier" />);
    expect(screen.getByLabelText('Your explanation')).toHaveValue('an answer saved earlier');
    expect(screen.getByTestId('written-answer-count')).toHaveTextContent('4 / 20 words');
  });
});
