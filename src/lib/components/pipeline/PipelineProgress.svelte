<script lang="ts">
	import type { PipelineStep, StepStatus } from '$lib/types';

	let {
		steps
	}: {
		steps: { step: PipelineStep; label: string; status: StepStatus }[];
	} = $props();

	const ICONS: Record<StepStatus, string> = {
		pending: '○',
		streaming: '◐',
		complete: '✓',
		skipped: '—',
		error: '✕'
	};
</script>

<div class="progress">
	{#each steps as s, i (s.step)}
		<div class="step {s.status}">
			<span class="icon">{ICONS[s.status]}</span>
			<span class="label">{s.label}</span>
		</div>
		{#if i < steps.length - 1}
			<div class="connector"></div>
		{/if}
	{/each}
</div>

<style>
	.progress {
		display: flex;
		align-items: center;
		margin-bottom: 16px;
		flex-wrap: wrap;
		gap: 4px;
	}
	.step {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		padding: 6px 12px;
		border-radius: 20px;
		background: var(--bg-card);
		border: 1px solid var(--border);
		color: var(--text-dim);
	}
	.step.streaming {
		border-color: var(--accent);
		color: var(--accent-light);
	}
	.step.complete {
		border-color: var(--success);
		color: var(--success);
	}
	.step.error {
		border-color: var(--danger);
		color: var(--danger);
	}
	.step.skipped {
		opacity: 0.4;
	}
	.step.streaming .icon {
		display: inline-block;
		animation: pulse 1s infinite;
	}
	.connector {
		width: 16px;
		height: 1px;
		background: var(--border);
	}
	@keyframes pulse {
		0%,
		100% {
			opacity: 1;
		}
		50% {
			opacity: 0.3;
		}
	}
</style>
