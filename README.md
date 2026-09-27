# LingoLoom

A mobile-first vocabulary learning app with flashcards, quizzes, and spaced repetition — built with React, Vite, and Tailwind CSS.

**Live:** [build-my-vocab.netlify.app](https://build-my-vocab.netlify.app)

---

## Features

- **600+ curated words** across four categories: GRE (most of the list), SAT, Common, and Business
- **Flashcard study** powered by the SM-2 spaced repetition algorithm — due reviews first, then up to 10 new words a day mixed across categories; missed cards come back later in the same session
- **Quick Quiz** — 10-question multiple choice to test your recall
- **Word browser** — filter and search the full library by category and difficulty
- **Progress tracking** — streak counter, mastery levels (learning → reviewing → mastered), and study stats
- **Word of the Day** — a new featured word on every visit

## Tech Stack

| Layer | Tool |
|---|---|
| Framework | React 19 + TypeScript |
| Build | Vite 6 |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| State | React Context + `useReducer` |
| Persistence | `localStorage` |
| Deploy | Netlify (auto-deploy from GitHub) |

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Run the tests
npm test

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── BottomNav.tsx       # Tab navigation bar
│   └── WordDetailModal.tsx # Full word detail sheet
├── data/
│   └── words.ts            # All vocabulary words
├── pages/
│   ├── Home.tsx            # Dashboard (streak, word of the day, quick actions)
│   ├── Browse.tsx          # Searchable word library
│   ├── Study.tsx           # Flashcard session
│   ├── Quiz.tsx            # Multiple choice quiz
│   └── Progress.tsx        # Stats and mastery breakdown
├── store/
│   └── vocabStore.ts       # Global state (Context + useReducer + localStorage)
├── utils/
│   ├── sm2.ts              # SM-2 spaced repetition algorithm
│   └── schedule.ts         # Study queue, daily new-word limit, streak dates
└── types.ts                # Shared TypeScript types
```

## Word Categories

| Category | Description |
|---|---|
| GRE | High-frequency words tested on the GRE |
| SAT | Vocabulary commonly found on the SAT |
| Common | Everyday words worth knowing |
| Business | Professional and corporate vocabulary |

## Deployment

The app is deployed on Netlify. Every push to `main` triggers an automatic redeploy.

- Build command: `npm run build`
- Publish directory: `dist`
