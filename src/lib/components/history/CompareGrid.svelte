<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { fitColor } from '$lib/client/fitColor';
	import { DENSITY_CONFIG, SALARY_CONFIG } from '$lib/types';
	import type { HistoryEntry } from '$lib/storage/historyStore';

	let { entries }: { entries: HistoryEntry[] } = $props();
</script>

<div class="grid" style="grid-template-columns: repeat({entries.length}, 1fr);">
	{#each entries as entry}
		<Card padding="20px" style="display: flex; flex-direction: column; gap: 12px;">
			<div class="title">{entry.roleTitle}</div>

			<div class="row">
				<span class="label">Fit score</span>
				{#if entry.fit}
					<span class="value" style="color: {fitColor(entry.fit.fitScore)};">{entry.fit.fitScore}</span>
				{:else}
					<span class="value dim">—</span>
				{/if}
			</div>
			<div class="col">
				<span class="label">Seniority</span>
				<span class="value sentence">{entry.job.seniorityLevel}</span>
			</div>
			<div class="row">
				<span class="label">Buzzwords</span>
				<span class="value tag" style="color: {DENSITY_CONFIG[entry.job.buzzwordDensity].color};">
					{entry.job.buzzwordDensity}
				</span>
			</div>
			<div class="row">
				<span class="label">Salary</span>
				<span class="value tag" style="color: {SALARY_CONFIG[entry.job.salaryTransparency].color};">
					{entry.job.salaryTransparency}
				</span>
			</div>
			<div class="row">
				<span class="label">Red flags</span>
				<span class="value">{entry.job.redFlags.length}</span>
			</div>
			{#if entry.fit}
				<div class="row">
					<span class="label">Matched</span>
					<span class="value">{entry.fit.matchedKeywords.length}</span>
				</div>
				<div class="row">
					<span class="label">Missing</span>
					<span class="value">{entry.fit.missingKeywords.length}</span>
				</div>
			{/if}

			<a class="link" href="/history/{entry.id}">View full analysis →</a>
		</Card>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		gap: 16px;
	}
	@media (max-width: 800px) {
		.grid {
			grid-template-columns: 1fr !important;
		}
	}
	.title {
		font-size: 14px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	.row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 13px;
		border-top: 1px solid var(--border);
		padding-top: 8px;
	}
	.col {
		display: flex;
		flex-direction: column;
		gap: 4px;
		font-size: 13px;
		border-top: 1px solid var(--border);
		padding-top: 8px;
	}
	.label {
		color: var(--text-dim);
	}
	.value {
		font-weight: 600;
	}
	.value.tag {
		font-size: 12px;
		text-transform: capitalize;
	}
	.value.sentence {
		font-size: 12px;
		font-weight: 400;
		color: var(--text-muted);
		line-height: 1.4;
	}
	.value.dim {
		color: var(--text-dim);
	}
	.link {
		color: var(--accent-light);
		text-decoration: none;
		font-size: 12px;
		margin-top: 8px;
	}
</style>
