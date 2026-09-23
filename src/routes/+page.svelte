<script lang="ts">
	import '../app.css';
	import JobPostingInput from '$lib/components/input/JobPostingInput.svelte';
	import ResumeInput from '$lib/components/input/ResumeInput.svelte';
	import DecodeSubmitBar from '$lib/components/input/DecodeSubmitBar.svelte';
	import PipelineProgress from '$lib/components/pipeline/PipelineProgress.svelte';
	import StreamingStepPanel from '$lib/components/pipeline/StreamingStepPanel.svelte';
	import ResultsPanel from '$lib/components/results/ResultsPanel.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { EXAMPLE_JOB, EXAMPLE_RESUME } from '$lib/types';
	import type { JobAnalysis, FitAnalysis, InterviewPrepItem, PipelineStep, StepStatus } from '$lib/types';
	import { streamDecode } from '$lib/client/decodeStream';
	import { LocalStorageHistoryStore } from '$lib/storage/historyStore';

	let jobPosting = $state('');
	let resume = $state('');

	let jobUrl = $state('');
	let fetchingUrl = $state(false);
	let urlError = $state('');

	let includeCoverLetter = $state(false);
	let includeInterviewPrep = $state(false);

	let loading = $state(false);
	let error = $state('');
	let hasResumeAtSubmit = $state(false);

	let job = $state<JobAnalysis | null>(null);
	let fit = $state<FitAnalysis | null>(null);
	let coverLetter = $state<string | null>(null);
	let interviewPrep = $state<InterviewPrepItem[] | null>(null);

	let activeSteps = $state<{ step: PipelineStep; label: string }[]>([]);
	let stepStatus = $state<Record<string, StepStatus>>({});
	let streamingStep = $state<PipelineStep | null>(null);
	let streamingText = $state<Record<string, string>>({});
	let stepErrorMessage = $state<Record<string, string>>({});

	const hasFailure = $derived(!!error || Object.values(stepStatus).includes('error'));

	const STEP_LABELS: Record<PipelineStep, string> = {
		job: 'Job analysis',
		fit: 'Fit score',
		coverLetter: 'Cover letter',
		interviewPrep: 'Interview prep'
	};

	async function fetchJobFromUrl() {
		if (!jobUrl.trim()) return;
		fetchingUrl = true;
		urlError = '';
		try {
			const res = await fetch('/api/fetch-url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: jobUrl.trim() })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(body.error || 'Could not fetch that URL');
			jobPosting = body.text;
		} catch (e: any) {
			urlError = e.message || 'Could not fetch that URL';
		} finally {
			fetchingUrl = false;
		}
	}

	async function runDecode() {
		if (!jobPosting.trim()) return;

		loading = true;
		error = '';
		job = null;
		fit = null;
		coverLetter = null;
		interviewPrep = null;
		streamingStep = null;
		streamingText = {};
		stepErrorMessage = {};

		const resumeGiven = !!resume.trim();
		hasResumeAtSubmit = resumeGiven;
		const wantCoverLetter = resumeGiven && includeCoverLetter;
		const wantInterviewPrep = resumeGiven && includeInterviewPrep;

		const steps: { step: PipelineStep; label: string }[] = [{ step: 'job', label: STEP_LABELS.job }];
		if (resumeGiven) steps.push({ step: 'fit', label: STEP_LABELS.fit });
		if (wantCoverLetter) steps.push({ step: 'coverLetter', label: STEP_LABELS.coverLetter });
		if (wantInterviewPrep) steps.push({ step: 'interviewPrep', label: STEP_LABELS.interviewPrep });
		activeSteps = steps;
		stepStatus = Object.fromEntries(steps.map((s) => [s.step, 'pending' as StepStatus]));

		try {
			for await (const ev of streamDecode({
				jobPosting,
				resume,
				includeCoverLetter: wantCoverLetter,
				includeInterviewPrep: wantInterviewPrep
			})) {
				switch (ev.type) {
					case 'step-start':
						stepStatus[ev.step] = 'streaming';
						streamingStep = ev.step;
						streamingText[ev.step] = '';
						break;
					case 'step-retry':
						// A malformed/wrong-shaped response is being retried with a fresh
						// generation — clear the panel so attempt 2's output doesn't run on
						// from attempt 1's instead of replacing it.
						streamingText[ev.step] = '';
						break;
					case 'delta':
						streamingText[ev.step] = (streamingText[ev.step] ?? '') + ev.text;
						break;
					case 'step-complete':
						stepStatus[ev.step] = 'complete';
						if (streamingStep === ev.step) streamingStep = null;
						if (ev.step === 'job') job = ev.data;
						else if (ev.step === 'fit') fit = ev.data;
						else if (ev.step === 'coverLetter') coverLetter = ev.data.letter;
						else if (ev.step === 'interviewPrep') interviewPrep = ev.data.items;
						break;
					case 'step-skipped':
						if (ev.step in stepStatus) stepStatus[ev.step] = 'skipped';
						break;
					case 'error':
						if (ev.step) {
							stepStatus[ev.step] = 'error';
							stepErrorMessage[ev.step] = ev.message;
							if (streamingStep === ev.step) streamingStep = null;
						}
						if (!ev.step || ev.step === 'job') error = ev.message;
						break;
				}
			}

			if (job) {
				const store = new LocalStorageHistoryStore();
				await store.save({
					id: crypto.randomUUID(),
					createdAt: new Date().toISOString(),
					roleTitle: job.roleTitle,
					jobPosting,
					job,
					fit,
					coverLetter,
					interviewPrep,
					hasResume: resumeGiven
				});
			}
		} catch (e: any) {
			// The stream itself broke (dropped connection, server crash mid-decode) rather
			// than a single step reporting its own error — whichever step was mid-flight
			// would otherwise stay stuck showing "streaming" forever next to this message.
			if (streamingStep) {
				stepStatus[streamingStep] = 'error';
				stepErrorMessage[streamingStep] = e.message || 'Connection lost';
				streamingStep = null;
			}
			error = e.message || 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function loadExample() {
		jobPosting = EXAMPLE_JOB;
	}

	function loadExampleResume() {
		resume = EXAMPLE_RESUME;
	}
</script>

<div class="page">
	<header>
		<div class="nav">
			<a href="/history">History →</a>
		</div>
		<h1>Job Post Decoder</h1>
		<p>
			Paste a job posting. Watch the pipeline decode it step by step, then get a fit score, a cover
			letter, and interview prep — all grounded in your real resume.
		</p>
	</header>

	<JobPostingInput
		bind:value={jobPosting}
		bind:url={jobUrl}
		{fetchingUrl}
		{urlError}
		onFetchUrl={fetchJobFromUrl}
		onLoadExample={loadExample}
	/>

	<ResumeInput bind:value={resume} onLoadExample={loadExampleResume} />

	<DecodeSubmitBar
		{loading}
		disabled={!jobPosting.trim()}
		bind:includeCoverLetter
		bind:includeInterviewPrep
		hasResume={!!resume.trim()}
		onSubmit={runDecode}
	/>

	{#if error}
		<Card style="margin-bottom: 24px; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.3); color: #f87171;">
			{error}
		</Card>
	{/if}

	{#if activeSteps.length > 0 && (loading || job)}
		<PipelineProgress steps={activeSteps.map((s) => ({ ...s, status: stepStatus[s.step] ?? 'pending' }))} />
	{/if}

	{#if streamingStep}
		<StreamingStepPanel text={streamingText[streamingStep] ?? ''} label={STEP_LABELS[streamingStep]} />
	{/if}

	{#each Object.entries(stepErrorMessage) as [step, message]}
		<Card style="margin-bottom: 16px; background: rgba(239,68,68,0.08); border-color: rgba(239,68,68,0.25); color: #f87171; font-size: 13px;" padding="12px 16px">
			{STEP_LABELS[step as PipelineStep]} failed: {message}
		</Card>
	{/each}

	{#if hasFailure && !loading}
		<div class="retry-row">
			<Button variant="pill" onclick={runDecode}>↻ Try again</Button>
		</div>
	{/if}

	{#if job}
		<ResultsPanel {job} {fit} {coverLetter} {interviewPrep} />
	{/if}

	{#if job && hasResumeAtSubmit === false && !loading}
		<Card style="margin-bottom: 24px; text-align: center; color: var(--text-dim); font-size: 13px;" padding="20px">
			Add your resume above and re-run to get a fit score, tailored bullets, and (optionally) a cover
			letter and interview prep.
		</Card>
	{/if}

	<footer>
		Built by <a href="https://kitanatoft.com">Kitana Toft</a> · Powered by Claude API
	</footer>
</div>

<style>
	.retry-row {
		margin-bottom: 16px;
	}
	.page {
		max-width: 1000px;
		margin: 0 auto;
		padding: 24px 20px;
	}
	.nav {
		text-align: right;
		margin-bottom: 8px;
	}
	.nav a {
		color: var(--accent-light);
		text-decoration: none;
		font-size: 13px;
		font-weight: 600;
	}
	header {
		text-align: center;
		padding: 8px 0 32px;
	}
	h1 {
		font-size: 32px;
		font-weight: 700;
		background: linear-gradient(135deg, #818cf8, #6366f1, #ec4899);
		-webkit-background-clip: text;
		background-clip: text;
		-webkit-text-fill-color: transparent;
	}
	header p {
		color: var(--text-muted);
		font-size: 16px;
		margin-top: 8px;
	}
	footer {
		text-align: center;
		padding: 32px 0 24px;
		color: var(--text-dim);
		font-size: 13px;
	}
	footer a {
		color: var(--accent-light);
		text-decoration: none;
	}
</style>
