import { useEffect, useId, useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, CheckCircle2, ListOrdered, RotateCcw, XCircle } from 'lucide-react';
import { AssistedSolution } from '@/components/AssistedSolution';
import { useAssistedAttempts } from '@/hooks/useAssistedAttempts';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

export interface SequenceItem {
  id: string;
  label: string;
  /** Why this step sits where it does. Shown with the solution. */
  note: string;
}

interface SequenceOrderProps {
  storageKey: string;
  prompt: string;
  scenario: ReactNode;
  /** The items in their correct order. They are shuffled deterministically for display. */
  items: SequenceItem[];
  onCorrect: () => void;
  onAssisted?: () => void;
  hint?: ReactNode;
  /** True once this step has already been recorded as assisted. */
  assistedCompleted?: boolean;
}

interface SequenceState {
  order: string[];
  submitted: boolean;
}

/**
 * A fixed starting arrangement.
 *
 * A random shuffle would give two students different activities and would
 * change under them on reload, so the starting order is derived from the item
 * ids instead: stable, and reliably not the correct answer.
 */
function startingOrder(items: SequenceItem[]) {
  const correct = items.map((item) => item.id);
  if (correct.length < 2) return correct;
  // Interleave the odd and even positions. For two or more items this can
  // never reproduce the correct order, and it scrambles more than a rotation.
  return [
    ...correct.filter((_, index) => index % 2 === 1),
    ...correct.filter((_, index) => index % 2 === 0),
  ];
}

function parseSequenceState(value: unknown, validIds: Set<string>): SequenceState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1 || !Array.isArray(saved.order) || typeof saved.submitted !== 'boolean') return null;
  const order = saved.order.filter((id): id is string => typeof id === 'string' && validIds.has(id));
  if (order.length !== validIds.size || new Set(order).size !== validIds.size) return null;
  return { order, submitted: saved.submitted };
}

export function SequenceOrder({
  storageKey,
  prompt,
  scenario,
  items,
  onCorrect,
  onAssisted,
  hint,
  assistedCompleted,
}: SequenceOrderProps) {
  const titleId = useId();
  const persistenceKey = courseStorageKey('sequence-order', storageKey);
  const correctOrder = useMemo(() => items.map((item) => item.id), [items]);
  const validIds = useMemo(() => new Set(correctOrder), [correctOrder]);
  const byId = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const attempts = useAssistedAttempts(storageKey);

  const [state, setState] = useState<SequenceState>(() =>
    readStorageJson(persistenceKey, (value) => parseSequenceState(value, validIds))
      ?? { order: startingOrder(items), submitted: false },
  );

  const isCorrect = state.order.join('') === correctOrder.join('');

  useEffect(() => {
    writeStorageJson(persistenceKey, { version: 1, ...state });
  }, [persistenceKey, state]);

  useEffect(() => {
    if (state.submitted && isCorrect) onCorrect();
  }, [isCorrect, onCorrect, state.submitted]);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= state.order.length) return;
    setState((current) => {
      const order = [...current.order];
      [order[index], order[target]] = [order[target], order[index]];
      return { order, submitted: false };
    });
  };

  const reset = () => {
    removeStorageValue(persistenceKey);
    setState({ order: startingOrder(items), submitted: false });
    attempts.reset();
  };

  const answeredCorrectly = state.submitted && isCorrect;

  return (
    <section className="sequence-order" aria-labelledby={titleId}>
      <p className="eyebrow"><ListOrdered size={16} aria-hidden="true" /> Put the exchange in order</p>
      <h3 id={titleId}>{prompt}</h3>
      <div className="sequence-scenario">{scenario}</div>

      <ol className="sequence-list" aria-label="Your current order">
        {state.order.map((id, index) => {
          const item = byId.get(id);
          if (!item) return null;
          const inPlace = state.submitted && correctOrder[index] === id;
          const outOfPlace = state.submitted && correctOrder[index] !== id;
          return (
            <li key={id} className={`sequence-item ${inPlace ? 'is-correct' : ''} ${outOfPlace ? 'is-incorrect' : ''}`}>
              <span className="sequence-position" aria-hidden="true">{index + 1}</span>
              <span className="sequence-label">{item.label}</span>
              <span className="sequence-controls">
                <button
                  type="button"
                  className="sequence-move"
                  disabled={index === 0}
                  aria-label={`Move "${item.label}" earlier`}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className="sequence-move"
                  disabled={index === state.order.length - 1}
                  aria-label={`Move "${item.label}" later`}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown size={15} aria-hidden="true" />
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      <div className="check-actions">
        <button
          type="button"
          className="button button-primary"
          onClick={() => {
            const correctNow = state.order.join('') === correctOrder.join('');
            if (!correctNow) attempts.registerWrongAttempt();
            setState((current) => ({ ...current, submitted: true }));
          }}
        >
          Check this order
        </button>
        <button type="button" className="button button-quiet" onClick={reset}>
          <RotateCcw size={15} aria-hidden="true" /> Start this order again
        </button>
      </div>

      {state.submitted && (
        <div className={`feedback ${isCorrect ? 'feedback-correct' : 'feedback-incorrect'}`} role="status">
          {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <div>
            <strong>{isCorrect ? 'That is the order.' : 'Some steps are not in position yet.'}</strong>
            <p>
              {isCorrect
                ? 'Each step now depends only on the one before it.'
                : 'Steps in the correct position are marked. Ask yourself which event has to have happened already for the next one to be possible.'}
            </p>
          </div>
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
            <ol className="assisted-sequence">
              {items.map((item) => <li key={item.id}>{item.label}</li>)}
            </ol>
          )}
          explanation={(
            <ul>
              {items.map((item) => <li key={item.id}><strong>{item.label}.</strong> {item.note}</li>)}
            </ul>
          )}
        />
      )}
    </section>
  );
}
