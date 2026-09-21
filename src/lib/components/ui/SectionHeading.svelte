<script lang="ts">
	let {
		text,
		subtext,
		size = 'md'
	}: {
		text: string;
		subtext?: string;
		size?: 'sm' | 'md';
	} = $props();
</script>

<h2 class="heading" class:sm={size === 'sm'} class:has-subtext={!!subtext}>{text}</h2>
{#if subtext}
	<p class="subtext">{subtext}</p>
{/if}

<style>
	.heading {
		font-size: 16px;
		font-weight: 600;
		margin-bottom: 12px;
		color: var(--text);
	}
	.heading.sm {
		font-size: 14px;
	}
	.heading.has-subtext {
		margin-bottom: 4px;
	}
	.subtext {
		font-size: 12px;
		color: var(--text-dim);
		margin-bottom: 12px;
	}
</style>
