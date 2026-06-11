import { ChevronLeft, RotateCcw } from 'lucide-react';
import { useState, useCallback } from 'react';
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../data/words';
import { useStore } from '../store/vocabStore';
import type { Page, Word } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

type Phase = 'front' | 'back' | 'done';

export default function Study({ onNavigate }: Props) {
  const { getDueWords, reviewWord } = useStore();
  const [queue] = useState<Word[]>(() => {
    const words = getDueWords();
    return words.slice(0, 20);
  });
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('front');
  const [key, setKey] = useState(0);

  const current = queue[index];

  const flip = useCallback(() => {
    if (phase === 'front') setPhase('back');
  }, [phase]);

  const grade = useCallback(
    (quality: 1 | 3 | 4 | 5) => {
      if (!current) return;
      reviewWord(current.id, quality);
      if (index + 1 >= queue.length) {
        setPhase('done');
      } else {
        setIndex((i) => i + 1);
        setPhase('front');
        setKey((k) => k + 1);
      }
    },
    [current, index, queue.length, reviewWord],
  );

  if (queue.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center pb-24">
        <p className="text-5xl mb-4">🎉</p>
        <h2 className="font-serif text-2xl font-semibold text-slate-800">All caught up!</h2>
        <p className="text-slate-500 mt-2">No cards due right now. Come back tomorrow for new reviews.</p>
        <button
          onClick={() => onNavigate('home')}
          className="mt-6 bg-teal-600 text-white px-6 py-3 rounded-full font-semibold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="flex flex-col items-center justify-center h-full px-6 text-center pb-24 animate-fade-up">
        <p className="text-5xl mb-4">✅</p>
        <h2 className="font-serif text-2xl font-semibold text-slate-800">Session complete!</h2>
        <p className="text-slate-500 mt-2">You reviewed {queue.length} words.</p>
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => onNavigate('home')}
            className="bg-teal-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Back to Home
          </button>
          <button
            onClick={() => onNavigate('quiz')}
            className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-semibold"
          >
            Take a Quiz
          </button>
        </div>
      </div>
    );
  }

  const progress = ((index) / queue.length) * 100;

  return (
    <div className="flex flex-col h-full pt-12 pb-28">
      {/* Top bar */}
      <div className="px-4 flex items-center gap-3 mb-4">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div
            className="bg-teal-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium w-10 text-right">
          {index + 1}/{queue.length}
        </span>
      </div>

      {/* Card area */}
      <div key={key} className="flex-1 px-4 flex flex-col animate-fade-up">
        <div
          className={`bg-white border border-slate-200 rounded-2xl shadow-md flex-1 flex flex-col p-6 cursor-pointer select-none
            ${phase === 'front' ? 'active:scale-[.98] transition-transform' : ''}`}
          onClick={flip}
        >
          <div className="flex items-center justify-between mb-auto">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[current.category]}`}>
              {CATEGORY_LABELS[current.category]}
            </span>
            <span className="text-xs text-slate-400">
              {phase === 'front' ? 'Tap to reveal' : 'Rate yourself'}
            </span>
          </div>

          <div className="text-center my-8">
            <h2 className="font-serif text-4xl font-semibold text-slate-800">{current.word}</h2>
            <p className="text-slate-400 mt-2">/{current.pronunciation}/ · {current.partOfSpeech}</p>
          </div>

          {phase === 'back' && (
            <div className="mt-auto space-y-4 animate-flip-in">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Definition</p>
                <p className="text-slate-800 leading-relaxed">{current.definition}</p>
              </div>
              <div className="bg-teal-50 rounded-xl p-3">
                <p className="text-xs font-semibold text-teal-600 mb-1">Example</p>
                <p className="text-slate-700 text-sm italic">"{current.example}"</p>
              </div>
              {current.synonyms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {current.synonyms.slice(0, 3).map((s) => (
                    <span key={s} className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>
          )}

          {phase === 'front' && (
            <div className="mt-auto text-center text-slate-300 text-sm">
              ↑ Tap to see definition
            </div>
          )}
        </div>

        {/* Rating buttons */}
        {phase === 'back' && (
          <div className="grid grid-cols-3 gap-2 mt-4 animate-fade-up">
            <button
              onClick={() => grade(1)}
              className="bg-red-50 border border-red-200 text-red-600 rounded-xl py-3 text-sm font-semibold active:scale-[.96] transition-transform flex flex-col items-center gap-0.5"
            >
              <RotateCcw size={16} />
              Again
            </button>
            <button
              onClick={() => grade(4)}
              className="bg-teal-50 border border-teal-200 text-teal-700 rounded-xl py-3 text-sm font-semibold active:scale-[.96] transition-transform"
            >
              Good
            </button>
            <button
              onClick={() => grade(5)}
              className="bg-teal-600 text-white rounded-xl py-3 text-sm font-semibold active:scale-[.96] transition-transform"
            >
              Easy ⚡
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
