export type PartOfSpeech = 'noun' | 'verb' | 'adjective' | 'adverb' | 'other';
export type Category = 'gre' | 'sat' | 'common' | 'business';

export interface Word {
  id: string;
  word: string;
  pronunciation: string;
  partOfSpeech: PartOfSpeech;
  definition: string;
  example: string;
  synonyms: string[];
  antonyms: string[];
  category: Category;
  difficulty: 1 | 2 | 3 | 4 | 5;
}

export interface WordProgress {
  wordId: string;
  ef: number;          // ease factor (SM-2), starts at 2.5
  interval: number;    // days until next review
  repetitions: number; // successful reviews in a row
  nextReview: number;  // timestamp ms
  lastReview: number;  // timestamp ms
  correct: number;
  attempts: number;
}

export type Page = 'home' | 'browse' | 'study' | 'quiz' | 'progress';

export interface AppState {
  wordProgress: Record<string, WordProgress>;
  streak: number;
  lastStudiedDate: string; // YYYY-MM-DD
  quizBest: number;        // best quiz score out of 10
  totalStudied: number;
}
