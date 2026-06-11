import { Flame, Star, Target, Trophy, Zap } from 'lucide-react';
import { WORDS, CATEGORY_LABELS, CATEGORY_COLORS } from '../data/words';
import { useStore } from '../store/vocabStore';
import { masteryLevel } from '../utils/sm2';
import type { Category } from '../types';

export default function Progress() {
  const { state } = useStore();

  const totalWords = WORDS.length;
  const mastered = WORDS.filter((w) => masteryLevel(state.wordProgress[w.id] ?? {} as never) === 'mastered').length;
  const reviewing = WORDS.filter((w) => masteryLevel(state.wordProgress[w.id] ?? {} as never) === 'reviewing').length;
  const learning = WORDS.filter((w) => masteryLevel(state.wordProgress[w.id] ?? {} as never) === 'learning').length;
  const newCount = WORDS.filter((w) => !state.wordProgress[w.id] || state.wordProgress[w.id].attempts === 0).length;

  const overallPct = Math.round((mastered / totalWords) * 100);

  const catStats: Record<Category, { total: number; mastered: number }> = {
    gre: { total: 0, mastered: 0 },
    sat: { total: 0, mastered: 0 },
    common: { total: 0, mastered: 0 },
    business: { total: 0, mastered: 0 },
  };
  WORDS.forEach((w) => {
    catStats[w.category].total += 1;
    if (masteryLevel(state.wordProgress[w.id] ?? {} as never) === 'mastered') {
      catStats[w.category].mastered += 1;
    }
  });

  const totalAccuracy =
    state.totalStudied > 0
      ? Math.round(
          (Object.values(state.wordProgress).reduce((acc, p) => acc + p.correct, 0) /
            Object.values(state.wordProgress).reduce((acc, p) => acc + p.attempts, 0)) *
            100,
        )
      : 0;

  return (
    <div className="px-4 pt-12 pb-28 max-w-lg mx-auto animate-fade-up">
      <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-5">Your Progress</h1>

      {/* Key stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-orange-50 border border-orange-100 rounded-2xl p-4 flex items-center gap-3">
          <Flame size={28} className="text-orange-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-orange-600">{state.streak}</p>
            <p className="text-xs text-slate-500">Day streak</p>
          </div>
        </div>
        <div className="bg-teal-50 border border-teal-100 rounded-2xl p-4 flex items-center gap-3">
          <Star size={28} className="text-teal-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-teal-600">{mastered}</p>
            <p className="text-xs text-slate-500">Words mastered</p>
          </div>
        </div>
        <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4 flex items-center gap-3">
          <Target size={28} className="text-purple-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-purple-600">{totalAccuracy}%</p>
            <p className="text-xs text-slate-500">Accuracy</p>
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex items-center gap-3">
          <Trophy size={28} className="text-amber-500 shrink-0" />
          <div>
            <p className="text-2xl font-bold text-amber-600">{state.quizBest}/10</p>
            <p className="text-xs text-slate-500">Best quiz score</p>
          </div>
        </div>
      </div>

      {/* Overall progress ring */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Overall Mastery</p>
        <div className="flex items-center gap-5">
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e2e8f0" strokeWidth="3" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#14b8a6" strokeWidth="3"
                strokeDasharray={`${overallPct} ${100 - overallPct}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-sm font-bold text-teal-600">{overallPct}%</span>
            </div>
          </div>
          <div className="space-y-2 flex-1">
            {[
              { label: 'New', count: newCount, color: 'bg-slate-300' },
              { label: 'Learning', count: learning, color: 'bg-red-400' },
              { label: 'Reviewing', count: reviewing, color: 'bg-amber-400' },
              { label: 'Mastered', count: mastered, color: 'bg-teal-500' },
            ].map(({ label, count, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                <span className="text-xs text-slate-600 w-16">{label}</span>
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full ${color}`}
                    style={{ width: `${(count / totalWords) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500 w-5 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 mb-5 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">By Category</p>
        <div className="space-y-3">
          {(Object.entries(catStats) as [Category, typeof catStats[Category]][]).map(([cat, { total, mastered: m }]) => {
            const pct = Math.round((m / total) * 100);
            return (
              <div key={cat}>
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[cat]}`}>
                    {CATEGORY_LABELS[cat]}
                  </span>
                  <span className="text-xs text-slate-500">{m}/{total}</span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Total reviews */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-3">
        <Zap size={28} className="text-teal-500 shrink-0" />
        <div>
          <p className="text-2xl font-bold text-slate-800">{state.totalStudied}</p>
          <p className="text-sm text-slate-500">Total flashcard reviews</p>
        </div>
      </div>
    </div>
  );
}
