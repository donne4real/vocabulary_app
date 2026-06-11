import type { WordProgress } from '../types';

const ONE_DAY_MS = 86_400_000;

export function initProgress(wordId: string): WordProgress {
  return {
    wordId,
    ef: 2.5,
    interval: 1,
    repetitions: 0,
    nextReview: Date.now(),
    lastReview: 0,
    correct: 0,
    attempts: 0,
  };
}

/** quality: 1 = Again, 3 = Hard, 4 = Good, 5 = Easy */
export function reviewWord(progress: WordProgress, quality: 1 | 3 | 4 | 5): WordProgress {
  const now = Date.now();
  let { ef, interval, repetitions } = progress;

  if (quality >= 3) {
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * ef);
    }
    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (ef < 1.3) ef = 1.3;
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
  }

  return {
    ...progress,
    ef,
    interval,
    repetitions,
    lastReview: now,
    nextReview: now + interval * ONE_DAY_MS,
    correct: progress.correct + (quality >= 3 ? 1 : 0),
    attempts: progress.attempts + 1,
  };
}

export function isDue(progress: WordProgress): boolean {
  return Date.now() >= progress.nextReview;
}

export function masteryLevel(progress: WordProgress): 'new' | 'learning' | 'reviewing' | 'mastered' {
  if (progress.attempts === 0) return 'new';
  if (progress.repetitions === 0) return 'learning';
  if (progress.repetitions < 5) return 'reviewing';
  return 'mastered';
}
