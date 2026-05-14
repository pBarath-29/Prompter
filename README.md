# Prompter

A full-stack SaaS platform for generating, discovering, and sharing AI prompts. Users describe their goal in plain English, pick a tone and category, and get a structured, ready-to-use prompt in seconds. Built with a community feed, a prompt marketplace, and a freemium subscription model.

Live at: https://promptgenie-app.vercel.app

---

## What it does

The core feature is AI-powered prompt generation using Gemini 2.5 Flash. You type what you want to accomplish, the system generates a properly structured prompt with a role, constraints, and output format built in. After generation, you can refine the result with one-click options like "Make it more specific" or "Add step-by-step format" without starting over.

Beyond generation, users can submit their prompts to a public community feed where others can upvote, downvote, and comment. The marketplace lets creators package prompts into collections and sell them. Admins moderate everything through a dedicated panel.

---

## Features

**Core**

- AI prompt generation with Gemini 2.5 Flash, with tone and category selection
- One-click prompt refinement after generation
- Voice input via the Web Speech API
- Generation history per user

**Community and Marketplace**

- Community feed with voting, comments, and filtering by category and model
- Prompt marketplace with curated collections
- Creator profiles with public prompt galleries
- Promo code system for discounts

**Auth and Accounts**

- Email and password signup with email verification
- Google OAuth sign-in
- Password strength validation and change
- Account deletion with data anonymisation

**Feedback**

- Toast notifications for user actions

**Admin**

- Full moderation queue for prompts and collections
- User management with ban/unban
- Promo code creation and management

**Product**

- Freemium model: 5 free generations per month, 3 community submissions per day
- Pro tier with unlimited generations and higher submission limits
- Multi-step onboarding modal for new users
- Dark mode with persistence
- Responsive layout

---

## Tech stack

| Layer             | Technology                                          |
| ----------------- | --------------------------------------------------- |
| Frontend          | React 19, TypeScript, Vite                          |
| Routing           | React Router v7 (hash-based for static hosting)     |
| Auth and database | Firebase Authentication, Firebase Realtime Database |
| AI                | Google Gemini 2.5 Flash (text), Imagen 4.0 (images) |
| Styling           | Tailwind CSS                                        |
| Icons             | Lucide React                                        |
| Charts            | Recharts                                            |
| Testing           | Vitest                                              |
| CI                | GitHub Actions                                      |
| Hosting           | Vercel                                              |

---

## Architecture

```
src/
  components/       Reusable UI components
  contexts/         React Context providers for global state
    AuthContext         User auth, subscription tier, generation limits
    PromptContext       Prompts CRUD, voting, comments
    CollectionContext   Collections CRUD
    HistoryContext      Per-user generation history
    ToastContext        Global toast notifications
    ThemeContext        Light and dark mode
  pages/            Route-level page components (lazy loaded)
  services/
    geminiService.ts    Gemini API: generate, validate, refine, example output
    firebase.ts         Firebase app initialisation from env vars
    firebaseService.ts  Generic CRUD helpers: getData, setData, updateData, etc.
  hooks/            useSpeechRecognition
  utils/
    dateUtils.ts        Pure date helpers used across contexts and tests
  __tests__/        Unit tests
```

State lives in React Context backed by Firebase Realtime Database. All writes are optimistic with rollback on failure. Pages are lazy-loaded with React.lazy to keep the initial bundle small.

Firebase Security Rules are defined in `database.rules.json`. Users can only read and write their own data. Prompts and collections are readable by all authenticated users but writable only by their author or an admin.

---

## Getting started

### Requirements

- Node.js 18 or higher
- A Firebase project with Authentication and Realtime Database enabled
- A Gemini API key from https://aistudio.google.com/app/apikey

### Setup

```bash
git clone https://github.com/pBarath-29/Prompter.git
cd prompter

npm install

cp .env.example .env.local
# Fill in your keys in .env.local

npm run dev
# Runs on http://localhost:3000
```

### Environment variables

See `.env.example` for the full list. The required variables are:

- `GEMINI_API_KEY` - your Gemini API key
- `ADMIN_EMAIL` - the email that gets admin access and Pro tier on first signup
- Firebase config variables from your project settings

All variables starting with `VITE_` are bundled into the client. Everything else stays server-side only.

---

## Scripts

| Command              | What it does                            |
| -------------------- | --------------------------------------- |
| `npm run dev`        | Start the local dev server on port 3000 |
| `npm run build`      | Production build to dist/               |
| `npm run preview`    | Preview the production build locally    |
| `npm test`           | Run unit tests with Vitest              |
| `npm run test:watch` | Run tests in watch mode                 |

---

## Testing

Tests are in `__tests__/` and cover the pure utility functions in `utils/dateUtils.ts`, including the month calculation logic and day reset checks.

```bash
npm test
```

The CI pipeline runs `npm test` and `npm run build` on every push to main and on every pull request.

---

## Deployment

The project deploys to Vercel. To deploy manually:

```bash
vercel --prod
```

Environment variables need to be set in the Vercel dashboard under Project Settings. They match the keys in `.env.example`.

To activate Firebase Security Rules, copy the contents of `database.rules.json` into Firebase Console under Realtime Database, then click Publish.

To enable Google OAuth, go to Firebase Console, then Authentication, then Sign-in providers, and enable Google.

---

## Roadmap

- Real Stripe payment integration with webhook verification
- Email notifications on prompt approval and rejection (requires Firebase Blaze plan and Cloud Functions)
- Creator analytics dashboard showing views, saves, and purchases
- Public API for third-party integrations
