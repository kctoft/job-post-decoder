<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { DENSITY_CONFIG, SALARY_CONFIG } from '$lib/types';
	import type { JobAnalysis } from '$lib/types';

	let { job }: { job: JobAnalysis } = $props();
</script>

<Card style="margin-bottom: 16px;">
	<div class="summary">{job.roleSummary}</div>
	<div class="badges">
		<Badge label={job.seniorityLevel} />
		<Badge
			label={DENSITY_CONFIG[job.buzzwordDensity].label}
			color={DENSITY_CONFIG[job.buzzwordDensity].color}
			bg={DENSITY_CONFIG[job.buzzwordDensity].bg}
		/>
		<Badge
			label={SALARY_CONFIG[job.salaryTransparency].label}
			color={SALARY_CONFIG[job.salaryTransparency].color}
			bg={SALARY_CONFIG[job.salaryTransparency].bg}
		/>
	</div>
</Card>

<style>
	.summary {
		font-size: 15px;
		line-height: 1.7;
		margin-bottom: 16px;
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
</style>
