<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';
	import type { JobAnalysis } from '$lib/types';

	let { job }: { job: JobAnalysis } = $props();
</script>

<div class="two-col-grid" style="margin-bottom: 16px;">
	<Card padding="20px">
		<SectionHeading text="Must-haves" size="sm" />
		<ul>
			{#each job.mustHaves as item}
				<li class="must">{item}</li>
			{/each}
		</ul>
	</Card>
	<Card padding="20px">
		<SectionHeading text="Nice-to-haves" size="sm" />
		<ul>
			{#each job.niceToHaves as item}
				<li class="nice">{item}</li>
			{/each}
		</ul>
	</Card>
</div>

<style>
	ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	li {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.5;
		padding-left: 16px;
		position: relative;
	}
	li::before {
		content: '•';
		position: absolute;
		left: 0;
	}
	li.must::before {
		color: var(--accent-light);
	}
	li.nice::before {
		color: var(--text-dim);
	}
</style>
