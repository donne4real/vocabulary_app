import { useState } from 'react';
import BottomNav from './components/BottomNav';
import Browse from './pages/Browse';
import Home from './pages/Home';
import Progress from './pages/Progress';
import Quiz from './pages/Quiz';
import Study from './pages/Study';
import type { Page } from './types';

export default function App() {
  const [page, setPage] = useState<Page>('home');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased">
      <div className="max-w-lg mx-auto h-screen flex flex-col relative overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {page === 'home'     && <Home onNavigate={setPage} />}
          {page === 'browse'   && <Browse />}
          {page === 'study'    && <Study onNavigate={setPage} />}
          {page === 'quiz'     && <Quiz onNavigate={setPage} />}
          {page === 'progress' && <Progress />}
        </main>
        <BottomNav current={page} onNavigate={setPage} />
      </div>
    </div>
  );
}
