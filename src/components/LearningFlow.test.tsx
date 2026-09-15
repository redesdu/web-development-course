import { useEffect } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { LearningFlow, type LearningFlowStep } from './LearningFlow';

function RestoredActivity({ onComplete }: { onComplete: () => void }) {
  useEffect(() => onComplete(), [onComplete]);
  return <p>A saved correct answer is restored.</p>;
}

const steps: LearningFlowStep[] = [
  {
    id: 'notice',
    title: 'Notice the pattern',
    autoComplete: true,
    render: () => <p>Look closely.</p>,
  },
  {
    id: 'try',
    title: 'Try the rule',
    render: ({ completeStep, isComplete }) => (
      <div>
        <button onClick={completeStep}>Solve</button>
        {isComplete && <p>The explanation stays visible.</p>}
      </div>
    ),
  },
];

describe('LearningFlow', () => {
  beforeEach(() => localStorage.clear());

  test('requires explicit continuation and restores completion', async () => {
    const { unmount } = render(<LearningFlow storageKey="flow-test" steps={steps} />);

    expect(screen.getByRole('button', { name: 'Notice the pattern, current step' })).toBeInTheDocument();
    expect(localStorage.getItem(courseStorageKey('learning-flow', 'flow-test'))).toBeNull();
    await waitFor(() => expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled();

    unmount();
    render(<LearningFlow storageKey="flow-test" steps={steps} />);
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
  });

  test('keeps completion reported by a restored activity during mount', async () => {
    const { unmount } = render(<LearningFlow storageKey="restored-child" steps={steps} />);

    await waitFor(() => expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled());
    fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
    unmount();

    const restoringSteps: LearningFlowStep[] = [
      steps[0],
      {
        ...steps[1],
        render: ({ completeStep }) => <RestoredActivity onComplete={completeStep} />,
      },
    ];
    render(<LearningFlow storageKey="restored-child" steps={restoringSteps} />);

    expect(screen.getByText('A saved correct answer is restored.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled());
  });

  test('lets an activity reset revoke its completed step', async () => {
    const resettableSteps: LearningFlowStep[] = [{
      id: 'resettable',
      title: 'Resettable activity',
      render: ({ completeStep, resetStep, isComplete }) => (
        <div>
          <button onClick={completeStep}>Solve</button>
          <button onClick={resetStep}>Reset answer</button>
          {isComplete && <p>Resolved explanation</p>}
        </div>
      ),
    }];

    render(<LearningFlow storageKey="resettable-flow" steps={resettableSteps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Reset answer' }));
    expect(screen.getByRole('button', { name: 'Finish' })).toBeDisabled();
    expect(screen.queryByText('Resolved explanation')).not.toBeInTheDocument();
  });
});
