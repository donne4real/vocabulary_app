import { createContext, useContext, useReducer, useEffect } from 'react';
import type { AppState, WordProgress } from '../types';
import { initProgress, reviewWord } from '../utils/sm2';
import { WORDS } from '../data/words';

const STORAGE_KEY = 'lingoloom_state';

const defaultState: AppState = {
  wordProgress: {},
  streak: 0,
  lastStudiedDate: '',
  quizBest: 0,
  totalStudied: 0,
};

type Action =
  | { type: 'REVIEW_WORD'; wordId: string; quality: 1 | 3 | 4 | 5 }
  | { type: 'RECORD_QUIZ'; score: number }
  | { type: 'RESET' };

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'REVIEW_WORD': {
      const existing = state.wordProgress[action.wordId] ?? initProgress(action.wordId);
      const updated = reviewWord(existing, action.quality);
      const today = todayStr();
      const wasYesterday =
        state.lastStudiedDate ===
        new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
      const newStreak =
        state.lastStudiedDate === today
          ? state.streak
          : wasYesterday
            ? state.streak + 1
            : 1;
      return {
        ...state,
        wordProgress: { ...state.wordProgress, [action.wordId]: updated },
        streak: newStreak,
        lastStudiedDate: today,
        totalStudied: state.totalStudied + 1,
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

import { createElement } from 'react';

interface StoreContextValue {
  state: AppState;
  reviewWord: (wordId: string, quality: 1 | 3 | 4 | 5) => void;
  recordQuiz: (score: number) => void;
  getDueWords: () => typeof WORDS;
  getProgress: (wordId: string) => WordProgress;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadState);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const value: StoreContextValue = {
    state,
    reviewWord: (wordId, quality) => dispatch({ type: 'REVIEW_WORD', wordId, quality }),
    recordQuiz: (score) => dispatch({ type: 'RECORD_QUIZ', score }),
    getDueWords: () => {
      const now = Date.now();
      const due = WORDS.filter((w) => {
        const p = state.wordProgress[w.id];
        return !p || now >= p.nextReview;
      });
      return due.length > 0 ? due : WORDS.slice(0, 20);
    },
    getProgress: (wordId) => state.wordProgress[wordId] ?? initProgress(wordId),
  };

  return createElement(StoreContext.Provider, { value }, children);
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
