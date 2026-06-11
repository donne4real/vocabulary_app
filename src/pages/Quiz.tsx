import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { WORDS } from '../data/words';
import { useStore } from '../store/vocabStore';
import type { Page, Word } from '../types';

interface Props {
  onNavigate: (page: Page) => void;
}

interface Question {
  word: Word;
  choices: string[];
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildQuiz(size = 10): Question[] {
  const pool = shuffle(WORDS).slice(0, size);
  return pool.map((word) => {
    const distractors = shuffle(WORDS.filter((w) => w.id !== word.id))
      .slice(0, 3)
      .map((w) => w.definition);
    const choices = shuffle([word.definition, ...distractors]);
    return {
      word,
      choices,
      correctIndex: choices.indexOf(word.definition),
    };
  });
}

type Phase = 'quiz' | 'results';

export default function Quiz({ onNavigate }: Props) {
  const { recordQuiz } = useStore();
  const [questions] = useState<Question[]>(() => buildQuiz(10));
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [phase, setPhase] = useState<Phase>('quiz');
  const [quizKey, setQuizKey] = useState(0);

  const q = questions[current];
  const score = answers.filter(Boolean).length;

  const choose = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
  };

  const next = () => {
    if (selected === null) return;
    const correct = selected === q.correctIndex;
    const newAnswers = [...answers, correct];
    if (current + 1 >= questions.length) {
      setAnswers(newAnswers);
      setPhase('results');
      recordQuiz(newAnswers.filter(Boolean).length);
    } else {
      setAnswers(newAnswers);
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const restart = () => {
    setQuizKey((k) => k + 1);
  };

  const scoreColor =
    score >= 8 ? 'text-teal-600' : score >= 5 ? 'text-amber-500' : 'text-red-500';
  const scoreEmoji = score >= 8 ? '🏆' : score >= 5 ? '👍' : '💪';

  if (phase === 'results') {
    return (
      <div key={quizKey} className="flex flex-col items-center justify-center h-full px-6 text-center pb-24 animate-fade-up">
        <p className="text-5xl mb-4">{scoreEmoji}</p>
        <h2 className="font-serif text-2xl font-semibold text-slate-800">Quiz Complete!</h2>
        <p className={`text-5xl font-bold mt-4 ${scoreColor}`}>{score}/10</p>
        <p className="text-slate-500 mt-2">
          {score >= 8 ? 'Excellent work!' : score >= 5 ? 'Good effort!' : 'Keep practicing!'}
        </p>

        {/* Answer breakdown */}
        <div className="mt-6 w-full max-w-sm">
          {questions.map((q2, i) => (
            <div
              key={q2.word.id}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-2 text-sm text-left
                ${answers[i] ? 'bg-teal-50 border border-teal-200' : 'bg-red-50 border border-red-200'}`}
            >
              <span className="text-lg">{answers[i] ? '✓' : '✗'}</span>
              <div>
                <p className="font-semibold text-slate-800">{q2.word.word}</p>
                {!answers[i] && <p className="text-xs text-slate-500">{q2.word.definition}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={restart}
            className="bg-teal-600 text-white px-6 py-3 rounded-full font-semibold"
          >
            Try Again
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="bg-slate-100 text-slate-700 px-6 py-3 rounded-full font-semibold"
          >
            Home
          </button>
        </div>
      </div>
    );
  }

  const progress = ((current) / questions.length) * 100;

  return (
    <div key={quizKey} className="flex flex-col h-full pt-12 pb-28 animate-fade-up">
      {/* Top bar */}
      <div className="px-4 flex items-center gap-3 mb-5">
        <button onClick={() => onNavigate('home')} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 bg-slate-200 rounded-full h-2">
          <div
            className="bg-amber-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs text-slate-500 font-medium w-10 text-right">
          {current + 1}/10
        </span>
      </div>

      <div className="flex-1 px-4 overflow-y-auto">
        {/* Question */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 mb-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">What word matches this definition?</p>
          <p className="text-slate-800 text-base leading-relaxed">{q.word.definition}</p>
          {selected !== null && (
            <div className="mt-3 bg-teal-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-teal-600 mb-0.5">Example</p>
              <p className="text-slate-700 text-sm italic">"{q.word.example}"</p>
            </div>
          )}
        </div>

        {/* Choices */}
        <div className="space-y-2">
          {q.choices.map((choice, idx) => {
            let style = 'bg-white border-slate-200 text-slate-800';
            if (selected !== null) {
              if (idx === q.correctIndex) {
                style = 'bg-teal-50 border-teal-400 text-teal-800';
              } else if (idx === selected && selected !== q.correctIndex) {
                style = 'bg-red-50 border-red-400 text-red-800';
              } else {
                style = 'bg-white border-slate-200 text-slate-400';
              }
            } else if (selected === idx) {
              style = 'bg-teal-50 border-teal-300 text-teal-800';
            }

            return (
              <button
                key={idx}
                onClick={() => choose(idx)}
                className={`w-full text-left border rounded-xl px-4 py-3 text-sm font-medium transition-all active:scale-[.98] ${style}`}
              >
                {choice}
              </button>
            );
          })}
        </div>
      </div>

      {/* Next button */}
      <div className="px-4 pt-3">
        <button
          onClick={next}
          disabled={selected === null}
          className={`w-full py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2 transition-all
            ${selected !== null ? 'bg-teal-600 text-white active:scale-[.98]' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
        >
          {current + 1 >= questions.length ? 'See Results' : 'Next'}
          <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );
}
