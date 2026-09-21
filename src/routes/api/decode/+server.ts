import type { RequestHandler } from './$types';
import Anthropic from '@anthropic-ai/sdk';
import { env } from '$env/dynamic/private';
import type { JobAnalysis, FitAnalysis, DecodeEvent, InterviewPrepItem } from '$lib/types';
import { extractJson } from '$lib/parse';
import { createRateLimiter } from '$lib/rateLimit';
import {
	buildJobPrompt,
	buildFitPrompt,
	buildCoverLetterPrompt,
	buildInterviewPrepPrompt
} from '$lib/server/prompts';
import { streamAgentCall } from '$lib/server/streamAgent';

const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });
const MODEL = 'claude-sonnet-5';

const MAX_CHARS = 20000;
const rateLimited = createRateLimiter(10, 60_000);

// Fit and interview-prep responses pack several structured fields (priority gaps,
// suggested bullets, multiple Q&A items) and were getting cut off mid-JSON at 2000 tokens.
const MAX_TOKENS = {
	job: 2000,
	fit: 4000,
	coverLetter: 1200,
	interviewPrep: 3000
} as const;

function jsonError(message: string, status: number): Response {
	return new Response(JSON.stringify({ error: message }), {
		status,
		headers: { 'content-type': 'application/json' }
	});
}

function sseLine(event: DecodeEvent): Uint8Array {
	return new TextEncoder().encode(`data: ${JSON.stringify(event)}\n\n`);
}

// LLM JSON output occasionally comes back malformed (e.g. an unescaped quote inside a
// string value). A fresh generation is more likely to be well-formed than trying to
// repair broken JSON text, so retry the whole call once before giving up.
async function streamJsonStep<T>(
	prompt: string,
	maxTokens: number,
	onChunk: (text: string) => void
): Promise<T> {
	let lastErr: unknown;
	for (let attempt = 0; attempt < 2; attempt++) {
		const text = await streamAgentCall(client, prompt, MODEL, onChunk, maxTokens);
		try {
			return extractJson(text) as T;
		} catch (err) {
			lastErr = err;
		}
	}
	throw lastErr;
}

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (!env.ANTHROPIC_API_KEY) {
		return jsonError('Server is not configured. Please set ANTHROPIC_API_KEY.', 500);
	}

	if (rateLimited(getClientAddress())) {
		return jsonError('Too many requests. Please wait a minute and try again.', 429);
	}

	const { jobPosting, resume, includeCoverLetter, includeInterviewPrep } = await request.json();

	if (!jobPosting?.trim()) {
		return jsonError('No job posting provided', 400);
	}
	if (jobPosting.length > MAX_CHARS || (resume && resume.length > MAX_CHARS)) {
		return jsonError(`Input too long (max ${MAX_CHARS.toLocaleString()} characters each)`, 400);
	}

	const hasResume = !!resume?.trim();

	const stream = new ReadableStream({
		async start(controller) {
			const send = (event: DecodeEvent) => controller.enqueue(sseLine(event));

			let job: JobAnalysis | null = null;
			let fit: FitAnalysis | null = null;

			try {
				send({ type: 'step-start', step: 'job' });
				job = await streamJsonStep<JobAnalysis>(
					buildJobPrompt(jobPosting),
					MAX_TOKENS.job,
					(chunk) => send({ type: 'delta', step: 'job', text: chunk })
				);
				send({ type: 'step-complete', step: 'job', data: job });
			} catch (err: any) {
				send({ type: 'error', step: 'job', message: err.message || 'Job analysis failed' });
			}

			if (!job) {
				send({ type: 'done' });
				controller.close();
				return;
			}

			if (hasResume) {
				try {
					send({ type: 'step-start', step: 'fit' });
					fit = await streamJsonStep<FitAnalysis>(
						buildFitPrompt(jobPosting, job, resume),
						MAX_TOKENS.fit,
						(chunk) => send({ type: 'delta', step: 'fit', text: chunk })
					);
					send({ type: 'step-complete', step: 'fit', data: fit });
				} catch (err: any) {
					send({ type: 'error', step: 'fit', message: err.message || 'Fit analysis failed' });
				}
			} else {
				send({ type: 'step-skipped', step: 'fit', reason: 'No resume provided' });
			}

			if (includeCoverLetter) {
				if (fit) {
					try {
						send({ type: 'step-start', step: 'coverLetter' });
						const letter = await streamAgentCall(
							client,
							buildCoverLetterPrompt(jobPosting, job, fit, resume),
							MODEL,
							(chunk) => send({ type: 'delta', step: 'coverLetter', text: chunk }),
							MAX_TOKENS.coverLetter
						);
						send({ type: 'step-complete', step: 'coverLetter', data: { letter: letter.trim() } });
					} catch (err: any) {
						send({ type: 'error', step: 'coverLetter', message: err.message || 'Cover letter failed' });
					}
				} else {
					send({
						type: 'step-skipped',
						step: 'coverLetter',
						reason: 'Needs a successful fit analysis first'
					});
				}
			}

			if (includeInterviewPrep) {
				if (fit) {
					try {
						send({ type: 'step-start', step: 'interviewPrep' });
						const { items } = await streamJsonStep<{ items: InterviewPrepItem[] }>(
							buildInterviewPrepPrompt(jobPosting, job, fit, resume),
							MAX_TOKENS.interviewPrep,
							(chunk) => send({ type: 'delta', step: 'interviewPrep', text: chunk })
						);
						send({ type: 'step-complete', step: 'interviewPrep', data: { items } });
					} catch (err: any) {
						send({
							type: 'error',
							step: 'interviewPrep',
							message: err.message || 'Interview prep failed'
						});
					}
				} else {
					send({
						type: 'step-skipped',
						step: 'interviewPrep',
						reason: 'Needs a successful fit analysis first'
					});
				}
			}

			send({ type: 'done' });
			controller.close();
		}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'text/event-stream',
			'cache-control': 'no-cache',
			connection: 'keep-alive'
		}
	});
};
