import { BookOpen, Brain, Home, LineChart, Zap } from 'lucide-react';
import type { Page } from '../types';

interface Props {
  current: Page;
  onNavigate: (page: Page) => void;
}

const TABS: { page: Page; label: string; icon: typeof Home }[] = [
  { page: 'home',     label: 'Home',     icon: Home },
  { page: 'browse',   label: 'Browse',   icon: BookOpen },
  { page: 'study',    label: 'Study',    icon: Brain },
  { page: 'quiz',     label: 'Quiz',     icon: Zap },
  { page: 'progress', label: 'Progress', icon: LineChart },
];

export default function BottomNav({ current, onNavigate }: Props) {
  return (
    <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 pb-safe z-40">
      <div className="flex">
        {TABS.map(({ page, label, icon: Icon }) => {
          const active = current === page;
          return (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 text-xs font-medium transition-colors
                ${active ? 'text-teal-600' : 'text-slate-400 active:text-slate-600'}`}
            >
              <Icon
                size={22}
                strokeWidth={active ? 2.2 : 1.8}
                className={active ? 'text-teal-600' : 'text-slate-400'}
              />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
