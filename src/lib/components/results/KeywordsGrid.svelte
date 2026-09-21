<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { FitAnalysis } from '$lib/types';

	let { fit }: { fit: FitAnalysis } = $props();
</script>

<div class="two-col-grid" style="margin-bottom: 24px;">
	<Card padding="20px">
		<SectionHeading text="You've got these covered" size="sm" />
		<div class="chips">
			{#each fit.matchedKeywords as kw}
				<span class="chip matched">{kw}</span>
			{/each}
		</div>
	</Card>
	<Card padding="20px">
		<SectionHeading text="Missing from your resume" size="sm" />
		<div class="chips">
			{#each fit.missingKeywords as kw}
				<span class="chip missing">{kw}</span>
			{/each}
		</div>
	</Card>
</div>

<style>
	.chips {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.chip {
		font-size: 12px;
		padding: 4px 10px;
		border-radius: 14px;
	}
	.chip.matched {
		background: rgba(34, 197, 94, 0.1);
		color: #4ade80;
	}
	.chip.missing {
		background: rgba(239, 68, 68, 0.1);
		color: #f87171;
	}
</style>
