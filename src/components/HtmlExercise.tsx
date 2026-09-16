import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { Check, Code2, RotateCcw, X } from 'lucide-react';
import { AssistedSolution } from '@/components/AssistedSolution';
import { CodeBlock } from '@/components/CodeBlock';
import { useAssistedAttempts } from '@/hooks/useAssistedAttempts';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';
import { allChecksPassed, runHtmlChecks, sanitizeForPreview, type CheckResult, type HtmlCheck } from '@/lib/htmlChecks';

interface HtmlExerciseProps {
  storageKey: string;
  title: string;
  brief: ReactNode;
  /** What the editor contains before the student types anything. */
  starter: string;
  checks: HtmlCheck[];
  /** A worked answer, shown only after repeated failed checks. */
  solution: string;
  solutionExplanation: ReactNode;
  hint?: ReactNode;
  /** True once this step has already been recorded as assisted. */
  assistedCompleted?: boolean;
  onCorrect: () => void;
  onAssisted?: () => void;
  /** A fragment exercise shows no preview, because it is not a whole document. */
  showPreview?: boolean;
  rows?: number;
}

interface ExerciseState {
  source: string;
  checked: boolean;
}

function parseExerciseState(value: unknown): ExerciseState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1 || typeof saved.source !== 'string' || typeof saved.checked !== 'boolean') return null;
  return { source: saved.source, checked: saved.checked };
}

/**
 * Write HTML, see it, and have it checked.
 *
 * The preview is an iframe with an empty `sandbox` attribute, so it has no
 * script execution, no same-origin access, no form submission, and no
 * navigation. The markup is additionally stripped and given a content policy
 * before it goes in, so the preview cannot run the student's code or make a
 * network request even if the sandbox attribute were ignored.
 */
export function HtmlExercise({
  storageKey,
  title,
  brief,
  starter,
  checks,
  solution,
  solutionExplanation,
  hint,
  assistedCompleted,
  onCorrect,
  onAssisted,
  showPreview = true,
  rows = 14,
}: HtmlExerciseProps) {
  const fieldId = useId();
  const persistenceKey = courseStorageKey('html-exercise', storageKey);
  const attempts = useAssistedAttempts(storageKey);

  const [state, setState] = useState<ExerciseState>(() =>
    readStorageJson(persistenceKey, parseExerciseState) ?? { source: starter, checked: false },
  );
  const [results, setResults] = useState<CheckResult[]>(() =>
    (readStorageJson(persistenceKey, parseExerciseState)?.checked ? runHtmlChecks(state.source, checks) : []),
  );

  const passed = allChecksPassed(results);
  const preview = useMemo(
    () => (showPreview ? sanitizeForPreview(state.source) : ''),
    [showPreview, state.source],
  );

  useEffect(() => {
    // An untouched exercise leaves nothing behind, so a reset really clears it
    // and a fresh visit is not restoring a stored copy of the starter.
    if (state.source === starter && !state.checked) {
      removeStorageValue(persistenceKey);
      return;
    }
    writeStorageJson(persistenceKey, { version: 1, ...state });
  }, [persistenceKey, starter, state]);

  useEffect(() => {
    if (state.checked && passed) onCorrect();
  }, [onCorrect, passed, state.checked]);

  const check = () => {
    const outcome = runHtmlChecks(state.source, checks);
    setResults(outcome);
    setState((current) => ({ ...current, checked: true }));
    if (!allChecksPassed(outcome)) attempts.registerWrongAttempt();
  };

  const reset = () => {
    removeStorageValue(persistenceKey);
    setState({ source: starter, checked: false });
    setResults([]);
    attempts.reset();
  };

  return (
    <section className="html-exercise" aria-labelledby={`${fieldId}-title`}>
      <p className="eyebrow"><Code2 size={16} aria-hidden="true" /> Write the markup</p>
      <h3 id={`${fieldId}-title`}>{title}</h3>
      <div className="html-exercise-brief">{brief}</div>

      <div className={`html-exercise-workspace ${showPreview ? 'has-preview' : ''}`}>
        <div className="html-exercise-editor">
          <label htmlFor={fieldId}>Your HTML</label>
          <textarea
            id={fieldId}
            rows={rows}
            spellCheck={false}
            value={state.source}
            wrap="off"
            onChange={(event) => setState({ source: event.target.value, checked: false })}
          />
        </div>

        {showPreview && (
          <div className="html-exercise-preview">
            <p className="html-exercise-preview-label" id={`${fieldId}-preview-label`}>Preview</p>
            <iframe
              title="Preview of your page"
              aria-describedby={`${fieldId}-preview-label`}
              className="html-exercise-frame"
              sandbox=""
              srcDoc={preview}
            />
            <p className="html-exercise-preview-note">
              This preview runs no JavaScript and loads nothing from the internet.
            </p>
          </div>
        )}
      </div>

      <div className="check-actions">
        <button type="button" className="button button-primary" onClick={check}>Check my HTML</button>
        <button type="button" className="button button-quiet" onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" /> Start this exercise again
        </button>
      </div>

      {state.checked && results.length > 0 && (
        <div className="html-exercise-results" role="status">
          <strong>
            {passed
              ? 'Every requirement is met.'
              : `${results.filter((result) => result.passed).length} of ${results.length} requirements met.`}
          </strong>
          <ul>
            {results.map((result) => (
              <li key={result.id} className={result.passed ? 'is-passed' : 'is-failed'}>
                {result.passed
                  ? <Check size={16} aria-hidden="true" />
                  : <X size={16} aria-hidden="true" />}
                <span>
                  <span className="visually-hidden">{result.passed ? 'Met: ' : 'Not met: '}</span>
                  {result.label}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {onAssisted && !passed && (
        <AssistedSolution
          available={attempts.solutionAvailable}
          revealed={attempts.revealed}
          onReveal={attempts.revealSolution}
          completed={assistedCompleted}
          onContinue={onAssisted}
          hint={hint}
          solution={<CodeBlock label="Worked solution">{solution}</CodeBlock>}
          explanation={solutionExplanation}
        />
      )}
    </section>
  );
}
