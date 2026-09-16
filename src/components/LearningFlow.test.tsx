import { useEffect, type ReactNode } from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ModuleSequenceProvider } from '@/course/ModuleSequenceContext';
import { courseStorageKey } from '@/lib/courseStorage';
import { LearningFlow, type LearningFlowStep } from './LearningFlow';

function RestoredActivity({ onComplete }: { onComplete: () => void }) {
  useEffect(() => onComplete(), [onComplete]);
  return <p>A saved correct answer is restored.</p>;
}

const NEXT_MODULE = { slug: 'next-module', number: 2, title: 'The next module' };

function renderFlow(ui: ReactNode) {
  return render(
    <MemoryRouter>
      <ModuleSequenceProvider next={NEXT_MODULE}>{ui}</ModuleSequenceProvider>
    </MemoryRouter>,
  );
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
        <button onClick={() => completeStep()}>Solve</button>
        <button onClick={() => completeStep('assisted')}>Use the solution</button>
        {isComplete && <p>The explanation stays visible.</p>}
      </div>
    ),
  },
];

function savedFlowState(key: string) {
  const raw = localStorage.getItem(courseStorageKey('learning-flow', key));
  return raw ? JSON.parse(raw) : null;
}

async function reachTheLastStep() {
  await waitFor(() => expect(screen.getByRole('button', { name: /Continue/ })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
}

describe('LearningFlow', () => {
  beforeEach(() => localStorage.clear());

  test('requires explicit continuation and restores completion', async () => {
    const { unmount } = renderFlow(<LearningFlow storageKey="flow-test" steps={steps} />);

    expect(screen.getByRole('button', { name: 'Notice the pattern, current step, not answered yet' })).toBeInTheDocument();
    expect(localStorage.getItem(courseStorageKey('learning-flow', 'flow-test'))).toBeNull();
    await reachTheLastStep();
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled();

    unmount();
    renderFlow(<LearningFlow storageKey="flow-test" steps={steps} />);
    expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
  });

  test('keeps completion reported by a restored activity during mount', async () => {
    const { unmount } = renderFlow(<LearningFlow storageKey="restored-child" steps={steps} />);
    await reachTheLastStep();
    unmount();

    const restoringSteps: LearningFlowStep[] = [
      steps[0],
      { ...steps[1], render: ({ completeStep }) => <RestoredActivity onComplete={completeStep} /> },
    ];
    renderFlow(<LearningFlow storageKey="restored-child" steps={restoringSteps} />);

    expect(screen.getByText('A saved correct answer is restored.')).toBeInTheDocument();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled());
  });

  test('lets an activity reset revoke its completed step', () => {
    const resettableSteps: LearningFlowStep[] = [{
      id: 'resettable',
      title: 'Resettable activity',
      render: ({ completeStep, resetStep, isComplete }) => (
        <div>
          <button onClick={() => completeStep()}>Solve</button>
          <button onClick={resetStep}>Reset answer</button>
          {isComplete && <p>Resolved explanation</p>}
        </div>
      ),
    }];

    renderFlow(<LearningFlow storageKey="resettable-flow" steps={resettableSteps} />);
    fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
    expect(screen.getByText('Resolved explanation')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reset answer' }));
    expect(screen.queryByText('Resolved explanation')).not.toBeInTheDocument();
    expect(screen.getByText(/Not answered yet/)).toBeInTheDocument();
  });

  describe('moving freely between steps', () => {
    test('lets a student continue without answering', () => {
      // Neither step answers itself, so Continue is the only way forward.
      const unanswerable: LearningFlowStep[] = [
        { id: 'first', title: 'First question', render: () => <p>Question one.</p> },
        { id: 'second', title: 'Second question', render: () => <p>Question two.</p> },
      ];
      renderFlow(<LearningFlow storageKey="free-forward" steps={unanswerable} />);

      expect(screen.getByText(/Not answered yet/)).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));

      expect(screen.getByRole('heading', { name: 'Second question' })).toBeInTheDocument();
      expect(screen.getByText(/Not answered yet/)).toBeInTheDocument();
    });

    test('lets a student jump to a step they have never reached', () => {
      renderFlow(<LearningFlow storageKey="free-jump" steps={steps} />);
      const lastDot = screen.getByRole('button', { name: /^Try the rule/ });

      expect(lastDot).toBeEnabled();
      fireEvent.click(lastDot);
      expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    });

    test('lets a student go back and return without losing an answer', () => {
      renderFlow(<LearningFlow storageKey="free-back" steps={steps} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: /Back/ }));
      expect(screen.getByRole('heading', { name: 'Notice the pattern' })).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      expect(screen.getByText('The explanation stays visible.')).toBeInTheDocument();
    });

    test('restores the exact step the student left, answered or not', () => {
      const { unmount } = renderFlow(<LearningFlow storageKey="free-restore" steps={steps} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
      unmount();

      renderFlow(<LearningFlow storageKey="free-restore" steps={steps} />);
      expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    });
  });

  describe('finishing with unanswered steps', () => {
    test('allows Finish and names what was left blank', async () => {
      const onFinish = vi.fn();
      renderFlow(<LearningFlow storageKey="unanswered-flow" steps={steps} onFinish={onFinish} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

      await screen.findByTestId('learning-flow-summary');
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(screen.getByText(/You answered 1 of 2 steps/)).toBeInTheDocument();
      expect(screen.getByText(/You left 1 step unanswered/)).toBeInTheDocument();
      expect(screen.getByRole('listitem')).toHaveTextContent('Try the rule');
    });

    test('offers a way straight back to the first unanswered step', async () => {
      renderFlow(<LearningFlow storageKey="unanswered-return" steps={steps} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
      await screen.findByTestId('learning-flow-summary');

      fireEvent.click(screen.getByRole('button', { name: /Go to the first unanswered step/ }));
      expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
    });

    test('says nothing about blanks when every step was answered', async () => {
      renderFlow(<LearningFlow storageKey="all-answered" steps={steps} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

      await screen.findByTestId('learning-flow-summary');
      expect(screen.getByText(/All 2 steps are answered/)).toBeInTheDocument();
      expect(screen.queryByText(/unanswered/)).not.toBeInTheDocument();
    });

    test('brings the summary back after a reload even with blanks', async () => {
      const { unmount } = renderFlow(<LearningFlow storageKey="unanswered-reload" steps={steps} />);
      fireEvent.click(screen.getByRole('button', { name: /Continue/ }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
      await screen.findByTestId('learning-flow-summary');
      unmount();

      renderFlow(<LearningFlow storageKey="unanswered-reload" steps={steps} />);
      expect(await screen.findByTestId('learning-flow-summary')).toBeInTheDocument();
      expect(screen.getByText(/You left 1 step unanswered/)).toBeInTheDocument();
    });
  });

  describe('finishing a module', () => {
    test('shows and focuses a summary without leaving the module', async () => {
      renderFlow(<LearningFlow storageKey="finish-flow" steps={steps} moduleTitle="This module" />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

      const summary = await screen.findByTestId('learning-flow-summary');
      expect(summary).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'You finished This module.' })).toBeInTheDocument();
      await waitFor(() => expect(summary).toHaveFocus());
    });

    test('records completion exactly once even when Finish is clicked twice', async () => {
      const onFinish = vi.fn();
      renderFlow(<LearningFlow storageKey="idempotent-flow" steps={steps} onFinish={onFinish} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));

      const finishButton = screen.getByRole('button', { name: 'Finish' });
      fireEvent.click(finishButton);
      fireEvent.click(finishButton);

      await screen.findByTestId('learning-flow-summary');
      expect(onFinish).toHaveBeenCalledTimes(1);
      expect(savedFlowState('idempotent-flow').finished).toBe(true);
    });

    test('offers a way back to the overview and on to the next module', async () => {
      renderFlow(<LearningFlow storageKey="links-flow" steps={steps} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

      await screen.findByTestId('learning-flow-summary');
      expect(screen.getByRole('link', { name: /Back to course overview/ })).toHaveAttribute('href', '/');
      expect(screen.getByRole('link', { name: /Next module/ })).toHaveAttribute('href', '/modules/next-module');
    });

    test('shows the summary again after a reload on the last step', async () => {
      const { unmount } = renderFlow(<LearningFlow storageKey="reload-flow" steps={steps} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
      await screen.findByTestId('learning-flow-summary');
      unmount();

      renderFlow(<LearningFlow storageKey="reload-flow" steps={steps} />);
      expect(await screen.findByTestId('learning-flow-summary')).toBeInTheDocument();
    });

    test('lets the student reopen the steps from the summary', async () => {
      renderFlow(<LearningFlow storageKey="review-flow" steps={steps} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
      await screen.findByTestId('learning-flow-summary');

      fireEvent.click(screen.getByRole('button', { name: /Review the steps again/ }));
      expect(screen.queryByTestId('learning-flow-summary')).not.toBeInTheDocument();
      expect(screen.getByRole('heading', { name: 'Notice the pattern' })).toBeInTheDocument();
    });
  });

  describe('independent and assisted outcomes', () => {
    test('names the assisted steps in the summary and persists the outcome', async () => {
      const { unmount } = renderFlow(<LearningFlow storageKey="assisted-flow" steps={steps} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Use the solution' }));
      expect(screen.getByText(/Completed with help/)).toBeInTheDocument();

      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));
      await screen.findByTestId('learning-flow-summary');
      expect(screen.getByText(/You used the solution on 1 step/)).toBeInTheDocument();
      expect(screen.getByRole('listitem')).toHaveTextContent('Try the rule');

      const saved = savedFlowState('assisted-flow');
      expect(saved.version).toBe(2);
      expect(saved.stepOutcomes).toEqual({ notice: 'independent', try: 'assisted' });

      unmount();
      renderFlow(<LearningFlow storageKey="assisted-flow" steps={steps} />);
      expect(await screen.findByTestId('learning-flow-summary')).toBeInTheDocument();
      expect(screen.getByText(/You used the solution on 1 step/)).toBeInTheDocument();
    });

    test('says nothing about help when every step was independent', async () => {
      renderFlow(<LearningFlow storageKey="independent-flow" steps={steps} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));
      fireEvent.click(screen.getByRole('button', { name: 'Finish' }));

      await screen.findByTestId('learning-flow-summary');
      expect(screen.queryByText(/You used the solution on/)).not.toBeInTheDocument();
      expect(savedFlowState('independent-flow').stepOutcomes).toEqual({
        notice: 'independent',
        try: 'independent',
      });
    });

    test('keeps the first outcome when a step is completed twice', async () => {
      renderFlow(<LearningFlow storageKey="stable-outcome" steps={steps} />);
      await reachTheLastStep();
      fireEvent.click(screen.getByRole('button', { name: 'Use the solution' }));
      fireEvent.click(screen.getByRole('button', { name: 'Solve' }));

      await waitFor(() => expect(savedFlowState('stable-outcome').stepOutcomes.try).toBe('assisted'));
    });
  });

  describe('migrating saved progress', () => {
    test('reads a version 1 state as independent work', async () => {
      localStorage.setItem(
        courseStorageKey('learning-flow', 'legacy-flow'),
        JSON.stringify({ version: 1, currentStepId: 'try', completedStepIds: ['notice'] }),
      );

      renderFlow(<LearningFlow storageKey="legacy-flow" steps={steps} />);

      expect(screen.getByRole('heading', { name: 'Try the rule' })).toBeInTheDocument();
      await waitFor(() => {
        const saved = savedFlowState('legacy-flow');
        expect(saved.version).toBe(2);
        expect(saved.stepOutcomes).toEqual({ notice: 'independent' });
      });
    });

    test('does not show a summary for a version 1 state that never had one', async () => {
      localStorage.setItem(
        courseStorageKey('learning-flow', 'legacy-complete'),
        JSON.stringify({ version: 1, currentStepId: 'try', completedStepIds: ['notice', 'try'] }),
      );

      renderFlow(<LearningFlow storageKey="legacy-complete" steps={steps} />);

      expect(screen.queryByTestId('learning-flow-summary')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Finish' })).toBeEnabled();
    });
  });
});
