import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleCheck, CircleDashed, LifeBuoy, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useModuleSequence } from '@/course/ModuleSequenceContext';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

/**
 * How a step was completed. `assisted` means the student used the offered
 * solution after repeated attempts. It counts towards progress and carries no
 * penalty; it is kept only so the student can see it in their own summary.
 */
export type StepOutcome = 'independent' | 'assisted';

export interface LearningFlowStepContext {
  /** Defaults to `independent`. Pass `assisted` when a solution was revealed. */
  completeStep: (outcome?: StepOutcome) => void;
  resetStep: () => void;
  isComplete: boolean;
  outcome: StepOutcome | null;
}

export interface LearningFlowStep {
  id: string;
  title: string;
  sectionLabel?: string;
  autoComplete?: boolean;
  render: (context: LearningFlowStepContext) => ReactNode;
}

interface LearningFlowProps {
  storageKey: string;
  steps: LearningFlowStep[];
  onFinish?: () => void;
  /** Shown at the top of the completion summary. */
  moduleTitle?: string;
}

interface FlowState {
  currentIndex: number;
  outcomes: Map<string, StepOutcome>;
  finished: boolean;
}

const emptyState = (): FlowState => ({ currentIndex: 0, outcomes: new Map(), finished: false });

function getPersistenceKey(storageKey: string) {
  return courseStorageKey('learning-flow', storageKey);
}

function isOutcome(value: unknown): value is StepOutcome {
  return value === 'independent' || value === 'assisted';
}

/**
 * Read saved progress.
 *
 * Version 2 stores an outcome per step. Version 1 knew only which steps were
 * complete, so its steps are read back as `independent`: that is what they were
 * at the time, since no assisted path existed yet. The key and namespace are
 * unchanged, so an upgrade never looks like lost progress.
 */
function loadFlowState(storageKey: string, steps: LearningFlowStep[]): FlowState {
  const stepIds = new Set(steps.map((step) => step.id));

  return readStorageJson(getPersistenceKey(storageKey), (value): FlowState | null => {
    if (!value || typeof value !== 'object') return null;
    const saved = value as Record<string, unknown>;
    if (saved.version !== 1 && saved.version !== 2) return null;
    if (typeof saved.currentStepId !== 'string' || !Array.isArray(saved.completedStepIds)) return null;

    const outcomes = new Map<string, StepOutcome>();
    for (const id of saved.completedStepIds) {
      if (typeof id === 'string' && stepIds.has(id)) outcomes.set(id, 'independent');
    }

    if (saved.version === 2 && saved.stepOutcomes && typeof saved.stepOutcomes === 'object') {
      for (const [id, outcome] of Object.entries(saved.stepOutcomes as Record<string, unknown>)) {
        if (stepIds.has(id) && isOutcome(outcome)) outcomes.set(id, outcome);
      }
    }

    // Students move freely, so the saved position is restored as it was rather
    // than pulled back to the first unanswered step.
    const requestedIndex = steps.findIndex((step) => step.id === saved.currentStepId);
    const currentIndex = requestedIndex < 0 ? 0 : requestedIndex;

    // The summary reappears where the student left it. Unanswered steps do not
    // prevent it, because finishing with some left blank is allowed.
    const onLastStep = currentIndex === steps.length - 1;
    const finished = saved.version === 2 && saved.finished === true && onLastStep;

    return { currentIndex, outcomes, finished };
  }) ?? emptyState();
}

