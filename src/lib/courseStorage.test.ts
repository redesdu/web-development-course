import { beforeEach, describe, expect, test } from 'vitest';
import {
  beginCourseStorageReset,
  clearCourseStorage,
  courseStorageKey,
  finishCourseStorageReset,
  writeStorageJson,
} from './courseStorage';

describe('clearCourseStorage', () => {
  beforeEach(() => localStorage.clear());

  test('removes current and declared legacy course answers and progress', () => {
    const progressKey = courseStorageKey('course', 'progress');
    const answerKey = courseStorageKey('http-transfer', 'saved-restaurant-delete');
    const legacyFlowKey = 'interactive-learning:course-101:v1:learning-flow:http-intent-evidence-crud';
    localStorage.setItem(progressKey, '["http-intent-evidence-crud"]');
    localStorage.setItem(answerKey, '{"version":1,"text":"answer"}');
    localStorage.setItem(legacyFlowKey, '{"version":1,"currentStepId":"build-exchange"}');
    localStorage.setItem('sdu-learning-theme', 'dark');
    localStorage.setItem('unrelated-site-data', 'keep');

    expect(clearCourseStorage()).toBe(3);
    expect(localStorage.getItem(progressKey)).toBeNull();
    expect(localStorage.getItem(answerKey)).toBeNull();
    expect(localStorage.getItem(legacyFlowKey)).toBeNull();
    expect(localStorage.getItem('sdu-learning-theme')).toBe('dark');
    expect(localStorage.getItem('unrelated-site-data')).toBe('keep');
  });

  test('clears course state written during reset navigation before the app starts again', () => {
    const flowKey = courseStorageKey('learning-flow', 'http-intent-evidence-crud');
    localStorage.setItem(flowKey, '{"version":1,"currentStepId":"build-exchange","completedStepIds":["trace-mechanism","read-messages"]}');

    beginCourseStorageReset();
    expect(writeStorageJson(flowKey, {
      version: 1,
      currentStepId: 'build-exchange',
      completedStepIds: ['trace-mechanism', 'read-messages'],
    })).toBe(false);
    localStorage.setItem(flowKey, '{"version":1,"currentStepId":"build-exchange","completedStepIds":["trace-mechanism","read-messages"]}');

    expect(finishCourseStorageReset()).toBe(1);
    expect(localStorage.getItem(flowKey)).toBeNull();
    expect(finishCourseStorageReset()).toBe(0);
  });
});
