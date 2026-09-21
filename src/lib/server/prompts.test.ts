import { describe, it, expect } from 'vitest';
import { buildJobPrompt, buildFitPrompt, buildCoverLetterPrompt, buildInterviewPrepPrompt } from './prompts';
import type { JobAnalysis, FitAnalysis } from '$lib/types';

const JOB: JobAnalysis = {
	roleTitle: 'Senior Widget Engineer @ Acme',
	roleSummary: 'Builds widgets.',
	seniorityLevel: 'Genuinely senior scope',
	mustHaves: ['5+ years widget experience', 'Rust'],
	niceToHaves: ['Kubernetes'],
	redFlags: [{ flag: 'No salary range', why: 'Comp is hidden.' }],
	buzzwordDensity: 'medium',
	salaryTransparency: 'missing'
};

const FIT: FitAnalysis = {
	fitScore: 72,
	fitSummary: 'Strong technical match.',
	matchedKeywords: ['Rust'],
	missingKeywords: ['5+ years widget experience'],
	priorityGaps: [
		{
			keyword: '5+ years widget experience',
			evidence: '5+ years widget experience',
			whyItMatters: 'It is the headline requirement.'
		}
	],
	suggestedBullets: [{ bullet: 'Built widgets in Rust.', targets: '5+ years widget experience' }]
};

describe('buildJobPrompt', () => {
	it('interpolates the raw job posting text', () => {
		const prompt = buildJobPrompt('POSTING TEXT HERE');
		expect(prompt).toContain('POSTING TEXT HERE');
	});

	it('asks for a roleTitle field in the JSON structure', () => {
		expect(buildJobPrompt('x')).toContain('"roleTitle"');
	});
});

describe('buildFitPrompt', () => {
	it('interpolates the posting, extracted requirements, and resume', () => {
		const prompt = buildFitPrompt('POSTING TEXT', JOB, 'RESUME TEXT');
		expect(prompt).toContain('POSTING TEXT');
		expect(prompt).toContain('RESUME TEXT');
		expect(prompt).toContain('5+ years widget experience');
		expect(prompt).toContain('Kubernetes');
	});

	it('asks for a priorityGaps field', () => {
		expect(buildFitPrompt('x', JOB, 'y')).toContain('priorityGaps');
	});
});

describe('buildCoverLetterPrompt', () => {
	it('interpolates job, resume, and fit summary and asks for plain text output', () => {
		const prompt = buildCoverLetterPrompt('POSTING TEXT', JOB, FIT, 'RESUME TEXT');
		expect(prompt).toContain('POSTING TEXT');
		expect(prompt).toContain('RESUME TEXT');
		expect(prompt).toContain('Strong technical match.');
		expect(prompt.toLowerCase()).toContain('plain text');
	});

	it('instructs the model never to invent experience', () => {
		expect(buildCoverLetterPrompt('x', JOB, FIT, 'y')).toMatch(/never invent/i);
	});
});

describe('buildInterviewPrepPrompt', () => {
	it('grounds the prompt in priority gaps and red flags already identified', () => {
		const prompt = buildInterviewPrepPrompt('POSTING TEXT', JOB, FIT, 'RESUME TEXT');
		expect(prompt).toContain('5+ years widget experience');
		expect(prompt).toContain('No salary range');
	});

	it('asks for a JSON items array', () => {
		expect(buildInterviewPrepPrompt('x', JOB, FIT, 'y')).toContain('"items"');
	});

	it('handles a fit analysis with no priority gaps gracefully', () => {
		const fitWithoutGaps: FitAnalysis = { ...FIT, priorityGaps: undefined };
		const prompt = buildInterviewPrepPrompt('x', JOB, fitWithoutGaps, 'y');
		expect(prompt).toContain('None identified.');
	});
});
