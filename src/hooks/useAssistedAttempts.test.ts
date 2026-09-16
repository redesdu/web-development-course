import { act, renderHook } from '@testing-library/react';
import { courseStorageKey } from '@/lib/courseStorage';
import { ATTEMPTS_BEFORE_SOLUTION, useAssistedAttempts } from './useAssistedAttempts';

function saved(key: string) {
  const raw = localStorage.getItem(courseStorageKey('assisted-attempts', key));
  return raw ? JSON.parse(raw) : null;
}

describe('useAssistedAttempts', () => {
  beforeEach(() => localStorage.clear());

  test('offers the solution after exactly three wrong answers', () => {
    expect(ATTEMPTS_BEFORE_SOLUTION).toBe(3);
    const { result } = renderHook(() => useAssistedAttempts('three-attempts'));

    expect(result.current.solutionAvailable).toBe(false);
    act(() => result.current.registerWrongAttempt());
    expect(result.current.solutionAvailable).toBe(false);
    act(() => result.current.registerWrongAttempt());
    expect(result.current.solutionAvailable).toBe(false);
    act(() => result.current.registerWrongAttempt());
    expect(result.current.solutionAvailable).toBe(true);
  });

  test('keeps the solution available after further attempts', () => {
    const { result } = renderHook(() => useAssistedAttempts('more-attempts'));
    act(() => {
      result.current.registerWrongAttempt();
      result.current.registerWrongAttempt();
      result.current.registerWrongAttempt();
      result.current.registerWrongAttempt();
    });
    expect(result.current.wrongAttempts).toBe(4);
    expect(result.current.solutionAvailable).toBe(true);
  });

  test('remembers attempts across a reload so progress is not lost', () => {
    const first = renderHook(() => useAssistedAttempts('persisted'));
    act(() => {
      first.result.current.registerWrongAttempt();
      first.result.current.registerWrongAttempt();
    });
    first.unmount();

    const second = renderHook(() => useAssistedAttempts('persisted'));
    expect(second.result.current.wrongAttempts).toBe(2);
    expect(second.result.current.solutionAvailable).toBe(false);
    act(() => second.result.current.registerWrongAttempt());
    expect(second.result.current.solutionAvailable).toBe(true);
  });

  test('remembers that the solution was revealed', () => {
    const first = renderHook(() => useAssistedAttempts('revealed'));
    act(() => {
      first.result.current.registerWrongAttempt();
      first.result.current.registerWrongAttempt();
      first.result.current.registerWrongAttempt();
    });
    act(() => first.result.current.revealSolution());
    expect(saved('revealed')).toMatchObject({ version: 1, wrongAttempts: 3, revealed: true });
    first.unmount();

    const second = renderHook(() => useAssistedAttempts('revealed'));
    expect(second.result.current.revealed).toBe(true);
  });

  test('reset clears the attempts and the stored entry', () => {
    const { result } = renderHook(() => useAssistedAttempts('resettable'));
    act(() => {
      result.current.registerWrongAttempt();
      result.current.registerWrongAttempt();
      result.current.registerWrongAttempt();
    });
    act(() => result.current.revealSolution());

    act(() => result.current.reset());
    expect(result.current.wrongAttempts).toBe(0);
    expect(result.current.revealed).toBe(false);
    expect(result.current.solutionAvailable).toBe(false);
    expect(saved('resettable')).toBeNull();
  });

  test('writes nothing until there is something to remember', () => {
    renderHook(() => useAssistedAttempts('untouched'));
    expect(saved('untouched')).toBeNull();
  });

  test('ignores a corrupted stored entry', () => {
    localStorage.setItem(courseStorageKey('assisted-attempts', 'broken'), '{"version":9,"wrongAttempts":"lots"}');
    const { result } = renderHook(() => useAssistedAttempts('broken'));
    expect(result.current.wrongAttempts).toBe(0);
    expect(result.current.revealed).toBe(false);
  });

  test('accepts a custom threshold', () => {
    const { result } = renderHook(() => useAssistedAttempts('custom', 1));
    act(() => result.current.registerWrongAttempt());
    expect(result.current.solutionAvailable).toBe(true);
  });
});
