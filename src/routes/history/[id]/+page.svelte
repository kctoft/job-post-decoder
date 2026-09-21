<script lang="ts">
	import '../../../app.css';
	import ResultsPanel from '$lib/components/results/ResultsPanel.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import { LocalStorageHistoryStore } from '$lib/storage/historyStore';
	import type { HistoryEntry } from '$lib/storage/historyStore';
	import { page } from '$app/state';

	const store = new LocalStorageHistoryStore();
	let entry = $state<HistoryEntry | null>(null);
	let loaded = $state(false);

	$effect(() => {
		const id = page.params.id;
		if (!id) return;
		loaded = false;
		store.get(id).then((e) => {
			entry = e;
			loaded = true;
		});
	});
</script>

<div class="page">
	<a href="/history" class="back">← Back to history</a>
	{#if !loaded}
		<p class="empty">Loading...</p>
	{:else if !entry}
		<Card style="text-align: center; color: var(--text-dim);" padding="40px 20px">Entry not found.</Card>
	{:else}
		<h1>{entry.roleTitle}</h1>
		<p class="date">{new Date(entry.createdAt).toLocaleString()}</p>
		<ResultsPanel
			job={entry.job}
			fit={entry.fit}
			coverLetter={entry.coverLetter}
			interviewPrep={entry.interviewPrep}
		/>
	{/if}
</div>

<style>
	.page {
		max-width: 1000px;
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
		font-size: 24px;
		font-weight: 700;
		margin-bottom: 4px;
	}
	.date {
		color: var(--text-dim);
		font-size: 13px;
		margin-bottom: 24px;
	}
	.empty {
		color: var(--text-dim);
		text-align: center;
		padding: 40px 0;
	}
</style>
