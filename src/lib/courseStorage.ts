import { COURSE } from '@/course/course.config';

const memoryFallback = new Map<string, string>();
const DEFAULT_RESET_GENERATION = '0';
let acceptedResetGeneration: string | null = null;

function courseStoragePrefixes() {
  const namespaces = [COURSE.storageNamespace, ...(COURSE.legacyStorageNamespaces ?? [])];
  return [...new Set(namespaces)].map((namespace) => `interactive-learning:${namespace}:`);
}

function resetGenerationKey() {
  return `interactive-learning-reset:${COURSE.storageNamespace}`;
}

function currentResetGeneration() {
  if (typeof window === 'undefined') return DEFAULT_RESET_GENERATION;

  try {
    return window.localStorage.getItem(resetGenerationKey()) ?? DEFAULT_RESET_GENERATION;
  } catch {
    return DEFAULT_RESET_GENERATION;
  }
}

function loadedResetGeneration() {
  acceptedResetGeneration ??= currentResetGeneration();
  return acceptedResetGeneration;
}

function isCourseStorageKey(key: string) {
  return courseStoragePrefixes().some((prefix) => key.startsWith(prefix));
}

function hasCurrentResetGeneration() {
  return loadedResetGeneration() === currentResetGeneration();
}

export function courseStorageKey(scope: string, id: string) {
  return `interactive-learning:${COURSE.storageNamespace}:v1:${scope}:${id}`;
}

export function readStorageValue(key: string) {
  if (typeof window === 'undefined') return memoryFallback.get(key) ?? null;
  if (isCourseStorageKey(key) && !hasCurrentResetGeneration()) return null;

  try {
    return window.localStorage.getItem(key) ?? memoryFallback.get(key) ?? null;
  } catch {
    return memoryFallback.get(key) ?? null;
  }
}

export function writeStorageValue(key: string, value: string) {
  if (typeof window === 'undefined') {
    memoryFallback.set(key, value);
    return false;
  }

  if (isCourseStorageKey(key) && !hasCurrentResetGeneration()) {
    memoryFallback.delete(key);
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    memoryFallback.delete(key);
    return true;
  } catch {
    memoryFallback.set(key, value);
    return false;
  }
}

export function removeStorageValue(key: string) {
  memoryFallback.delete(key);
  if (typeof window === 'undefined') return;

  try {
    window.localStorage.removeItem(key);
  } catch {
    // The in-memory state is already clear. Storage failures must not break learning.
  }
}

export function readStorageJson<T>(key: string, parse: (value: unknown) => T | null) {
  const raw = readStorageValue(key);
  if (raw === null) return null;

  try {
    return parse(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function writeStorageJson(key: string, value: unknown) {
  return writeStorageValue(key, JSON.stringify(value));
}

export function clearCourseStorage() {
  const prefixes = courseStoragePrefixes();
  let removed = 0;

  for (const key of [...memoryFallback.keys()]) {
    if (!prefixes.some((prefix) => key.startsWith(prefix))) continue;
    memoryFallback.delete(key);
    removed += 1;
  }

  if (typeof window === 'undefined') return removed;

  try {
    for (let index = window.localStorage.length - 1; index >= 0; index -= 1) {
      const key = window.localStorage.key(index);
      if (!key || !prefixes.some((prefix) => key.startsWith(prefix))) continue;
      window.localStorage.removeItem(key);
      removed += 1;
    }
  } catch {
    // Clearing the in-memory fallback still leaves the application usable.
  }

  return removed;
}

export function beginCourseStorageReset() {
  // Capture this page's generation before advancing it. Until the full reload,
  // stale component effects from this page (or another open tab) cannot write.
  loadedResetGeneration();
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(resetGenerationKey(), `${Date.now()}-${Math.random()}`);
    } catch {
      // The normal clear still works when browser storage is unavailable.
    }
  }
  return clearCourseStorage();
}

export function finishCourseStorageReset() {
  return clearCourseStorage();
}
