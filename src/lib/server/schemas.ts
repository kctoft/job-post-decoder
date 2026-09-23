import { z } from 'zod';

// Runtime validation for what the model claims is JSON. `extractJson()` only proves the
// text parses as JSON — it says nothing about whether the shape matches what the rest of
// the pipeline assumes. Without this, a response missing/renaming a field (e.g. no
// `mustHaves`) parses fine here and then crashes a *later* step or component instead of
// failing where the bad data actually came from.

export const redFlagSchema = z.object({
	flag: z.string(),
	why: z.string()
});

export const jobAnalysisSchema = z.object({
	roleTitle: z.string(),
	roleSummary: z.string(),
	seniorityLevel: z.string(),
	mustHaves: z.array(z.string()),
	niceToHaves: z.array(z.string()),
	redFlags: z.array(redFlagSchema),
	buzzwordDensity: z.enum(['low', 'medium', 'high']),
	salaryTransparency: z.enum(['clear', 'vague', 'missing'])
});

export const priorityGapSchema = z.object({
	keyword: z.string(),
	evidence: z.string(),
	whyItMatters: z.string()
});

export const suggestedBulletSchema = z.object({
	bullet: z.string(),
	targets: z.string()
});

export const fitAnalysisSchema = z.object({
	fitScore: z.number().min(0).max(100),
	fitSummary: z.string(),
	matchedKeywords: z.array(z.string()),
	missingKeywords: z.array(z.string()),
	priorityGaps: z.array(priorityGapSchema).optional(),
	suggestedBullets: z.array(suggestedBulletSchema)
});

export const interviewPrepItemSchema = z.object({
	question: z.string(),
	talkingPoint: z.string(),
	gapAddressed: z.string()
});

export const interviewPrepResultSchema = z.object({
	items: z.array(interviewPrepItemSchema)
});
