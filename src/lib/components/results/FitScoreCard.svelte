<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { fitColor } from '$lib/client/fitColor';
	import type { FitAnalysis } from '$lib/types';

	let { fit }: { fit: FitAnalysis } = $props();
</script>

<Card style="margin-bottom: 16px; display: flex; gap: 24px; align-items: center;">
	<div class="circle" style="border-color: {fitColor(fit.fitScore)}; color: {fitColor(fit.fitScore)};">
		{fit.fitScore}
	</div>
	<div>
		<div class="title">Fit score</div>
		<div class="summary">{fit.fitSummary}</div>
	</div>
</Card>

<style>
	.circle {
		flex-shrink: 0;
		width: 88px;
		height: 88px;
		border-radius: 50%;
		border-width: 4px;
		border-style: solid;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 24px;
		font-weight: 700;
	}
	.title {
		font-size: 15px;
		font-weight: 600;
		margin-bottom: 4px;
	}
	.summary {
		font-size: 13px;
		color: var(--text-muted);
		line-height: 1.6;
	}
</style>
