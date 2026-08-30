# Brava

Capture a thought before it's gone. Speak it into your phone, and it's waiting
for you — cleaned up and structured — the next time you sit down at your laptop.

## v0.1 scope

- Capture happens on phone (browser-based PWA, installable, no app store needed)
- Review happens on laptop only
- Speech-to-text via the browser's built-in Web Speech API
- Filler words and stuttered/repeated phrases stripped before saving
- Output is a structured `.md` file per idea, stored in Supabase (free tier)
- Backend runs as Vercel serverless functions, same domain as the frontend —
  no CORS, no mixed-content issues, both phone and laptop just hit the same URL

> Note: Web Speech API struggles with quiet/whispered speech. A local
> Whisper-based upgrade (free, self-hosted) was drafted and parked for later.

## Project structure

```
brava/
  frontend/
    index.html, app.js, cleanup.js, markdown.js  — capture screen
    review.html, review.js, review.css           — laptop review view
    api/                                          — Vercel serverless functions
      health.js
      ideas/index.js        (GET list, POST save)
      ideas/[filename].js   (GET one idea)
      _lib/                 shared Supabase client + storage helpers
```

## One-time setup

**1. Create a free Supabase project** at supabase.com, then run this in its
SQL Editor:
```sql
create table ideas (
  id bigserial primary key,
  filename text not null unique,
  content text not null,
  created_at timestamptz not null default now()
);
```

**2. Get your credentials** from Project Settings → API: the Project URL and
the `service_role` secret key.

**3. Add them as environment variables** in your Vercel project (Settings →
Environment Variables):
```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

**4. For local testing**, install the Vercel CLI and create `frontend/.env.local`
(already gitignored) with the same two variables, then run:
```bash
cd frontend
npm install
vercel dev
```
This serves both the static frontend and the `/api` functions together,
matching production behavior.

## Vercel deploy note

Root Directory should be set to `frontend` in your Vercel project settings.
If you see a 404 (`NOT_FOUND`), that's almost always this setting.

## Milestones

1. ✅ Project skeleton
2. ✅ Voice capture + raw transcription (Web Speech API)
3. ✅ Filler-word cleanup pass (+ repeated-phrase de-duplication)
4. ✅ Structured markdown generation
5. ✅ Storage — now on Supabase via Vercel serverless functions (same origin
   as frontend, works from any device with no CORS/mixed-content issues)
6. ✅ Laptop review view
