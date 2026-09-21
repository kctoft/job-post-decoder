import type { JobAnalysis, FitAnalysis } from '$lib/types';

const JSON_VALIDITY_RULE =
	'Critical formatting rule: this output will be parsed with JSON.parse(). Inside any JSON string value, never use a literal double-quote character — if you need to quote a word or phrase (e.g. a requirement like 5+ years), use single quotes instead. Do not wrap the JSON in markdown code fences.';

export function buildJobPrompt(jobPosting: string): string {
	return `You are a skeptical, experienced tech recruiter and hiring manager. Analyze this job posting and cut through the fluff to tell a candidate what the job actually is. Return ONLY valid JSON, no markdown, no code blocks.

JOB POSTING:
${jobPosting}

Return this exact JSON structure:
{
  "roleTitle": "<the job title and company, e.g. 'Senior Solutions Engineer @ Acme Cloud' — infer the company name from the posting if given>",
  "roleSummary": "<2-3 sentence plain-English summary of what this person will actually spend their day doing>",
  "seniorityLevel": "<your honest read on true seniority, e.g. 'Mid-level work dressed up as Senior' or 'Genuinely senior scope'>",
  "mustHaves": ["<hard requirement>", "..."],
  "niceToHaves": ["<soft/preferred requirement>", "..."],
  "redFlags": [{"flag": "<short red flag label>", "why": "<1 sentence why this is a concern>"}],
  "buzzwordDensity": "<low|medium|high>",
  "salaryTransparency": "<clear|vague|missing>"
}

Be direct and specific. Red flags to watch for: vague/missing salary, "wear many hats", "fast-paced" as a euphemism for understaffed, unrealistic combinations of seniority + requirements, excessive buzzwords ("rockstar", "ninja", "ninja-level", "ever-changing", "ever-evolving"), scope creep across multiple disciplines, unpaid trial work. If the posting is clean and reasonable, say so — don't invent red flags that aren't there.

${JSON_VALIDITY_RULE}`;
}

export function buildFitPrompt(jobPosting: string, job: JobAnalysis, resume: string): string {
	return `You are a career coach helping a candidate tailor their resume to a specific job. You've already extracted the real requirements from the job posting below. Now compare them against the candidate's resume and return ONLY valid JSON, no markdown, no code blocks.

JOB POSTING:
${jobPosting}

EXTRACTED REQUIREMENTS:
Must-haves: ${job.mustHaves.join('; ')}
Nice-to-haves: ${job.niceToHaves.join('; ')}

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

Rules: never invent experience, metrics, or skills the resume doesn't support — only rephrase or resurface what's already there. If a missing keyword truly isn't supported by anything in the resume, list it in missingKeywords but do not force a bullet for it. priorityGaps is the top 5 (at most) missing keywords ranked by how much they matter for this role, each backed by a real quoted snippet from the job posting — this is the "if you fix nothing else, fix these" list. Aim for 3-5 suggested bullets.

${JSON_VALIDITY_RULE}`;
}

export function buildCoverLetterPrompt(
	jobPosting: string,
	job: JobAnalysis,
	fit: FitAnalysis,
	resume: string
): string {
	return `You are a career coach drafting a cover letter for a candidate. Write a complete, ready-to-send cover letter — plain text only, no markdown, no JSON, no commentary before or after the letter itself.

JOB POSTING:
${jobPosting}

ROLE: ${job.roleTitle}

CANDIDATE'S RESUME:
${resume}

WHAT WE ALREADY KNOW ABOUT THIS CANDIDATE'S FIT:
Matched strengths: ${fit.matchedKeywords.join('; ')}
Fit summary: ${fit.fitSummary}

Write a 250-350 word cover letter that:
- References 2-3 concrete specifics from the resume that map directly to what this posting asks for — never invent experience, metrics, or skills the resume doesn't support
- Sounds like a specific person wrote it for this specific role, not a generic template
- If the posting doesn't name a hiring manager, omit the salutation line entirely rather than writing a "[Hiring Manager Name]" placeholder
- Ends with a brief, confident closing — no "I look forward to hearing from you" cliché

Output only the letter text.`;
}

export function buildInterviewPrepPrompt(
	jobPosting: string,
	job: JobAnalysis,
	fit: FitAnalysis,
	resume: string
): string {
	return `You are a career coach preparing a candidate for an interview. Based on the specific gaps and red flags already identified for this role, generate likely interview questions and how the candidate should honestly address them. Return ONLY valid JSON, no markdown, no code blocks.

JOB POSTING:
${jobPosting}

CANDIDATE'S RESUME:
${resume}

PRIORITY GAPS ALREADY IDENTIFIED (fix-these-first list):
${(fit.priorityGaps ?? []).map((g) => `- ${g.keyword}: ${g.whyItMatters}`).join('\n') || 'None identified.'}

RED FLAGS ALREADY IDENTIFIED IN THE POSTING:
${job.redFlags.map((r) => `- ${r.flag}: ${r.why}`).join('\n') || 'None identified.'}

Return this exact JSON structure:
{
  "items": [{"question": "<a likely interview question probing one of the gaps above>", "talkingPoint": "<how the candidate should honestly answer, using ONLY real experience already in their resume — never invent metrics or experience>", "gapAddressed": "<which specific gap or red flag this question/answer targets>"}]
}

Generate 4-6 items. Focus on questions that probe the priority gaps (how to honestly address a shortfall) and, where relevant, questions the candidate might want to ask back to probe a red flag in the posting. Every talking point must be traceable to something actually in the resume.

${JSON_VALIDITY_RULE}`;
}
