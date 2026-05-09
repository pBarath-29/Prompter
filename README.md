# ⚡ Prompter — AI Prompt Generator

> Generate, discover, and share high-quality AI prompts instantly.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-promptgenie--app.vercel.app-10b981?style=flat&logo=vercel)](https://promptgenie-app.vercel.app)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-Realtime%20DB-FFCA28?style=flat&logo=firebase)](https://firebase.google.com)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-4285F4?style=flat&logo=google)](https://ai.google.dev)

---

## Overview

Prompter is a full-stack SaaS platform that helps users craft high-quality AI prompts. Describe your goal in plain English, pick a tone and category, and the AI generates a structured, optimised prompt you can paste directly into any LLM (ChatGPT, Claude, Gemini). Users can also browse and contribute to a community library of prompts and purchase curated prompt collections from the marketplace.

Built as a complete product with auth, freemium monetisation, admin moderation, and a community ecosystem — not just a demo.

---

## Features

- **AI Prompt Generation** — Gemini 2.5 Flash generates structured prompts with a role, constraints, and output format built in
- **Prompt Refinement** — Iteratively improve generated prompts with one-click refinement suggestions
- **Voice Input** — Web Speech API for hands-free prompt requests
- **Community Feed** — Browse, upvote, and comment on approved community prompts
- **Prompt Marketplace** — Purchase curated collections from creators
- **Freemium Model** — 5 free generations/month; Pro tier unlocks unlimited
- **Admin Panel** — Full moderation workflow (approve/reject prompts and collections, manage users, promo codes)
- **User Profiles** — Public creator profiles with prompt galleries
- **Dark Mode** — Full light/dark theme with persistence
- **Responsive** — Works on all screen sizes

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + TypeScript + Vite |
| Routing | React Router v7 (hash-based, static-host friendly) |
| Auth & DB | Firebase Authentication + Realtime Database |
| AI | Google Gemini 2.5 Flash (text) + Imagen 4.0 (images) |
| Styling | Tailwind CSS |
| Icons | Lucide React |
| Charts | Recharts |
| Deploy | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Firebase](https://firebase.google.com) project with Authentication and Realtime Database enabled

### Local setup

```bash
# 1. Clone the repo
git clone https://github.com/your-username/prompter.git
cd prompter

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Open .env.local and fill in your Firebase + Gemini credentials

# 4. Start dev server
npm run dev
# → http://localhost:3000
```

### Environment variables

See [`.env.example`](.env.example) for all required variables.

To set the admin account, set `ADMIN_EMAIL` to the email you'll sign up with — that account will automatically receive the Pro tier and admin panel access on first signup.

---

## Architecture

```
src/
├── components/       # Reusable UI components (Button, Modal, Cards, etc.)
├── contexts/         # React Context providers for global state
│   ├── AuthContext       — user auth, subscription tier, generation limits
│   ├── PromptContext     — prompts CRUD + voting
│   ├── CollectionContext — collections CRUD
│   ├── HistoryContext    — per-user generation history
│   ├── ToastContext      — global toast notifications
│   └── ThemeContext      — light/dark mode
├── pages/            # Route-level page components
├── services/
│   ├── geminiService.ts  — Gemini API calls (generate, validate, refine, image)
│   ├── firebase.ts       — Firebase app init (reads from env vars)
│   └── firebaseService.ts — Generic CRUD helpers (getData, setData, etc.)
├── hooks/            # Custom React hooks (useSpeechRecognition)
└── utils/            # Pure utility functions (testable, no React deps)
```

State is managed entirely through React Context + Firebase Realtime Database. All writes are optimistic with rollback on error. No Redux needed at this scale.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local dev server on port 3000 |
| `npm run build` | Production build to `dist/` |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests with Vitest |

---

## Deployment

The app is deployed on Vercel. Any push to `main` triggers a new production deployment automatically.

Environment variables are set in the Vercel dashboard under **Project Settings → Environment Variables**. They mirror the keys in `.env.example`.

---

## Roadmap

- [ ] Real Stripe payment integration (webhooks + backend)
- [ ] Email notifications (prompt approval, new comments)
- [ ] Google / GitHub OAuth
- [ ] Creator analytics dashboard (views, purchases, revenue)
- [ ] Public API for third-party integrations
- [ ] Prompt version history and diffing

---

## License

MIT
