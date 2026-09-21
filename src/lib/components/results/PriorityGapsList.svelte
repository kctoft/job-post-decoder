<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { PriorityGap } from '$lib/types';

	let { gaps }: { gaps: PriorityGap[] } = $props();
</script>

{#if gaps.length > 0}
	<section class="section">
		<SectionHeading
			text="Top {gaps.length} gaps to fix first"
			subtext="Ranked by importance, each grounded in a real quote from the posting."
		/>
		{#each gaps as gap, i}
			<Card accent="warning" padding="16px 20px" style="margin-bottom: 10px;">
				<div class="header">
					<span class="rank">{i + 1}</span>
					<span class="keyword">{gap.keyword}</span>
				</div>
				<div class="evidence">"{gap.evidence}"</div>
				<div class="why">{gap.whyItMatters}</div>
			</Card>
		{/each}
	</section>
{/if}

<style>
	.section {
		margin-bottom: 24px;
	}
	.header {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
	}
	.rank {
		background: rgba(245, 158, 11, 0.15);
		color: var(--warning);
		font-size: 11px;
		font-weight: 700;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	.keyword {
		font-size: 14px;
		font-weight: 600;
	}
	.evidence {
		background: var(--bg-input);
		border-radius: 6px;
		padding: 10px 14px;
		margin-bottom: 10px;
		font-size: 12px;
		color: var(--text-muted);
		font-style: italic;
	}
	.why {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.5;
	}
</style>
