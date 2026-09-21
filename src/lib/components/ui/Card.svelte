<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		padding = '24px',
		accent,
		style = ''
	}: {
		children: Snippet;
		padding?: string;
		accent?: 'danger' | 'warning' | 'success';
		style?: string;
	} = $props();

	const accentColor: Record<string, string> = {
		danger: 'var(--danger)',
		warning: 'var(--warning)',
		success: 'var(--success)'
	};
</script>

<div
	class="card"
	style="padding: {padding}; {accent ? `border-left: 3px solid ${accentColor[accent]};` : ''} {style}"
>
	{@render children()}
</div>

<style>
	.card {
		background: var(--bg-card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
	}
</style>
