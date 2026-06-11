import { X } from 'lucide-react';
import type { Word } from '../types';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '../data/words';
import { useStore } from '../store/vocabStore';
import { masteryLevel } from '../utils/sm2';

interface Props {
  word: Word;
  onClose: () => void;
}

const MASTERY_LABEL: Record<string, string> = {
  new: 'New',
  learning: 'Learning',
  reviewing: 'Reviewing',
  mastered: 'Mastered ✓',
};

const MASTERY_COLOR: Record<string, string> = {
  new: 'bg-slate-100 text-slate-500',
  learning: 'bg-red-100 text-red-600',
  reviewing: 'bg-amber-100 text-amber-700',
  mastered: 'bg-teal-100 text-teal-700',
};

export default function WordDetailModal({ word, onClose }: Props) {
  const { getProgress } = useStore();
  const progress = getProgress(word.id);
  const level = masteryLevel(progress);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[88vh] overflow-y-auto animate-fade-up shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[word.category]}`}>
                {CATEGORY_LABELS[word.category]}
              </span>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${MASTERY_COLOR[level]}`}>
                {MASTERY_LABEL[level]}
              </span>
            </div>
            <h2 className="font-serif text-2xl font-semibold mt-1">{word.word}</h2>
            <p className="text-sm text-slate-400 mt-0.5">/{word.pronunciation}/ · {word.partOfSpeech}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors ml-2 shrink-0"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Definition */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Definition</p>
            <p className="text-slate-800 leading-relaxed">{word.definition}</p>
          </section>

          {/* Example */}
          <section className="bg-teal-50 rounded-xl p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-600 mb-1">Example</p>
            <p className="text-slate-700 italic leading-relaxed">"{word.example}"</p>
          </section>

          {/* Synonyms */}
          {word.synonyms.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Synonyms</p>
              <div className="flex flex-wrap gap-2">
                {word.synonyms.map((s) => (
                  <span key={s} className="bg-slate-100 text-slate-700 text-sm px-3 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Antonyms */}
          {word.antonyms.length > 0 && (
            <section>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Antonyms</p>
              <div className="flex flex-wrap gap-2">
                {word.antonyms.map((a) => (
                  <span key={a} className="bg-red-50 text-red-600 text-sm px-3 py-1 rounded-full">
                    {a}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* Difficulty */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Difficulty</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <div
                  key={n}
                  className={`h-2 flex-1 rounded-full transition-colors ${n <= word.difficulty ? 'bg-teal-500' : 'bg-slate-200'}`}
                />
              ))}
            </div>
          </section>

          {/* Progress stats */}
          {progress.attempts > 0 && (
            <section className="bg-slate-50 rounded-xl p-4 grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-semibold text-teal-600">{progress.attempts}</p>
                <p className="text-xs text-slate-500">Reviews</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-teal-600">
                  {Math.round((progress.correct / progress.attempts) * 100)}%
                </p>
                <p className="text-xs text-slate-500">Accuracy</p>
              </div>
              <div>
                <p className="text-lg font-semibold text-teal-600">{progress.interval}d</p>
                <p className="text-xs text-slate-500">Interval</p>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
