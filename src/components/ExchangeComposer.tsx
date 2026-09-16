import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { RotateCcw } from 'lucide-react';
import { AssistedSolution } from '@/components/AssistedSolution';
import { useAssistedAttempts } from '@/hooks/useAssistedAttempts';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

export interface ComposerChoice {
  id: string;
  label: string;
}

export interface ComposerField {
  /** Stable key used in storage and in the correct answer. */
  name: string;
  label: string;
  choices: ComposerChoice[];
  correctId: string;
  /** Shown when this field is right. */
  whenCorrect: string;
  /** Shown when this field is wrong. Explain the rule, not just the answer. */
  whenIncorrect: string;
}

interface ExchangeComposerProps {
  storageKey: string;
  title: string;
  scenario: ReactNode;
  fields: ComposerField[];
  /** Renders the assembled message from the current selections. */
  preview: (selected: Record<string, string | null>) => ReactNode;
  onCorrect: () => void;
  onAssisted?: () => void;
  hint?: ReactNode;
  /** True once this step has already been recorded as assisted. */
  assistedCompleted?: boolean;
}

type Selections = Record<string, string | null>;

function parseSelections(value: unknown, fields: ComposerField[]): { selected: Selections; submitted: boolean } | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1 || typeof saved.submitted !== 'boolean') return null;
  if (!saved.selected || typeof saved.selected !== 'object') return null;

  const raw = saved.selected as Record<string, unknown>;
  const selected: Selections = {};
  for (const field of fields) {
    const value = raw[field.name];
    const known = field.choices.some((choice) => choice.id === value);
    selected[field.name] = typeof value === 'string' && known ? value : null;
  }
  return { selected, submitted: saved.submitted };
}

/**
 * Build one HTTP exchange from a stated intent.
 *
 * Every field is diagnosed on its own, so a student who gets the method right
 * and the target wrong is told which decision changed the meaning, rather than
 * simply that the whole thing is wrong.
 */
export function ExchangeComposer({
  storageKey,
  title,
  scenario,
  fields,
  preview,
  onCorrect,
  onAssisted,
  hint,
  assistedCompleted,
}: ExchangeComposerProps) {
  const titleId = useId();
  const persistenceKey = courseStorageKey('exchange-composer', storageKey);
  const attempts = useAssistedAttempts(storageKey);
  const emptySelections = useMemo(
    () => Object.fromEntries(fields.map((field) => [field.name, null])) as Selections,
    [fields],
  );

  const [state, setState] = useState(() =>
    readStorageJson(persistenceKey, (value) => parseSelections(value, fields))
      ?? { selected: emptySelections, submitted: false },
  );

  const allSelected = fields.every((field) => state.selected[field.name]);
  const isCorrect = fields.every((field) => state.selected[field.name] === field.correctId);

  useEffect(() => {
    writeStorageJson(persistenceKey, { version: 1, ...state });
  }, [persistenceKey, state]);

  useEffect(() => {
    if (state.submitted && isCorrect) onCorrect();
  }, [isCorrect, onCorrect, state.submitted]);

  const reset = () => {
    removeStorageValue(persistenceKey);
    setState({ selected: emptySelections, submitted: false });
    attempts.reset();
  };

  const answeredCorrectly = state.submitted && isCorrect;

  return (
    <section className="visual-lab http-builder" aria-labelledby={titleId}>
      <div className="visual-lab-heading">
        <div>
          <p className="eyebrow">Construct the exchange</p>
          <h3 id={titleId}>{title}</h3>
        </div>
        <div className="visual-prompt">{scenario}</div>
      </div>

      <div className="http-builder-grid">
        {fields.map((field) => (
          <label key={field.name}>
            <span>{field.label}</span>
            <select
              value={state.selected[field.name] ?? ''}
              onChange={(event) => setState((current) => ({
                selected: { ...current.selected, [field.name]: event.target.value || null },
                submitted: false,
              }))}
            >
              <option value="">Choose one</option>
              {field.choices.map((choice) => (
                <option key={choice.id} value={choice.id}>{choice.label}</option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="http-builder-preview" aria-label="Assembled HTTP exchange">
        {preview(state.selected)}
      </div>

      <div className="http-builder-actions">
        <button
          type="button"
          className="button button-primary"
          disabled={!allSelected || state.submitted}
          onClick={() => {
            const correctNow = fields.every((field) => state.selected[field.name] === field.correctId);
            if (!correctNow) attempts.registerWrongAttempt();
            setState((current) => ({ ...current, submitted: true }));
          }}
        >
          Send this exchange
        </button>
        {state.submitted && (
          <button
            type="button"
            className="button button-quiet"
            onClick={() => setState((current) => ({ ...current, submitted: false }))}
          >
            Revise exchange
          </button>
        )}
        <button type="button" className="button button-quiet" onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" /> Reset
        </button>
      </div>

      {!allSelected && <p className="http-builder-hint">Choose an answer in every menu to enable Send this exchange.</p>}

      {state.submitted && (
        <div className={`http-diagnostic ${isCorrect ? 'is-correct' : 'is-incorrect'}`} role="status">
          <strong>{isCorrect ? 'This exchange matches the intent.' : 'One or more fields change the meaning.'}</strong>
          <ul>
            {fields.map((field) => {
              const right = state.selected[field.name] === field.correctId;
              return (
                <li key={field.name} data-result={right ? 'correct' : 'incorrect'}>
                  {right ? field.whenCorrect : field.whenIncorrect}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {onAssisted && !answeredCorrectly && (
        <AssistedSolution
          available={attempts.solutionAvailable}
          revealed={attempts.revealed}
          onReveal={attempts.revealSolution}
          completed={assistedCompleted}
          onContinue={onAssisted}
          hint={hint}
          solution={(
            <ul className="assisted-fields">
              {fields.map((field) => {
                const answer = field.choices.find((choice) => choice.id === field.correctId);
                return <li key={field.name}><strong>{field.label}:</strong> {answer?.label}</li>;
              })}
            </ul>
          )}
          explanation={(
            <ul>
              {fields.map((field) => <li key={field.name}>{field.whenCorrect}</li>)}
            </ul>
          )}
        />
      )}
    </section>
  );
}
