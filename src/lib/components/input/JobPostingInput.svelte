<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';

	let {
		value = $bindable(''),
		url = $bindable(''),
		fetchingUrl = false,
		urlError = '',
		onFetchUrl,
		onLoadExample
	}: {
		value: string;
		url: string;
		fetchingUrl?: boolean;
		urlError?: string;
		onFetchUrl: () => void;
		onLoadExample: () => void;
	} = $props();
</script>

<Card style="margin-bottom: 16px;">
	<div class="header">
		<label for="job-posting">Paste the job posting</label>
		<Button variant="pill" onclick={onLoadExample}>Load example</Button>
	</div>
	<textarea
		id="job-posting"
		bind:value
		placeholder="Paste the full job description here..."
		rows="12"
	></textarea>

	<div class="url-row">
		<span class="hint">or paste a link</span>
		<input
			bind:value={url}
			placeholder="https://jobs.example.com/posting/123"
			onkeydown={(e) => e.key === 'Enter' && onFetchUrl()}
		/>
		<Button variant="pill" onclick={onFetchUrl} disabled={fetchingUrl || !url.trim()}>
			{fetchingUrl ? 'Fetching...' : 'Fetch →'}
		</Button>
	</div>
	{#if urlError}
		<div class="error">{urlError}</div>
	{/if}
	<div class="note">
		Works best on Greenhouse, Lever, and Ashby-style postings. Some sites (LinkedIn, Indeed) block
		automated fetching — paste the text directly if it fails.
	</div>
</Card>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	label {
		font-weight: 600;
		font-size: 14px;
	}
	textarea,
	input {
		width: 100%;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 14px;
		color: var(--text);
		font-size: 13px;
		font-family: inherit;
		outline: none;
	}
	textarea {
		resize: vertical;
		line-height: 1.5;
	}
	textarea:focus,
	input:focus {
		border-color: var(--border-focus);
	}
	.url-row {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-top: 8px;
		padding-top: 12px;
		border-top: 1px solid var(--border);
	}
	.url-row input {
		flex: 1;
		padding: 8px 12px;
		width: auto;
	}
	.hint {
		font-size: 12px;
		color: var(--text-dim);
		flex-shrink: 0;
	}
	.error {
		font-size: 12px;
		color: #f87171;
		margin-top: 8px;
	}
	.note {
		font-size: 11px;
		color: var(--text-dim);
		margin-top: 6px;
	}
</style>
