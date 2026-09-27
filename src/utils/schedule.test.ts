import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AppState, Category, Word, WordProgress } from '../types.ts';
import {
  NEW_WORDS_PER_DAY,
  SESSION_SIZE,
  buildStudyQueue,
  currentStreak,
  localDateStr,
  newWordsLeftToday,
  nextStreak,
} from './schedule.ts';

const word = (id: string, category: Category = 'gre'): Word => ({
  id, word: id, pronunciation: '', partOfSpeech: 'noun', definition: `def of ${id}`,
  example: '', synonyms: [], antonyms: [], category, difficulty: 3,
});

const reviewed = (wordId: string, nextReview: number): WordProgress => ({
  wordId, ef: 2.5, interval: 1, repetitions: 1, nextReview, lastReview: 0, correct: 1, attempts: 1,
});

const baseState = (overrides: Partial<AppState> = {}): AppState => ({
  wordProgress: {}, streak: 0, lastStudiedDate: '', quizBest: 0, totalStudied: 0,
  newWordsDate: '', newWordsCount: 0, ...overrides,
});

const NOW = new Date(2026, 8, 26, 21, 30).getTime(); // 9:30pm local, 26 Sep 2026
const TODAY = '2026-09-26';

test('localDateStr uses the local calendar date, not UTC', () => {
  assert.equal(localDateStr(new Date(2026, 8, 26, 23, 59)), '2026-09-26');
  assert.equal(localDateStr(new Date(2026, 0, 1, 0, 1)), '2026-01-01');
});

test('nextStreak: same day keeps it, yesterday extends it, a gap restarts it', () => {
  assert.equal(nextStreak(4, '2026-09-26', TODAY), 4);
  assert.equal(nextStreak(4, '2026-09-25', TODAY), 5);
  assert.equal(nextStreak(4, '2026-09-20', TODAY), 1);
  assert.equal(nextStreak(0, '', TODAY), 1);
  assert.equal(nextStreak(2, '2026-02-28', '2026-03-01'), 3);
});

test('currentStreak shows 0 once a day has been missed', () => {
  assert.equal(currentStreak(4, '2026-09-26', TODAY), 4);
  assert.equal(currentStreak(4, '2026-09-25', TODAY), 4);
  assert.equal(currentStreak(4, '2026-09-23', TODAY), 0);
});

test('newWordsLeftToday resets on a new day', () => {
  assert.equal(newWordsLeftToday(baseState({ newWordsDate: TODAY, newWordsCount: 4 }), TODAY), NEW_WORDS_PER_DAY - 4);
  assert.equal(newWordsLeftToday(baseState({ newWordsDate: '2026-09-25', newWordsCount: 10 }), TODAY), NEW_WORDS_PER_DAY);
});

test('queue is empty when nothing is due and today\'s new words are used up', () => {
  const words = [word('a'), word('b')];
  const state = baseState({
    wordProgress: { a: reviewed('a', NOW + 1000) },
    newWordsDate: TODAY, newWordsCount: NEW_WORDS_PER_DAY,
  });
  assert.deepEqual(buildStudyQueue(words, state, NOW, TODAY), []);
});

test('due reviews come first, most overdue first, then new words', () => {
  const words = [word('new1'), word('late'), word('later'), word('notDue')];
  const state = baseState({
    wordProgress: {
      late: reviewed('late', NOW - 1000),
      later: reviewed('later', NOW - 5000),
      notDue: reviewed('notDue', NOW + 1000),
    },
  });
  assert.deepEqual(buildStudyQueue(words, state, NOW, TODAY).map((w) => w.id), ['later', 'late', 'new1']);
});

test('new words are capped per day and mixed across categories', () => {
  const words = [
    ...Array.from({ length: 30 }, (_, i) => word(`gre${i}`, 'gre')),
    word('sat0', 'sat'), word('sat1', 'sat'),
    word('biz0', 'business'),
  ];
  const queue = buildStudyQueue(words, baseState(), NOW, TODAY);
  assert.equal(queue.length, NEW_WORDS_PER_DAY);
  assert.deepEqual(queue.slice(0, 5).map((w) => w.id), ['gre0', 'sat0', 'biz0', 'gre1', 'sat1']);
});

test('session never exceeds SESSION_SIZE', () => {
  const words = Array.from({ length: 50 }, (_, i) => word(`w${i}`));
  const progress = Object.fromEntries(words.map((w) => [w.id, reviewed(w.id, NOW - 1)]));
  assert.equal(buildStudyQueue(words, baseState({ wordProgress: progress }), NOW, TODAY).length, SESSION_SIZE);
});
