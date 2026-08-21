# DesignCritique AI

[![CI](https://github.com/pruthvi-builds/designcritique-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/pruthvi-builds/designcritique-ai/actions/workflows/ci.yml)

Upload a UI screenshot, get a real AI-powered usability heuristic
evaluation. A personal/portfolio project. **Live demo:**
[designcritique-ai.vercel.app](https://designcritique-ai.vercel.app)

## Why

As a UI/UX designer, "does this screen actually follow good usability
practice?" is a question I ask constantly, and a second pair of eyes —
even an AI one — is genuinely useful for a fast first pass before a real
design review. This project pairs that with something I don't have
elsewhere in my portfolio: a real, working LLM API integration, doing
actual visual reasoning rather than just text completion.

## What it does

- **Design critique** — upload a PNG/JPEG/WebP screenshot; Gemini's
  vision model evaluates it against
  [Nielsen's 10 usability heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/)
  and returns an overall score, a summary, per-heuristic scores with
  specific findings, and a ranked list of the most impactful issues with
  concrete suggested fixes. This is a **real API call** — no mocking, no
  stub, using the free tier of Google's Gemini API.
- **Contrast checker** — a small companion tool: enter a foreground and
  background color, get the WCAG 2.x contrast ratio and AA/AAA pass/fail
  for both normal and large text. This part is fully local and
  deterministic — no AI involved, computed from the standard relative
  luminance formula.

## Tech stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack) + TypeScript
- Tailwind CSS
- [`@google/genai`](https://www.npmjs.com/package/@google/genai) —
  Google's official Gemini SDK, using structured JSON output
  (`responseSchema`) so the model's response is parsed directly into a
  typed result, validated at the boundary with a `zod` schema
- [Vitest](https://vitest.dev) for unit + integration tests
- GitHub Actions for CI
- Deployed on [Vercel](https://vercel.com) (free tier) — no database, no
  other infrastructure

## Running locally

### 1. Get a free Gemini API key

Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey),
sign in, and create a key. The free tier requires no credit card and has
generous rate limits for a project at this scale.

### 2. Install and configure

```bash
git clone https://github.com/pruthvi-builds/designcritique-ai.git
cd designcritique-ai
npm install
cp .env.example .env
```

Fill in `.env` with your key:

```
GEMINI_API_KEY="your-key-here"
```

### 3. Run the dev server

```bash
npm run dev
```

Visit `http://localhost:3000`.

The contrast checker (`/contrast-checker`) works with no key at all,
since it's fully local. The critique feature (`/`) will show a clear
"GEMINI_API_KEY is not set" error — not a crash — if the key is missing.

## Testing

```bash
npm test          # run the full suite once
npm run test:watch
```

- **Unit tests** ([`src/lib/contrast.test.ts`](src/lib/contrast.test.ts))
  — the WCAG contrast math: known reference values (black/white = 21:1,
  identical colors = 1:1), AA/AAA thresholds for normal vs. large text,
  invalid input handling.
- **Integration tests**
  ([`src/app/api/critique/route.test.ts`](src/app/api/critique/route.test.ts))
  — request validation (missing/oversized/wrong-type file) and error
  mapping, with the Gemini call mocked so the suite never hits the real
  API or costs money.
- **Opt-in real-API test**
  ([`src/lib/gemini.test.ts`](src/lib/gemini.test.ts)) — gated behind
  `GEMINI_API_KEY` being present in the environment; skipped entirely
  (including in CI) when it isn't. Run it explicitly with a key set to
  verify the live integration still matches the expected response
  schema:

  ```bash
  GEMINI_API_KEY="your-key" npx vitest run src/lib/gemini.test.ts
  ```

## CI

[`.github/workflows/ci.yml`](.github/workflows/ci.yml) runs on every push
and pull request to `main`: install → typecheck → lint → test → build.
No environment variables are needed in CI — the API key is only read at
request time inside the route handler, and the opt-in real-API test
skips itself when the key isn't present.

If you want to require this before merging on GitHub: **Settings →
Branches → Branch protection rules → add rule for `main`** → enable
"Require status checks to pass before merging" → select the `CI` check.

## Deployment

[Vercel](https://vercel.com) free tier, connected to this GitHub repo.
The only environment variable needed is `GEMINI_API_KEY`, set as a
Vercel project environment variable. No database or other
infrastructure required.

## Known limitations

- **Single static screenshot only.** The model has no interaction
  history, so heuristics like "Visibility of system status" over time
  or "Error prevention" during a flow get limited or no evidence — the
  prompt asks it to say so explicitly rather than guess, and it
  generally does, but it's still working from one frame, not a full
  user flow.
- **No image size/quality preprocessing.** A very large or very
  low-resolution screenshot is sent as-is (up to the 8MB upload cap);
  extremely small text may not be legible enough for the model to judge
  fairly.
- **LLM output, not a certified audit.** This is a fast first-pass
  heuristic check, useful for catching obvious issues before a real
  design review — not a substitute for actual usability testing or a
  WCAG conformance audit (the contrast checker's numbers are exact; the
  AI critique's scores are the model's judgment, not a guarantee).
- **Free-tier rate limits.** Google's free Gemini tier has request-rate
  caps; under heavy simultaneous use the API may return a rate-limit
  error, which the app surfaces as a clear message rather than a crash.

## Next steps (not built, intentionally out of scope for now)

- Multi-screen flow analysis (upload several screenshots as one flow)
- Automatic dominant-color extraction for the contrast checker (currently manual hex input)
- Exportable PDF/shareable report of a critique
- Side-by-side before/after comparison after applying suggested fixes
