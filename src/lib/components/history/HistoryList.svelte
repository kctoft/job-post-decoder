<script lang="ts">
	import HistoryEntryCard from './HistoryEntryCard.svelte';
	import type { HistoryEntry } from '$lib/storage/historyStore';

	let {
		entries,
		selected,
		onToggleSelect,
		onDelete
	}: {
		entries: HistoryEntry[];
		selected: Set<string>;
		onToggleSelect: (id: string) => void;
		onDelete: (id: string) => void;
	} = $props();
</script>

{#each entries as entry (entry.id)}
	<HistoryEntryCard {entry} selected={selected.has(entry.id)} {onToggleSelect} {onDelete} />
{/each}
