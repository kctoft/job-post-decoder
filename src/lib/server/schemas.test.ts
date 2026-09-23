import { describe, it, expect } from 'vitest';
import {
	jobAnalysisSchema,
	fitAnalysisSchema,
	interviewPrepResultSchema
} from './schemas';

const VALID_JOB = {
	roleTitle: 'Senior Widget Engineer @ Acme',
	roleSummary: 'Builds widgets.',
	seniorityLevel: 'Genuinely senior scope',
	mustHaves: ['5+ years widget experience'],
	niceToHaves: ['Kubernetes'],
	redFlags: [{ flag: 'No salary range', why: 'Comp is hidden.' }],
	buzzwordDensity: 'medium',
	salaryTransparency: 'missing'
};

const VALID_FIT = {
	fitScore: 72,
	fitSummary: 'Strong technical match.',
	matchedKeywords: ['Rust'],
	missingKeywords: ['5+ years widget experience'],
	priorityGaps: [
		{ keyword: '5+ years widget experience', evidence: 'quoted text', whyItMatters: 'headline requirement' }
	],
	suggestedBullets: [{ bullet: 'Built widgets in Rust.', targets: '5+ years widget experience' }]
};

describe('jobAnalysisSchema', () => {
	it('accepts a well-formed job analysis', () => {
		expect(() => jobAnalysisSchema.parse(VALID_JOB)).not.toThrow();
	});

	it('rejects a response missing a required field (e.g. mustHaves dropped)', () => {
		const { mustHaves, ...withoutMustHaves } = VALID_JOB;
		expect(() => jobAnalysisSchema.parse(withoutMustHaves)).toThrow();
	});

	it('rejects a buzzwordDensity value outside the enum', () => {
		expect(() => jobAnalysisSchema.parse({ ...VALID_JOB, buzzwordDensity: 'extreme' })).toThrow();
	});

	it('rejects redFlags entries missing the why field', () => {
		expect(() =>
			jobAnalysisSchema.parse({ ...VALID_JOB, redFlags: [{ flag: 'No salary range' }] })
		).toThrow();
	});
});

describe('fitAnalysisSchema', () => {
	it('accepts a well-formed fit analysis, priorityGaps included', () => {
		expect(() => fitAnalysisSchema.parse(VALID_FIT)).not.toThrow();
	});

	it('accepts a fit analysis with priorityGaps omitted (optional field)', () => {
		const { priorityGaps, ...withoutGaps } = VALID_FIT;
		expect(() => fitAnalysisSchema.parse(withoutGaps)).not.toThrow();
	});

	it('rejects a fitScore outside 0-100', () => {
		expect(() => fitAnalysisSchema.parse({ ...VALID_FIT, fitScore: 140 })).toThrow();
	});

	it('rejects a fitScore that is not a number (e.g. model returns a string)', () => {
		expect(() => fitAnalysisSchema.parse({ ...VALID_FIT, fitScore: '72' })).toThrow();
	});
});

describe('interviewPrepResultSchema', () => {
	it('accepts a well-formed items array', () => {
		const result = {
			items: [{ question: 'Q?', talkingPoint: 'Answer honestly.', gapAddressed: 'tenure gap' }]
		};
		expect(() => interviewPrepResultSchema.parse(result)).not.toThrow();
	});

	it('rejects a response missing the items wrapper', () => {
		expect(() =>
			interviewPrepResultSchema.parse([{ question: 'Q?', talkingPoint: 'A', gapAddressed: 'x' }])
		).toThrow();
	});

	it('rejects an item missing gapAddressed', () => {
		expect(() =>
			interviewPrepResultSchema.parse({ items: [{ question: 'Q?', talkingPoint: 'A' }] })
		).toThrow();
	});
});