export function LearningFlow({ storageKey, steps, onFinish, moduleTitle }: LearningFlowProps) {
  const stepSignature = steps.map((step) => step.id).join('');
  const [state, setState] = useState<FlowState>(() => loadFlowState(storageKey, steps));
  const loadedFlowKey = useRef(`${storageKey}${stepSignature}`);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const summaryRef = useRef<HTMLDivElement>(null);
  const initialRender = useRef(true);
  const { previous: _previous, next } = useModuleSequence();

  const current = steps[state.currentIndex];
  const currentOutcome = current ? state.outcomes.get(current.id) ?? null : null;
  const currentComplete = currentOutcome !== null;

  const assistedSteps = useMemo(
    () => steps.filter((step) => state.outcomes.get(step.id) === 'assisted'),
    [state.outcomes, steps],
  );

  const unansweredSteps = useMemo(
    () => steps.filter((step) => !state.outcomes.has(step.id)),
    [state.outcomes, steps],
  );

  useEffect(() => {
    const flowKey = `${storageKey}${stepSignature}`;
    if (loadedFlowKey.current === flowKey) return;
    loadedFlowKey.current = flowKey;
    setState(loadFlowState(storageKey, steps));
    initialRender.current = true;
  }, [stepSignature, storageKey]);

  useEffect(() => {
    if (!current) return;
    const persistenceKey = getPersistenceKey(storageKey);
    if (state.currentIndex === 0 && state.outcomes.size === 0 && !state.finished) {
      removeStorageValue(persistenceKey);
      return;
    }
    writeStorageJson(persistenceKey, {
      version: 2,
      currentStepId: current.id,
      // Kept alongside the outcome map so the shape stays readable and the
      // main keys do not change between schema versions.
      completedStepIds: [...state.outcomes.keys()],
      stepOutcomes: Object.fromEntries(state.outcomes),
      finished: state.finished,
    });
  }, [current, state.outcomes, state.finished, state.currentIndex, storageKey]);

  useEffect(() => {
    if (initialRender.current) {
      initialRender.current = false;
      return;
    }
    if (state.finished) return;
    titleRef.current?.focus();
  }, [state.currentIndex, state.finished]);

  // Move the student to the summary rather than leaving them on a step that
  // looks unchanged. This runs on reload too, so returning lands in the summary.
  useEffect(() => {
    if (!state.finished) return;
    const node = summaryRef.current;
    if (!node) return;
    node.focus();
    node.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }, [state.finished]);

  const completeStep = useCallback((outcome?: StepOutcome) => {
    if (!current) return;
    // Callers sometimes wire this straight to an event handler, which would
    // otherwise pass a DOM event in as the outcome. Anything that is not a
    // known outcome means the step was completed independently.
    const resolved: StepOutcome = isOutcome(outcome) ? outcome : 'independent';
    setState((previous) => {
      // Completing twice must not change a recorded outcome.
      if (previous.outcomes.has(current.id)) return previous;
      const outcomes = new Map(previous.outcomes);
      outcomes.set(current.id, resolved);
      return { ...previous, outcomes };
    });
  }, [current]);

  const resetStep = useCallback(() => {
    if (!current) return;
    setState((previous) => {
      if (!previous.outcomes.has(current.id)) return previous;
      const outcomes = new Map(previous.outcomes);
      outcomes.delete(current.id);
      return { ...previous, outcomes, finished: false };
    });
  }, [current]);

  if (!current) {
    return <p className="learning-flow-empty">This learning flow has no steps yet.</p>;
  }

  const isFirst = state.currentIndex === 0;
  const isLast = state.currentIndex === steps.length - 1;

  /**
   * Finish is idempotent. A second click cannot report completion twice or
   * move the flow into a different state, because the first click already set
   * `finished` and this returns early on it.
   */
  const finish = () => {
    if (state.finished) return;
    setState((previous) => {
      if (previous.finished) return previous;
      const outcomes = new Map(previous.outcomes);
      if (current.autoComplete && !outcomes.has(current.id)) outcomes.set(current.id, 'independent');
      return { ...previous, outcomes, finished: true };
    });
    onFinish?.();
  };

  return (
    <section className="learning-flow" aria-labelledby={`${storageKey}-step-title`}>
      <div className="learning-flow-progress" aria-label="Lesson progress">
        {steps.map((step, index) => {
          const outcome = state.outcomes.get(step.id) ?? null;
          const done = outcome !== null;
          const active = index === state.currentIndex && !state.finished;
          return (
            <button
              type="button"
              key={step.id}
              aria-current={active ? 'step' : undefined}
              aria-label={`${step.title}${active ? ', current step' : ''}${done ? ', answered' : ', not answered yet'}${outcome === 'assisted' ? ', with help' : ''}`}
              className={`learning-flow-dot ${active ? 'is-active' : ''} ${done ? 'is-complete' : ''} ${outcome === 'assisted' ? 'is-assisted' : ''}`}
              onClick={() => setState((previous) => ({ ...previous, currentIndex: index, finished: false }))}
            >
              {done ? <Check size={13} strokeWidth={3} /> : index + 1}
            </button>
          );
        })}
      </div>

      {state.finished ? (
        <div
          className="learning-flow-summary"
          ref={summaryRef}
          tabIndex={-1}
          role="region"
          aria-labelledby={`${storageKey}-summary-title`}
          data-testid="learning-flow-summary"
        >
          <p className="eyebrow"><CircleCheck size={16} aria-hidden="true" /> Completed</p>
          <h2 id={`${storageKey}-summary-title`}>
            {moduleTitle ? `You finished ${moduleTitle}.` : 'You finished this module.'}
          </h2>
          <p>
            {unansweredSteps.length === 0
              ? `All ${steps.length} step${steps.length === 1 ? '' : 's'} are answered.`
              : `You answered ${steps.length - unansweredSteps.length} of ${steps.length} step${steps.length === 1 ? '' : 's'}.`}
            {' '}This module now counts as complete on the course overview.
          </p>

          {assistedSteps.length > 0 && (
            <div className="learning-flow-summary-assisted">
              <p>
                <LifeBuoy size={16} aria-hidden="true" /> You used the solution on{' '}
                {assistedSteps.length} step{assistedSteps.length === 1 ? '' : 's'}. That is recorded here only so you know
                what to revisit. It is not graded and does not reduce your progress.
              </p>
              <ul>
                {assistedSteps.map((step) => <li key={step.id}>{step.title}</li>)}
              </ul>
            </div>
          )}

          {unansweredSteps.length > 0 && (
            <div className="learning-flow-summary-unanswered">
              <p>
                <CircleDashed size={16} aria-hidden="true" /> You left{' '}
                {unansweredSteps.length} step{unansweredSteps.length === 1 ? '' : 's'} unanswered. That is recorded here
                so you know where to pick up. Nothing is marked wrong, and your progress is not reduced.
              </p>
              <ul>
                {unansweredSteps.map((step) => <li key={step.id}>{step.title}</li>)}
              </ul>
            </div>
          )}

          <div className="learning-flow-summary-actions">
            <Link className="button button-quiet" to="/">
              <ArrowLeft size={16} aria-hidden="true" /> Back to course overview
            </Link>
            {next && (
              <Link className="button button-primary" to={`/modules/${next.slug}`}>
                Next module <ArrowRight size={16} aria-hidden="true" />
              </Link>
            )}
          </div>

          <button
            type="button"
            className="button button-quiet learning-flow-summary-review"
            onClick={() => setState((previous) => {
              const firstUnanswered = steps.findIndex((step) => !previous.outcomes.has(step.id));
              return { ...previous, finished: false, currentIndex: firstUnanswered === -1 ? 0 : firstUnanswered };
            })}
          >
            <RotateCcw size={15} aria-hidden="true" />
            {unansweredSteps.length > 0 ? ' Go to the first unanswered step' : ' Review the steps again'}
          </button>
        </div>
      ) : (
        <>
          <div className="learning-flow-counter">
            <span>{current.sectionLabel ?? 'Learning step'}</span>
            <span>{state.currentIndex + 1} / {steps.length}</span>
          </div>

          <div className="learning-flow-card">
            <h2 id={`${storageKey}-step-title`} ref={titleRef} tabIndex={-1}>{current.title}</h2>
            {current.render({ completeStep, resetStep, isComplete: currentComplete, outcome: currentOutcome })}
            {currentOutcome === 'assisted' && (
              <p className="learning-flow-assisted-note" role="status">
                <LifeBuoy size={15} aria-hidden="true" /> Completed with help. Nothing is deducted.
              </p>
            )}
          </div>

          <div className="learning-flow-navigation">
            <button
              type="button"
              className="button button-quiet"
              disabled={isFirst}
              onClick={() => setState((previous) => ({ ...previous, currentIndex: Math.max(0, previous.currentIndex - 1) }))}
            >
              <ArrowLeft size={16} /> Back
            </button>
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                if (isLast) {
                  finish();
                  return;
                }
                setState((previous) => {
                  const outcomes = new Map(previous.outcomes);
                  if (current.autoComplete && !outcomes.has(current.id)) outcomes.set(current.id, 'independent');
                  return {
                    ...previous,
                    outcomes,
                    currentIndex: Math.min(steps.length - 1, previous.currentIndex + 1),
                  };
                });
              }}
            >
              {isLast ? 'Finish' : 'Continue'} {!isLast && <ArrowRight size={16} />}
            </button>
          </div>
          {!currentComplete && !current.autoComplete && (
            <p className="learning-flow-hint">
              Not answered yet. You can answer it now, or move on and come back later.
            </p>
          )}
        </>
      )}
    </section>
  );
}
