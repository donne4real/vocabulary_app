import { Search, X } from 'lucide-react';
import { useState, useMemo } from 'react';
import { WORDS, CATEGORY_COLORS, CATEGORY_LABELS } from '../data/words';
import WordDetailModal from '../components/WordDetailModal';
import type { Category, Word } from '../types';
import { useStore } from '../store/vocabStore';
import { masteryLevel } from '../utils/sm2';

const CATEGORIES: Array<Category | 'all'> = ['all', 'gre', 'sat', 'common', 'business'];


export default function Browse() {
  const { state } = useStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState<Category | 'all'>('all');
  const [detailWord, setDetailWord] = useState<Word | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return WORDS.filter((w) => {
      const matchCat = cat === 'all' || w.category === cat;
      const matchQ =
        !q ||
        w.word.toLowerCase().includes(q) ||
        w.definition.toLowerCase().includes(q) ||
        w.synonyms.some((s) => s.toLowerCase().includes(q));
      return matchCat && matchQ;
    });
  }, [query, cat]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-12 pb-3 bg-white border-b border-slate-100 sticky top-0 z-10">
        <h1 className="font-serif text-2xl font-semibold text-slate-800 mb-3">Browse Words</h1>

        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search words or definitions…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 bg-slate-100 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-teal-400"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors
                ${cat === c ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              {c === 'all' ? 'All' : CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      {/* Word list */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-28">
        <p className="text-xs text-slate-400 mb-3 font-medium">{filtered.length} words</p>
        {filtered.length === 0 ? (
          <div className="text-center mt-20 text-slate-400">
            <p className="text-lg">No results found</p>
            <p className="text-sm mt-1">Try a different search term</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((w) => {
              const progress = state.wordProgress[w.id];
              const level = progress ? masteryLevel(progress) : 'new';
              return (
                <button
                  key={w.id}
                  onClick={() => setDetailWord(w)}
                  className="w-full text-left bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3 shadow-sm active:scale-[.98] transition-transform"
                >
                  <div className="mt-1.5 w-2 h-2 rounded-full shrink-0 ${MASTERY_DOT[level]}"
                    style={{ background: level === 'new' ? '#cbd5e1' : level === 'learning' ? '#f87171' : level === 'reviewing' ? '#fbbf24' : '#14b8a6' }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{w.word}</p>
                      <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${CATEGORY_COLORS[w.category]}`}>
                        {CATEGORY_LABELS[w.category]}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 truncate mt-0.5">{w.definition}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {detailWord && <WordDetailModal word={detailWord} onClose={() => setDetailWord(null)} />}
    </div>
  );
}
