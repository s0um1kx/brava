# Brava

Capture a thought before it's gone. Speak it into your phone, and it's waiting
for you — cleaned up and structured — the next time you sit down at your laptop.

## v0.1 scope

- Capture happens on phone (browser-based PWA, installable, no app store needed)
- Review happens on laptop only
- Speech-to-text via the browser's built-in Web Speech API
- Filler words ("um", "like", "so basically") stripped before saving
- Output is a structured `.md` file per idea

## Project structure

```
brava/
  frontend/   # PWA — capture screen, installed on phone
  backend/    # Express server — stores ideas as markdown
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

## Milestones

1. ✅ Project skeleton (this commit)
2. Voice capture + raw transcription
3. Filler-word cleanup pass
4. Structured markdown generation
5. Storage tied to your account
6. Laptop review view
