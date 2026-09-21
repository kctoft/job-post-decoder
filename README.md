# Job Post Decoder

Paste a job posting. Watch a four-step agent pipeline decode it live — the real requirements, the red flags, an honest fit score, a cover letter, and interview prep — then revisit and compare every decode later from your history.

## What it does

1. Paste a job posting, or a link to one
2. **Job analysis** — extracts what the role actually is: must-haves vs. nice-to-haves, true seniority level, buzzword density, salary transparency, and concrete red flags with reasoning
3. Optionally add your resume (paste text or upload a PDF) — **fit analysis** scores your fit (0–100), lists matched/missing keywords, ranks the top 5 gaps with evidence quoted straight from the posting, and drafts XYZ-format resume bullets that surface real experience you already have
4. Optionally generate a **cover letter draft** and/or **interview prep** — both grounded only in what the fit analysis already found and what's actually on your resume
5. Every decode auto-saves to a local history you can revisit, compare side-by-side, or delete

Every agent is instructed the same way: never invent experience, metrics, or skills the resume doesn't support — only rephrase or resurface what's already there.

## Why a streaming pipeline, not one big call

Each step is a separate model call, run in sequence, streamed to the browser over SSE as it happens — so the analysis reveals step by step instead of disappearing behind one loading spinner. Each step's prompt is also seeded with the previous steps' structured output (fit analysis gets the job analysis's extracted requirements; the cover letter and interview prep both get the fit analysis's gaps), which keeps every step focused and grounded in the same facts a human reading top-to-bottom would see. If a later step fails — say interview prep hits a malformed-JSON response — the steps that already succeeded stay on screen; only the failed step shows an error, and it retries the underlying model call once automatically before giving up.

## Features

- **Role decoder** — plain-English summary of what you'd actually spend your day doing
- **Paste a link** — server-side fetch turns a job posting URL into text automatically (works best on Greenhouse/Lever/Ashby-style pages; JS-heavy sites like LinkedIn often block it, so pasting text is always the fallback)
- **PDF resume upload** — parsed entirely in your browser with pdfjs-dist; the file itself is never sent to the server, only the extracted text
- **Red flag detection** — vague/missing salary, "wear many hats," rockstar/ninja language, scope creep across disciplines, unrealistic seniority-vs-requirements combos
- **Live streaming pipeline** — a step-by-step progress indicator plus a raw live-text panel while each step is generating, so the multi-agent architecture is visible, not a black box
- **Fit score** — honest 0–100 match against a resume, with reasoning
- **Top 5 priority gaps** — the missing requirements ranked by importance, each backed by a real quote from the posting
- **Tailored bullets** — XYZ-format suggestions built only from real resume content, each mapped to the requirement it targets
- **Cover letter draft** — a ready-to-send letter, streamed live as plain prose, with a copy button
- **Interview prep** — likely questions and honest talking points grounded in the specific gaps and red flags already found
- **History + compare** — every decode auto-saves locally (resume text itself is never stored, only the analysis results); revisit any past decode or compare 2-4 side by side on fit score, buzzwords, salary transparency, and keyword counts
- **Rate limited** — basic per-IP sliding window on both API routes
- **SSRF-guarded URL fetch** — blocks localhost/private/link-local addresses (including the cloud metadata IP), enforces an http(s)-only + redirect-revalidating fetch with a size cap and timeout

## Tech stack

- **SvelteKit** — full-stack framework, SSE streaming API routes
- **Anthropic Claude API** — four-step streaming agent pipeline
- **pdfjs-dist** — client-side PDF text extraction
- **TypeScript** — end-to-end type safety
- **Vitest** — unit tests for JSON extraction, rate limiting, the SSRF guard, HTML-to-text conversion, prompt builders, and the history store

## Quick start

```bash
git clone https://github.com/kctoft/job-post-decoder.git
cd job-post-decoder
npm install
cp .env.example .env   # add your Anthropic API key
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Walkthrough

**1. Start with a job posting.** Paste the text directly, hit "Load example" to try it on a deliberately buzzword-heavy fake posting ("rockstar, ninja-level," no salary range, three jobs bundled into one), or paste a link and hit "Fetch →" to pull the text automatically from the page.

**2. Add your resume (optional).** Paste it as text or hit "Upload PDF" — parsing happens entirely in your browser via pdfjs-dist, so the file itself never touches the server. Once a resume is present, two checkboxes appear: "Also draft a cover letter" and "Also generate interview prep." Both are off by default, so a plain decode only costs 1-2 model calls.

**3. Hit "Decode Job Posting →" and watch the pipeline run live.** A step indicator appears — Job analysis → Fit score → Cover letter → Interview prep — each bubble moving from a hollow pending circle, to a pulsing "streaming" state, to a green checkmark. While a step is generating, a live panel underneath shows its raw output arriving token by token: JSON for job/fit/interview-prep, plain prose for the cover letter (the most satisfying one to watch — an actual letter typing itself out in real time).

**4. Results appear as each step finishes** — you don't wait for the whole pipeline:
- **Job analysis** lands first: a plain-English role summary, badges for seniority/buzzword density/salary transparency, must-haves vs. nice-to-haves side by side, and a red-flags list (or a "reads clean" note if there genuinely aren't any).
- **Fit score** appears next as a color-coded 0-100 gauge (green/amber/red) with an honest summary — it won't inflate your odds. Below it: what you've already got covered, what's missing, and a **top-5 priority gaps** list, each one backed by a real quoted snippet from the posting so you can see exactly why it flagged that gap.
- **Suggested resume bullets** follow, in XYZ format, each one built only from facts already on your resume and mapped to the specific gap it addresses.
- **Cover letter** (if requested) renders in its own card with a one-click copy button.
- **Interview prep** (if requested) renders as a list of likely questions paired with honest talking points — grounded in the same gaps and red flags already surfaced, not invented on the spot.

**5. Every decode auto-saves.** Click "History →" in the header to see every past decode as a card (role title, date, fit-score badge). Click into one to replay the full analysis, select 2-4 and hit "Compare selected" to see them side by side on fit score, seniority, buzzword density, salary transparency, and keyword counts — useful for deciding which of several postings is actually worth your time. Resume text itself is never stored in history, only the analysis output.

**6. If something fails partway through, you keep what already succeeded.** Each step runs and streams independently — if, say, interview prep hits a malformed response, the job analysis, fit score, and cover letter you already saw stay exactly as they are; only that one step shows an error (after retrying once automatically).

## Tests

```bash
npm test
```

## Author

**Kitana Toft** — [kitanatoft.com](https://kitanatoft.com) · [GitHub](https://github.com/kctoft)

## License

MIT
