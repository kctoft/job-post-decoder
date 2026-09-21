<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import { fitColor } from '$lib/client/fitColor';
	import type { HistoryEntry } from '$lib/storage/historyStore';

	let {
		entry,
		selected = false,
		onToggleSelect,
		onDelete
	}: {
		entry: HistoryEntry;
		selected?: boolean;
		onToggleSelect: (id: string) => void;
		onDelete: (id: string) => void;
	} = $props();

	const date = $derived(
		new Date(entry.createdAt).toLocaleDateString(undefined, {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		})
	);
</script>

<Card padding="16px 20px" style="margin-bottom: 10px; display: flex; align-items: center; gap: 16px;">
	<input
		type="checkbox"
		checked={selected}
		onchange={() => onToggleSelect(entry.id)}
		aria-label="Select {entry.roleTitle} for comparison"
	/>
	<a class="title" href="/history/{entry.id}">{entry.roleTitle}</a>
	<span class="date">{date}</span>
	{#if entry.fit}
		<span
			class="score"
			style="color: {fitColor(entry.fit.fitScore)}; border-color: {fitColor(entry.fit.fitScore)};"
		>
			{entry.fit.fitScore}
		</span>
	{/if}
	<button class="delete" onclick={() => onDelete(entry.id)} aria-label="Delete {entry.roleTitle}">✕</button>
</Card>

<style>
	.title {
		flex: 1;
		min-width: 0;
		color: var(--text);
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.title:hover {
		color: var(--accent-light);
	}
	.date {
		font-size: 12px;
		color: var(--text-dim);
		flex-shrink: 0;
	}
	.score {
		flex-shrink: 0;
		font-size: 12px;
		font-weight: 700;
		border: 2px solid;
		border-radius: 50%;
		width: 28px;
		height: 28px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.delete {
		background: none;
		border: none;
		color: var(--text-dim);
		cursor: pointer;
		font-size: 14px;
		flex-shrink: 0;
	}
	.delete:hover {
		color: var(--danger);
	}
</style>
