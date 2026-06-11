import { Brain, Flame, Star, Zap } from 'lucide-react';
import { useState } from 'react';
import { WORDS, getDailyWord, CATEGORY_COLORS, CATEGORY_LABELS } from '../data/words';
import { useStore } from '../store/vocabStore';
import type { Page, Word } from '../types';
import { masteryLevel } from '../utils/sm2';
import WordDetailModal from '../components/WordDetailModal';

interface Props {
  onNavigate: (page: Page) => void;
}

export default function Home({ onNavigate }: Props) {
  const { state, getDueWords } = useStore();
  const [detailWord, setDetailWord] = useState<Word | null>(null);
  const daily = getDailyWord();
  const dueCount = getDueWords().length;

  const mastered = WORDS.filter((w) => masteryLevel(state.wordProgress[w.id] ?? { attempts: 0, repetitions: 0 } as never) === 'mastered').length;
  const learning = WORDS.filter((w) => {
    const p = state.wordProgress[w.id];
    if (!p) return false;
    const lvl = masteryLevel(p);
    return lvl === 'learning' || lvl === 'reviewing';
  }).length;

  return (
    <div className="px-4 pt-12 pb-28 max-w-lg mx-auto animate-fade-up">
      {/* App title */}
      <header className="mb-6">
        <h1 className="font-serif text-3xl font-semibold text-slate-800">VocabUp</h1>
        <p className="text-slate-500 text-sm mt-0.5">Build your vocabulary, one word at a time.</p>
      </header>

      {/* Streak */}
      <div className="flex items-center gap-2 mb-6">
        <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 rounded-full px-3 py-1.5">
          <Flame size={16} className="text-orange-500" />
          <span className="text-sm font-semibold text-orange-600">{state.streak} day streak</span>
        </div>
        <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5">
          <Star size={16} className="text-teal-500" />
          <span className="text-sm font-semibold text-teal-600">{mastered} mastered</span>
        </div>
      </div>

      {/* Word of the day */}
      <section className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Word of the Day</p>
        <button
          onClick={() => setDetailWord(daily)}
          className="w-full text-left bg-gradient-to-br from-teal-500 to-teal-700 text-white rounded-2xl p-5 shadow-lg active:scale-[.98] transition-transform"
        >
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20`}>
            {CATEGORY_LABELS[daily.category]}
          </span>
          <h2 className="font-serif text-2xl font-semibold mt-2">{daily.word}</h2>
          <p className="text-teal-100 text-sm mt-0.5">/{daily.pronunciation}/ · {daily.partOfSpeech}</p>
          <p className="mt-3 text-white/90 text-sm leading-relaxed line-clamp-2">{daily.definition}</p>
          <p className="mt-1 text-teal-200 text-xs">Tap to see full details →</p>
        </button>
      </section>

      {/* Quick actions */}
      <section className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Practice</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('study')}
            className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm active:scale-[.97] transition-transform"
          >
            <Brain size={24} className="text-teal-500 mb-2" />
            <p className="font-semibold text-slate-800 text-sm">Flashcards</p>
            <p className="text-xs text-slate-500 mt-0.5">{dueCount} cards due</p>
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="bg-white border border-slate-200 rounded-2xl p-4 text-left shadow-sm active:scale-[.97] transition-transform"
          >
            <Zap size={24} className="text-amber-500 mb-2" />
            <p className="font-semibold text-slate-800 text-sm">Quick Quiz</p>
            <p className="text-xs text-slate-500 mt-0.5">Best: {state.quizBest}/10</p>
          </button>
        </div>
      </section>

      {/* Stats */}
      <section className="mb-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">Your Library</p>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-3 divide-x divide-slate-100 text-center">
          <div className="px-2">
            <p className="text-2xl font-semibold text-slate-800">{WORDS.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total words</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-semibold text-teal-600">{mastered}</p>
            <p className="text-xs text-slate-500 mt-0.5">Mastered</p>
          </div>
          <div className="px-2">
            <p className="text-2xl font-semibold text-amber-500">{learning}</p>
            <p className="text-xs text-slate-500 mt-0.5">In progress</p>
          </div>
        </div>
      </section>

      {/* Recent words */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Explore Words</p>
          <button onClick={() => onNavigate('browse')} className="text-xs text-teal-600 font-medium">See all →</button>
        </div>
        <div className="space-y-2">
          {WORDS.slice(0, 5).map((w) => (
            <button
              key={w.id}
              onClick={() => setDetailWord(w)}
              className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3 shadow-sm active:scale-[.98] transition-transform"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-800 text-sm">{w.word}</p>
                <p className="text-xs text-slate-500 truncate">{w.definition}</p>
              </div>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${CATEGORY_COLORS[w.category]}`}>
                {CATEGORY_LABELS[w.category]}
              </span>
            </button>
          ))}
        </div>
      </section>

      {detailWord && <WordDetailModal word={detailWord} onClose={() => setDetailWord(null)} />}
    </div>
  );
}
