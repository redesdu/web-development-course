import { fireEvent, render, screen } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { KnowledgeCheck } from './KnowledgeCheck';

describe('KnowledgeCheck', () => {
  beforeEach(() => localStorage.clear());

  it('starts with no answer selected when persistence is empty or malformed', () => {
    localStorage.setItem(courseStorageKey('knowledge-check', 'fresh-check'), '0');

    render(
      <KnowledgeCheck
        storageKey="fresh-check"
        question="Choose one"
        options={[
          { id: 'first', label: 'First', feedback: 'Try again.' },
          { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
        ]}
      />,
    );

    expect(screen.getAllByRole<HTMLInputElement>('radio').every((radio) => !radio.checked)).toBe(true);
    expect(screen.getByRole('button', { name: 'Check answer' })).toBeDisabled();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('reveals targeted feedback after an answer is checked', () => {
    render(
      <KnowledgeCheck
        question="Which answer is correct?"
        options={[
          { id: 'first', label: 'First', feedback: 'Try again.' },
          { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
        ]}
      />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

    expect(screen.getByText('This rule fits.')).toBeInTheDocument();
    expect(screen.getByText('That is why.')).toBeInTheDocument();
  });

  it('restores a submitted answer and its explanation', () => {
    const props = {
      question: 'Which answer is correct?',
      storageKey: 'persistent-check',
      options: [
        { id: 'first', label: 'First', feedback: 'Try again.' },
        { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
      ],
    };
    const { unmount } = render(<KnowledgeCheck {...props} />);

    fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    unmount();
    render(<KnowledgeCheck {...props} />);

    expect(screen.getByText('This rule fits.')).toBeInTheDocument();
    expect(screen.getByText('That is why.')).toBeInTheDocument();
  });

  it('restores by stable option id when options are reordered', () => {
    const question = 'Which answer is correct?';
    const first = { id: 'first', label: 'First', feedback: 'Try again.' };
    const second = { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' };
    const { unmount } = render(
      <KnowledgeCheck question={question} storageKey="reordered-check" options={[first, second]} />,
    );

    fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    unmount();
    render(<KnowledgeCheck question={question} storageKey="reordered-check" options={[second, first]} />);

    expect(screen.getByRole('radio', { name: /Second/ })).toBeChecked();
    expect(screen.getByText('That is why.')).toBeInTheDocument();
  });

  it('clears the persisted answer before a retry', () => {
    const props = {
      question: 'Which answer is correct?',
      storageKey: 'retry-check',
      options: [
        { id: 'first', label: 'First', feedback: 'Try again.' },
        { id: 'second', label: 'Second', correct: true, feedback: 'That is why.' },
      ],
    };
    const { unmount } = render(<KnowledgeCheck {...props} />);

    fireEvent.click(screen.getByRole('radio', { name: /First/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    unmount();
    render(<KnowledgeCheck {...props} />);

    expect(screen.getAllByRole<HTMLInputElement>('radio').every((radio) => !radio.checked)).toBe(true);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  describe('when a student cannot get it right', () => {
    const options = [
      { id: 'first', label: 'First', feedback: 'That is not the rule.' },
      { id: 'second', label: 'Second', correct: true, feedback: 'The second option follows the rule.' },
      { id: 'third', label: 'Third', feedback: 'That confuses two ideas.' },
    ];

    function answerWrongly(times: number) {
      for (let attempt = 0; attempt < times; attempt += 1) {
        fireEvent.click(screen.getByRole('radio', { name: /First/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
        fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
      }
    }

    it('offers the solution only after the third wrong answer', () => {
      render(
        <KnowledgeCheck
          question="Which answer is correct?"
          storageKey="stuck-check"
          options={options}
          onAssisted={vi.fn()}
        />,
      );

      answerWrongly(2);
      expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();

      answerWrongly(1);
      expect(screen.getByRole('button', { name: /Show solution and continue/ })).toBeInTheDocument();
    });

    it('keeps the student answer and separates the solution from its explanation', () => {
      render(
        <KnowledgeCheck
          question="Which answer is correct?"
          storageKey="separated-check"
          options={options}
          onAssisted={vi.fn()}
        />,
      );

      answerWrongly(3);
      fireEvent.click(screen.getByRole('radio', { name: /Third/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));
      fireEvent.click(screen.getByRole('button', { name: /Show solution and continue/ }));

      expect(screen.getByRole('radio', { name: /Third/ })).toBeChecked();
      expect(screen.getByText('That confuses two ideas.')).toBeInTheDocument();

      const solution = screen.getByRole('heading', { name: /Solution/ });
      const explanation = screen.getByRole('heading', { name: 'Why this is the answer' });
      expect(solution).toBeInTheDocument();
      expect(explanation).toBeInTheDocument();
      expect(screen.getByText('The second option follows the rule.')).toBeInTheDocument();
    });

    it('records the step as assisted when the student continues', () => {
      const onAssisted = vi.fn();
      render(
        <KnowledgeCheck
          question="Which answer is correct?"
          storageKey="continue-check"
          options={options}
          onAssisted={onAssisted}
        />,
      );

      answerWrongly(3);
      fireEvent.click(screen.getByRole('button', { name: /Show solution and continue/ }));
      fireEvent.click(screen.getByRole('button', { name: /^Continue/ }));

      expect(onAssisted).toHaveBeenCalledTimes(1);
    });

    it('never offers help to a student who answered correctly', () => {
      render(
        <KnowledgeCheck
          question="Which answer is correct?"
          storageKey="correct-check"
          options={options}
          onAssisted={vi.fn()}
        />,
      );

      answerWrongly(3);
      fireEvent.click(screen.getByRole('radio', { name: /Second/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Check answer' }));

      expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();
      expect(screen.getByText('This rule fits.')).toBeInTheDocument();
    });

    it('offers no solution path when the activity does not support one', () => {
      render(
        <KnowledgeCheck question="Which answer is correct?" storageKey="no-assist-check" options={options} />,
      );

      answerWrongly(3);
      expect(screen.queryByRole('button', { name: /Show solution and continue/ })).not.toBeInTheDocument();
    });

    it('remembers the attempts across a reload', () => {
      const props = {
        question: 'Which answer is correct?',
        storageKey: 'remembered-attempts',
        options,
        onAssisted: vi.fn(),
      };
      const { unmount } = render(<KnowledgeCheck {...props} />);
      answerWrongly(3);
      unmount();

      render(<KnowledgeCheck {...props} />);
      expect(screen.getByRole('button', { name: /Show solution and continue/ })).toBeInTheDocument();
    });
  });
});
