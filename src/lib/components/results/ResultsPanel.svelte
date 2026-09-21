<script lang="ts">
	import RoleSummaryCard from './RoleSummaryCard.svelte';
	import RequirementsGrid from './RequirementsGrid.svelte';
	import RedFlagsList from './RedFlagsList.svelte';
	import FitScoreCard from './FitScoreCard.svelte';
	import KeywordsGrid from './KeywordsGrid.svelte';
	import PriorityGapsList from './PriorityGapsList.svelte';
	import SuggestedBulletsList from './SuggestedBulletsList.svelte';
	import CoverLetterCard from './CoverLetterCard.svelte';
	import InterviewPrepList from './InterviewPrepList.svelte';
	import type { JobAnalysis, FitAnalysis, InterviewPrepItem } from '$lib/types';

	let {
		job,
		fit = null,
		coverLetter = null,
		interviewPrep = null
	}: {
		job: JobAnalysis;
		fit?: FitAnalysis | null;
		coverLetter?: string | null;
		interviewPrep?: InterviewPrepItem[] | null;
	} = $props();
</script>

<RoleSummaryCard {job} />
<RequirementsGrid {job} />
<RedFlagsList redFlags={job.redFlags} />

{#if fit}
	<FitScoreCard {fit} />
	<KeywordsGrid {fit} />
	{#if fit.priorityGaps?.length}
		<PriorityGapsList gaps={fit.priorityGaps} />
	{/if}
	<SuggestedBulletsList bullets={fit.suggestedBullets} />
{/if}

{#if coverLetter}
	<CoverLetterCard letter={coverLetter} />
{/if}

{#if interviewPrep?.length}
	<InterviewPrepList items={interviewPrep} />
{/if}
