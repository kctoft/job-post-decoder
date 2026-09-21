<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { InterviewPrepItem } from '$lib/types';

	let { items }: { items: InterviewPrepItem[] } = $props();
</script>

{#if items.length > 0}
	<section class="section">
		<SectionHeading
			text="Interview prep"
			subtext="Likely questions grounded in the gaps and red flags this posting surfaced, with talking points built from your real experience."
		/>
		{#each items as item}
			<Card padding="16px 20px" style="margin-bottom: 10px;">
				<div class="question">{item.question}</div>
				<div class="talking-point">{item.talkingPoint}</div>
				<div class="addresses">Addresses: {item.gapAddressed}</div>
			</Card>
		{/each}
	</section>
{/if}

<style>
	.section {
		margin-bottom: 24px;
	}
	.question {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 8px;
	}
	.talking-point {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.6;
		margin-bottom: 8px;
	}
	.addresses {
		font-size: 12px;
		color: var(--accent-light);
	}
</style>
