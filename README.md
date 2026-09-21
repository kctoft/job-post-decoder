# Job Post Decoder

Paste a job posting. Get the real requirements, the red flags, and — if you add your resume — an honest fit score with tailored, XYZ-format bullet suggestions.

## What it does

1. Paste a job posting, or a link to one
2. A first agent extracts what the role actually is: must-haves vs. nice-to-haves, true seniority level, buzzword density, salary transparency, and concrete red flags with reasoning
3. Optionally add your resume (paste text or upload a PDF) — a second agent, seeded with the first agent's extracted requirements, scores your fit (0–100), lists matched and missing keywords, ranks the top 5 gaps with evidence quoted straight from the posting, and drafts resume bullets that surface real experience you already have to cover them
4. The fit agent is instructed never to invent experience, metrics, or skills — only to resurface what's already on the resume

## Why two agents

The job-analysis step and the fit-scoring step are separate model calls, run in sequence, with the second call's input built from the first call's structured output. That keeps each step's prompt focused (a recruiter reading a posting vs. a career coach comparing two documents) and means the fit analysis is always grounded in the same requirements a human would see, not a fresh, inconsistent read of the posting.

## Features

- **Role decoder** — plain-English summary of what you'd actually spend your day doing
- **Paste a link** — server-side fetch turns a job posting URL into text automatically (works best on Greenhouse/Lever/Ashby-style pages; JS-heavy sites like LinkedIn often block it, so pasting text is always the fallback)
- **PDF resume upload** — parsed entirely in your browser with pdfjs-dist; the file itself is never sent to the server, only the extracted text
- **Red flag detection** — vague/missing salary, "wear many hats," rockstar/ninja language, scope creep across disciplines, unrealistic seniority-vs-requirements combos
- **Fit score** — honest 0–100 match against a resume, with reasoning
- **Keyword gap analysis** — what's already covered vs. what's missing
- **Top 5 priority gaps** — the missing requirements ranked by importance, each backed by a real quote from the posting (same evidence-based approach as a dedicated recruiter-scoring review)
- **Tailored bullets** — XYZ-format suggestions built only from real resume content, each mapped to the requirement it targets
- **Rate limited** — basic per-IP sliding window on both API routes
- **SSRF-guarded URL fetch** — blocks localhost/private/link-local addresses (including the cloud metadata IP), enforces an http(s)-only + redirect-revalidating fetch with a size cap and timeout

## Tech stack

- **SvelteKit** — full-stack framework
- **Anthropic Claude API** — two-step agent pipeline
- **pdfjs-dist** — client-side PDF text extraction
- **TypeScript** — end-to-end type safety
- **Vitest** — unit tests for JSON extraction, rate limiting, the SSRF guard, and HTML-to-text conversion

## Quick start

```bash
git clone https://github.com/kctoft/job-post-decoder.git
cd job-post-decoder
npm install
cp .env.example .env   # add your Anthropic API key
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Usage

Paste a job posting (or hit "Load example" to see it work on a deliberately buzzword-heavy fake posting), optionally paste your resume, and hit "Decode Job Posting."

## Tests

```bash
npm test
```

## Author

**Kitana Toft** — [kitanatoft.com](https://kitanatoft.com) · [GitHub](https://github.com/kctoft)

## License

MIT
