<script lang="ts">
	let { text, label }: { text: string; label: string } = $props();
</script>

<div class="panel">
	<div class="header">
		<span class="dot"></span>
		{label}
	</div>
	<pre>{text}<span class="cursor"></span></pre>
</div>

<style>
	.panel {
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		padding: 16px;
		margin-bottom: 16px;
		max-height: 220px;
		overflow-y: auto;
	}
	.header {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12px;
		color: var(--accent-light);
		margin-bottom: 8px;
		font-weight: 600;
	}
	.dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--accent-light);
		animation: pulse 1s infinite;
	}
	pre {
		font-family: 'SF Mono', 'Fira Code', monospace;
		font-size: 12px;
		color: var(--text-muted);
		white-space: pre-wrap;
		word-break: break-word;
		line-height: 1.5;
	}
	.cursor {
		display: inline-block;
		width: 6px;
		height: 12px;
		background: var(--accent-light);
		vertical-align: text-bottom;
		animation: blink 1s step-end infinite;
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
	@keyframes blink {
		0%,
		50% {
			opacity: 1;
		}
		51%,
		100% {
			opacity: 0;
		}
	}
</style>
