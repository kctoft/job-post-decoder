import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import type { JobAnalysis, FitAnalysis } from '$lib/types';
import { extractJson } from '$lib/parse';
import { createRateLimiter } from '$lib/rateLimit';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-5';

const MAX_CHARS = 20000;
const rateLimited = createRateLimiter(10, 60_000);

async function analyzeJob(jobPosting: string): Promise<JobAnalysis> {
	const message = await client.messages.create({
		model: MODEL,
		max_tokens: 2000,
		messages: [{
			role: 'user',
			content: `You are a skeptical, experienced tech recruiter and hiring manager. Analyze this job posting and cut through the fluff to tell a candidate what the job actually is. Return ONLY valid JSON, no markdown, no code blocks.

JOB POSTING:
${jobPosting}

Return this exact JSON structure:
{
  "roleSummary": "<2-3 sentence plain-English summary of what this person will actually spend their day doing>",
  "seniorityLevel": "<your honest read on true seniority, e.g. 'Mid-level work dressed up as Senior' or 'Genuinely senior scope'>",
  "mustHaves": ["<hard requirement>", "..."],
  "niceToHaves": ["<soft/preferred requirement>", "..."],
  "redFlags": [{"flag": "<short red flag label>", "why": "<1 sentence why this is a concern>"}],
  "buzzwordDensity": "<low|medium|high>",
  "salaryTransparency": "<clear|vague|missing>"
}

Be direct and specific. Red flags to watch for: vague/missing salary, "wear many hats", "fast-paced" as a euphemism for understaffed, unrealistic combinations of seniority + requirements, excessive buzzwords ("rockstar", "ninja", "ninja-level", "ever-changing", "ever-evolving"), scope creep across multiple disciplines, unpaid trial work. If the posting is clean and reasonable, say so — don't invent red flags that aren't there.`
		}]
	});

	const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
	return extractJson(text) as JobAnalysis;
}

async function analyzeFit(jobPosting: string, jobAnalysis: JobAnalysis, resume: string): Promise<FitAnalysis> {
	const message = await client.messages.create({
		model: MODEL,
		max_tokens: 2000,
		messages: [{
			role: 'user',
			content: `You are a career coach helping a candidate tailor their resume to a specific job. You've already extracted the real requirements from the job posting below. Now compare them against the candidate's resume and return ONLY valid JSON, no markdown, no code blocks.

JOB POSTING:
${jobPosting}

EXTRACTED REQUIREMENTS:
Must-haves: ${jobAnalysis.mustHaves.join('; ')}
Nice-to-haves: ${jobAnalysis.niceToHaves.join('; ')}

CANDIDATE RESUME:
${resume}

Return this exact JSON structure:
{
  "fitScore": <0-100 integer, honest assessment>,
  "fitSummary": "<2-3 sentence honest summary of fit — don't inflate it>",
  "matchedKeywords": ["<skill/requirement the resume already demonstrates>", "..."],
  "missingKeywords": ["<skill/requirement the job wants that the resume doesn't clearly show>", "..."],
  "priorityGaps": [{"keyword": "<the specific missing requirement>", "evidence": "<a short exact quote from the JOB POSTING showing this is required or emphasized>", "whyItMatters": "<1 sentence on why this gap matters for this specific role>"}],
  "suggestedBullets": [{"bullet": "<a new or reworded resume bullet using ONLY facts already present in the resume, written in XYZ format (Accomplished X as measured by Y by doing Z), that surfaces a missing keyword the candidate's real experience actually supports>", "targets": "<which missing keyword/requirement this bullet addresses>"}]
}

Rules: never invent experience, metrics, or skills the resume doesn't support — only rephrase or resurface what's already there. If a missing keyword truly isn't supported by anything in the resume, list it in missingKeywords but do not force a bullet for it. priorityGaps is the top 5 (at most) missing keywords ranked by how much they matter for this role, each backed by a real quoted snippet from the job posting — this is the "if you fix nothing else, fix these" list. Aim for 3-5 suggested bullets.`
		}]
	});

	const text = message.content.filter((b) => b.type === 'text').map((b) => b.text).join('');
	return extractJson(text) as FitAnalysis;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (!env.ANTHROPIC_API_KEY) {
		return json({ error: 'Server is not configured. Please set ANTHROPIC_API_KEY.' }, { status: 500 });
	}

	const ip = getClientAddress();
	if (rateLimited(ip)) {
		return json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 });
	}

	const { jobPosting, resume } = await request.json();

	if (!jobPosting?.trim()) {
		return json({ error: 'No job posting provided' }, { status: 400 });
	}
	if (jobPosting.length > MAX_CHARS || (resume && resume.length > MAX_CHARS)) {
		return json({ error: `Input too long (max ${MAX_CHARS.toLocaleString()} characters each)` }, { status: 400 });
	}

	try {
		const job = await analyzeJob(jobPosting);
		const fit = resume?.trim() ? await analyzeFit(jobPosting, job, resume) : null;
		return json({ job, fit });
	} catch (err: any) {
		return json({ error: err.message || 'Decode failed' }, { status: 500 });
	}
};
