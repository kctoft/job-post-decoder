<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { RedFlag } from '$lib/types';

	let { redFlags }: { redFlags: RedFlag[] } = $props();
</script>

{#if redFlags.length > 0}
	<section class="section">
		<SectionHeading text="Red flags" />
		{#each redFlags as rf}
			<Card accent="danger" padding="16px 20px" style="margin-bottom: 10px;">
				<div class="flag">{rf.flag}</div>
				<div class="why">{rf.why}</div>
			</Card>
		{/each}
	</section>
{:else}
	<Card
		style="margin-bottom: 24px; text-align: center; color: #4ade80; background: rgba(34,197,94,0.1); border-color: rgba(34,197,94,0.3);"
		padding="16px 20px"
	>
		No red flags detected — this posting reads clean.
	</Card>
{/if}

<style>
	.section {
		margin-bottom: 24px;
	}
	.flag {
		font-size: 14px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.why {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.5;
	}
</style>
