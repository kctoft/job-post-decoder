<script lang="ts">
	import '../../../app.css';
	import CompareGrid from '$lib/components/history/CompareGrid.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { LocalStorageHistoryStore } from '$lib/storage/historyStore';
	import type { HistoryEntry } from '$lib/storage/historyStore';
	import { page } from '$app/state';

	const store = new LocalStorageHistoryStore();
	let entries = $state<HistoryEntry[]>([]);
	let loaded = $state(false);

	$effect(() => {
		const ids = (page.url.searchParams.get('ids') ?? '').split(',').filter(Boolean).slice(0, 4);
		loaded = false;
		Promise.all(ids.map((id) => store.get(id))).then((results) => {
			entries = results.filter((e): e is HistoryEntry => e !== null);
			loaded = true;
		});
	});
</script>

<div class="page">
	<a href="/history" class="back">← Back to history</a>
	<h1>Compare</h1>

	{#if !loaded}
		<p class="empty">Loading...</p>
	{:else if entries.length < 2}
		<Card style="text-align: center; color: var(--text-dim);" padding="40px 20px">
			Couldn't find enough entries to compare. Go back and select 2-4 from your history.
		</Card>
	{:else}
		<CompareGrid {entries} />
	{/if}
</div>

<style>
	.page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 24px 20px;
	}
	.back {
		color: var(--accent-light);
		text-decoration: none;
		font-size: 13px;
		display: inline-block;
		margin-bottom: 16px;
	}
	h1 {
		font-size: 28px;
		font-weight: 700;
		margin-bottom: 24px;
	}
	.empty {
		color: var(--text-dim);
		text-align: center;
		padding: 40px 0;
	}
</style>
