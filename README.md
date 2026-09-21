# Job Post Decoder

Paste a job posting. Get the real requirements, the red flags, and — if you add your resume — an honest fit score with tailored, XYZ-format bullet suggestions.

## What it does

1. Paste a job posting
2. A first agent extracts what the role actually is: must-haves vs. nice-to-haves, true seniority level, buzzword density, salary transparency, and concrete red flags with reasoning
3. Optionally paste your resume — a second agent, seeded with the first agent's extracted requirements, scores your fit (0–100), lists matched and missing keywords, and drafts resume bullets that surface real experience you already have to cover the gaps
4. The fit agent is instructed never to invent experience, metrics, or skills — only to resurface what's already on the resume

## Why two agents

The job-analysis step and the fit-scoring step are separate model calls, run in sequence, with the second call's input built from the first call's structured output. That keeps each step's prompt focused (a recruiter reading a posting vs. a career coach comparing two documents) and means the fit analysis is always grounded in the same requirements a human would see, not a fresh, inconsistent read of the posting.

## Features

- **Role decoder** — plain-English summary of what you'd actually spend your day doing
- **Red flag detection** — vague/missing salary, "wear many hats," rockstar/ninja language, scope creep across disciplines, unrealistic seniority-vs-requirements combos
- **Fit score** — honest 0–100 match against a resume, with reasoning
- **Keyword gap analysis** — what's already covered vs. what's missing
- **Tailored bullets** — XYZ-format suggestions built only from real resume content, each mapped to the requirement it targets
- **Rate limited** — basic per-IP sliding window on the API route

## Tech stack

- **SvelteKit** — full-stack framework
- **Anthropic Claude API** — two-step agent pipeline
- **TypeScript** — end-to-end type safety
- **Vitest** — unit tests for the JSON-extraction and rate-limiting logic

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
