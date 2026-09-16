import { useCallback, useEffect, useState } from 'react';
import { courseStorageKey, readStorageJson, removeStorageValue, writeStorageJson } from '@/lib/courseStorage';

/**
 * A student who has answered incorrectly this many times can reveal the
 * solution and continue. The point is that nobody is stuck: the step is still
 * recorded, marked as assisted, with no grade and no penalty.
 */
export const ATTEMPTS_BEFORE_SOLUTION = 3;

interface AttemptState {
  wrongAttempts: number;
  revealed: boolean;
}

const emptyAttempts: AttemptState = { wrongAttempts: 0, revealed: false };

function persistenceKey(storageKey: string) {
  return courseStorageKey('assisted-attempts', storageKey);
}

function parseAttemptState(value: unknown): AttemptState | null {
  if (!value || typeof value !== 'object') return null;
  const saved = value as Record<string, unknown>;
  if (saved.version !== 1) return null;
  if (typeof saved.wrongAttempts !== 'number' || !Number.isFinite(saved.wrongAttempts)) return null;
  if (typeof saved.revealed !== 'boolean') return null;
  return {
    wrongAttempts: Math.max(0, Math.floor(saved.wrongAttempts)),
    revealed: saved.revealed,
  };
}

function loadAttempts(storageKey: string): AttemptState {
  return readStorageJson(persistenceKey(storageKey), parseAttemptState) ?? emptyAttempts;
}

/**
 * Track wrong answers for one automatically checked activity.
 *
 * The count survives a reload so a student who leaves after two wrong answers
 * does not lose the credit for them and start the three again from zero.
 */
export function useAssistedAttempts(storageKey: string, threshold: number = ATTEMPTS_BEFORE_SOLUTION) {
  const [state, setState] = useState<AttemptState>(() => loadAttempts(storageKey));

  useEffect(() => {
    setState(loadAttempts(storageKey));
  }, [storageKey]);

  useEffect(() => {
    if (state.wrongAttempts === 0 && !state.revealed) {
      removeStorageValue(persistenceKey(storageKey));
      return;
    }
    writeStorageJson(persistenceKey(storageKey), { version: 1, ...state });
  }, [state, storageKey]);

  const registerWrongAttempt = useCallback(() => {
    setState((current) => ({ ...current, wrongAttempts: current.wrongAttempts + 1 }));
  }, []);

  const revealSolution = useCallback(() => {
    setState((current) => (current.revealed ? current : { ...current, revealed: true }));
  }, []);

  const reset = useCallback(() => {
    setState(emptyAttempts);
    removeStorageValue(persistenceKey(storageKey));
  }, [storageKey]);

  return {
    wrongAttempts: state.wrongAttempts,
    revealed: state.revealed,
    /** True once the student has used up the independent attempts. */
    solutionAvailable: state.wrongAttempts >= threshold,
    registerWrongAttempt,
    revealSolution,
    reset,
  };
}
