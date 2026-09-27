import { createContext, createElement, useContext, useReducer, useEffect } from 'react';
import type { AppState, Word, WordProgress } from '../types';
import { initProgress, reviewWord } from '../utils/sm2';
import {
  buildStudyQueue,
  currentStreak,
  dueReviews,
  localDateStr,
  newWordsLeftToday,
  nextStreak,
  pickNewWords,
} from '../utils/schedule';
import { WORDS } from '../data/words';

const STORAGE_KEY = 'lingoloom_state';

const defaultState: AppState = {
  wordProgress: {},
  streak: 0,
  lastStudiedDate: '',
  quizBest: 0,
  totalStudied: 0,
  newWordsDate: '',
  newWordsCount: 0,
};

type Action =
  | { type: 'REVIEW_WORD'; wordId: string; quality: 1 | 3 | 4 | 5 }
  | { type: 'RECORD_QUIZ'; score: number }
  | { type: 'RESET' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REVIEW_WORD': {
      const previous = state.wordProgress[action.wordId];
      const isNew = !previous || previous.attempts === 0;
      const updated = reviewWord(previous ?? initProgress(action.wordId), action.quality);
      const today = localDateStr();
      const newWordsSoFar = state.newWordsDate === today ? state.newWordsCount : 0;
      return {
        ...state,
        wordProgress: { ...state.wordProgress, [action.wordId]: updated },
        streak: nextStreak(state.streak, state.lastStudiedDate, today),
        lastStudiedDate: today,
        totalStudied: state.totalStudied + 1,
        newWordsDate: today,
        newWordsCount: newWordsSoFar + (isNew ? 1 : 0),
      };
    }
    case 'RECORD_QUIZ':
      return { ...state, quizBest: Math.max(state.quizBest, action.score) };
    case 'RESET':
      return defaultState;
    default:
      return state;
  }
}

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...JSON.parse(raw) };
  } catch {
    return defaultState;
  }
}

// ── Context ───────────────────────────────────────────────────────────

interface StoreContextValue {
  state: AppState;
  /** Streak to show: 0 once a day has been missed. */
  streak: number;
  reviewWord: (wordId: string, quality: 1 | 3 | 4 | 5) => void;
  recordQuiz: (score: number) => void;
  resetProgress: () => void;
  getStudyQueue: () => Word[];
  getDueCounts: () => { reviews: number; newWords: number };
  getProgress: (wordId: string) => WordProgress;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Storage blocked or full: progress lasts for this visit only.
    }
  }, [state]);

  const today = localDateStr();

  const value: StoreContextValue = {
    state,
    streak: currentStreak(state.streak, state.lastStudiedDate, today),
    reviewWord: (wordId, quality) => dispatch({ type: 'REVIEW_WORD', wordId, quality }),
    recordQuiz: (score) => dispatch({ type: 'RECORD_QUIZ', score }),
    resetProgress: () => dispatch({ type: 'RESET' }),
    getStudyQueue: () => buildStudyQueue(WORDS, state, Date.now(), today),
    getDueCounts: () => ({
      reviews: dueReviews(WORDS, state, Date.now()).length,
      newWords: pickNewWords(WORDS, state, newWordsLeftToday(state, today)).length,
    }),
    getProgress: (wordId) => state.wordProgress[wordId] ?? initProgress(wordId),
  };

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
