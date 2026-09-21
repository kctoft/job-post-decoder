<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { SuggestedBullet } from '$lib/types';

	let { bullets }: { bullets: SuggestedBullet[] } = $props();
</script>

{#if bullets.length > 0}
	<section class="section">
		<SectionHeading text="Suggested resume bullets" />
		{#each bullets as sb}
			<Card padding="16px 20px" style="margin-bottom: 10px;">
				<div class="bullet">{sb.bullet}</div>
				<div class="targets">Targets: {sb.targets}</div>
			</Card>
		{/each}
	</section>
{/if}

<style>
	.section {
		margin-bottom: 24px;
	}
	.bullet {
		font-size: 14px;
		line-height: 1.6;
		margin-bottom: 8px;
	}
	.targets {
		font-size: 12px;
		color: var(--accent-light);
	}
</style>
