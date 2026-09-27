import type { AppState, Category, Word } from '../types.ts';

/** New (never-studied) words introduced per day. */
export const NEW_WORDS_PER_DAY = 10;
/** Most cards in one flashcard session. */
export const SESSION_SIZE = 20;

/** YYYY-MM-DD in the user's own timezone (toISOString would give UTC). */
export function localDateStr(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function dayBefore(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return localDateStr(new Date(y, m - 1, d - 1));
}

/** Streak after studying on `today`. */
export function nextStreak(streak: number, lastStudiedDate: string, today: string): number {
  if (lastStudiedDate === today) return streak;
  if (lastStudiedDate === dayBefore(today)) return streak + 1;
  return 1;
}

/** Streak to display: a streak is broken once a whole day passes without study. */
export function currentStreak(streak: number, lastStudiedDate: string, today: string): number {
  return lastStudiedDate === today || lastStudiedDate === dayBefore(today) ? streak : 0;
}

export function newWordsLeftToday(state: AppState, today: string): number {
  const usedToday = state.newWordsDate === today ? state.newWordsCount : 0;
  return Math.max(0, NEW_WORDS_PER_DAY - usedToday);
}

/** Studied words whose review time has arrived, most overdue first. */
export function dueReviews(words: Word[], state: AppState, now: number): Word[] {
  return words
    .filter((w) => {
      const p = state.wordProgress[w.id];
      return p && p.attempts > 0 && p.nextReview <= now;
    })
    .sort((a, b) => state.wordProgress[a.id].nextReview - state.wordProgress[b.id].nextReview);
}

/**
 * Up to `limit` never-studied words, taking one from each category in turn
 * so a list dominated by one category (GRE) doesn't crowd out the rest.
 */
export function pickNewWords(words: Word[], state: AppState, limit: number): Word[] {
  const byCategory = new Map<Category, Word[]>();
  for (const w of words) {
    const p = state.wordProgress[w.id];
    if (p && p.attempts > 0) continue;
    if (!byCategory.has(w.category)) byCategory.set(w.category, []);
    byCategory.get(w.category)!.push(w);
  }
  const lists = [...byCategory.values()];
  const picked: Word[] = [];
  for (let i = 0; picked.length < limit && lists.some((l) => i < l.length); i++) {
    for (const list of lists) {
      if (i < list.length && picked.length < limit) picked.push(list[i]);
    }
  }
  return picked;
}

/** Cards for one flashcard session: due reviews, then today's new words. */
export function buildStudyQueue(words: Word[], state: AppState, now: number, today: string): Word[] {
  const reviews = dueReviews(words, state, now).slice(0, SESSION_SIZE);
  const newLimit = Math.min(newWordsLeftToday(state, today), SESSION_SIZE - reviews.length);
  return [...reviews, ...pickNewWords(words, state, newLimit)];
}
