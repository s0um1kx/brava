# Brava

Capture a thought before it's gone. Speak it into your phone, and it's waiting
for you — cleaned up and structured — the next time you sit down at your laptop.

## v0.1 scope

- Capture happens on phone (browser-based PWA, installable, no app store needed)
- Review happens on laptop only
- Speech-to-text via the browser's built-in Web Speech API
- Filler words ("um", "like", "so basically") stripped before saving
- Output is a structured `.md` file per idea, saved to the backend

> Note: Web Speech API struggles with quiet/whispered speech. A local
> Whisper-based upgrade (free, self-hosted, no per-request cost) was drafted
> and parked for later — revisit if this becomes a real problem in daily use.

## Project structure

```
brava/
  frontend/   # PWA — capture screen, installed on phone
  backend/    # Express server — saves ideas as markdown files on disk
```

## Running locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
Serve `frontend/` with any static file server (needed for service worker + mic
permissions to work), e.g.:
```bash
cd frontend
npx serve .
```

## ⚠️ HTTPS / mixed-content note

Microphone access (and the Web Speech API) only works over HTTPS or
`localhost` — plain `http://192.168.x.x:port` on your phone will silently
fail. This is why the frontend is deployed to Vercel (free HTTPS).

However: once the frontend is on HTTPS (Vercel) and the backend is still
plain `http://` on your laptop, the browser will block calls between them
(mixed content). So:
- **Local testing** (frontend + backend both on `localhost`) — works fully,
  including save-to-backend.
- **Vercel-hosted frontend** — capture/cleanup/markdown work fine (all
  client-side), but "Save to Brava" won't reach your laptop's backend until
  the backend is also hosted somewhere with HTTPS (e.g. Render or Railway
  free tier). This is a known next step, not a bug to chase yet.

## Milestones

1. ✅ Project skeleton
2. ✅ Voice capture + raw transcription (Web Speech API)
3. ✅ Filler-word cleanup pass
4. ✅ Structured markdown generation
5. ✅ Storage tied to your account (backend saves to `backend/ideas/`)
6. Laptop review view
