<script lang="ts">
	import '../../app.css';
	import HistoryList from '$lib/components/history/HistoryList.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { LocalStorageHistoryStore } from '$lib/storage/historyStore';
	import type { HistoryEntry } from '$lib/storage/historyStore';
	import { goto } from '$app/navigation';

	const store = new LocalStorageHistoryStore();
	let entries = $state<HistoryEntry[]>([]);
	let selected = $state(new Set<string>());
	let loaded = $state(false);

	$effect(() => {
		store.list().then((list) => {
			entries = list;
			loaded = true;
		});
	});

	function toggleSelect(id: string) {
		const next = new Set(selected);
		if (next.has(id)) next.delete(id);
		else if (next.size < 4) next.add(id);
		selected = next;
	}

	async function deleteEntry(id: string) {
		await store.remove(id);
		entries = entries.filter((e) => e.id !== id);
		if (selected.has(id)) {
			const next = new Set(selected);
			next.delete(id);
			selected = next;
		}
	}

	async function clearAll() {
		if (!confirm('Delete all history? This cannot be undone.')) return;
		await store.clear();
		entries = [];
		selected = new Set();
	}

	function compareSelected() {
		goto(`/history/compare?ids=${[...selected].join(',')}`);
	}
</script>

<div class="page">
	<header>
		<a href="/" class="back">← Back</a>
		<h1>History</h1>
	</header>

	{#if !loaded}
		<p class="empty">Loading...</p>
	{:else if entries.length === 0}
		<Card style="text-align: center; color: var(--text-dim);" padding="40px 20px">
			No decodes yet. Run one from the home page — it'll show up here automatically.
		</Card>
	{:else}
		<div class="actions">
			<Button variant="pill" disabled={selected.size < 2} onclick={compareSelected}>
				Compare selected ({selected.size})
			</Button>
			<Button variant="pill" onclick={clearAll}>Clear all</Button>
			<span class="hint">Select 2-4 to compare</span>
		</div>
		<HistoryList {entries} {selected} onToggleSelect={toggleSelect} onDelete={deleteEntry} />
	{/if}
</div>

<style>
	.page {
		max-width: 800px;
		margin: 0 auto;
		padding: 24px 20px;
	}
	header {
		margin-bottom: 24px;
	}
	.back {
		color: var(--accent-light);
		text-decoration: none;
		font-size: 13px;
	}
	h1 {
		font-size: 28px;
		font-weight: 700;
		margin-top: 8px;
	}
	.empty {
		color: var(--text-dim);
		text-align: center;
		padding: 40px 0;
	}
	.actions {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-bottom: 16px;
	}
	.hint {
		font-size: 12px;
		color: var(--text-dim);
	}
</style>
