# Talk & Learn — Voice-First English Tutor

A Next.js + Supabase app where students practice English by **speaking**
first (using the browser's Web Speech API for speech-to-text and
text-to-speech), with a typed fallback for unsupported browsers. Includes
student/teacher sign up & login, structured lessons, and progress tracking.

## Stack
- **Next.js 14** (App Router) — frontend + API routes
- **Supabase** — auth, Postgres database, row-level security
- **Anthropic API (Claude)** — powers the tutor's replies
- **Web Speech API** — in-browser voice input/output (no extra service needed)
- **Vercel** — hosting

## 1. Set up Supabase

1. Create a project at supabase.com.
2. Go to SQL Editor → paste the contents of `supabase/schema.sql` → Run.
3. Go to Project Settings → API and copy the URL and anon key.
4. (Optional) Disable email confirmation while testing.

## 2. Get an Anthropic API key

Create a key at console.anthropic.com/settings/keys → `ANTHROPIC_API_KEY`.

## 3. Run locally

```bash
cp .env.example .env.local
npm install
npm run dev
```

## 4. Deploy to Vercel

```bash
npm i -g vercel
vercel login
vercel
```

## Notes / next steps
- Voice input requires a browser that supports the Web Speech API.
- Teacher-side lesson creation UI isn't built yet.
- Rotate the Anthropic key via Vercel's environment variable UI.
