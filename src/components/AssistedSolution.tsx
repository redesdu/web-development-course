import { useId, type ReactNode } from 'react';
import { ArrowRight, Key, Lightbulb } from 'lucide-react';

interface AssistedSolutionProps {
  /** True once the student has made enough attempts to unlock the solution. */
  available: boolean;
  revealed: boolean;
  onReveal: () => void;
  /** Records the step as completed with help and lets the student move on. */
  onContinue: () => void;
  /** What the correct answer is. */
  solution: ReactNode;
  /** Why it is the correct answer. Kept separate from the answer itself. */
  explanation: ReactNode;
  /** Optional nudge offered before the full solution. */
  hint?: ReactNode;
  continueLabel?: string;
  revealLabel?: string;
  /** True once this step has been recorded as assisted. */
  completed?: boolean;
}

/**
 * The way out of a stuck activity.
 *
 * Nothing here is graded. The student's own answer stays on screen above this
 * panel, the solution and the reasoning are shown as two separate parts so the
 * answer is not mistaken for the explanation, and continuing records the step
 * as assisted rather than failed.
 */
export function AssistedSolution({
  available,
  revealed,
  onReveal,
  onContinue,
  solution,
  explanation,
  hint,
  continueLabel = 'Continue',
  revealLabel = 'Show solution and continue',
  completed = false,
}: AssistedSolutionProps) {
  const titleId = useId();

  if (!available) return null;

  if (!revealed) {
    return (
      <div className="assisted-offer" role="status">
        <p>
          <Lightbulb size={17} aria-hidden="true" /> This one is taking a few tries. You can read the solution and keep
          going. The step still counts, and nothing here is graded.
        </p>
        {hint && <div className="assisted-hint"><strong>Hint</strong> {hint}</div>}
        <button type="button" className="button button-secondary" onClick={onReveal}>
          {revealLabel}
        </button>
      </div>
    );
  }

  return (
    <section className="assisted-solution" aria-labelledby={titleId}>
      <h4 id={titleId}><Key size={17} aria-hidden="true" /> Solution</h4>
      <div className="assisted-solution-answer">{solution}</div>

      <h4>Why this is the answer</h4>
      <div className="assisted-solution-explanation">{explanation}</div>

      {completed ? (
        <p className="assisted-solution-note" role="status">
          Your own answer is still above, unchanged. This step is recorded as completed with help. Use Continue below to
          move on.
        </p>
      ) : (
        <>
          <p className="assisted-solution-note">
            Your own answer is still above, unchanged. This step will be recorded as completed with help.
          </p>
          <button type="button" className="button button-primary" data-testid="assisted-continue" onClick={onContinue}>
            {continueLabel} <ArrowRight size={16} aria-hidden="true" />
          </button>
        </>
      )}
    </section>
  );
}
