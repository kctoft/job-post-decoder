<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		children,
		variant = 'pill',
		disabled = false,
		onclick,
		type = 'button'
	}: {
		children: Snippet;
		variant?: 'primary' | 'pill';
		disabled?: boolean;
		onclick?: () => void;
		type?: 'button' | 'submit';
	} = $props();
</script>

<button {type} {disabled} {onclick} class="btn {variant}">
	{@render children()}
</button>

<style>
	.btn {
		font-family: inherit;
		cursor: pointer;
		border: none;
	}
	.btn.pill {
		background: var(--accent-bg);
		color: var(--accent-light);
		border-radius: 20px;
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 600;
	}
	.btn.primary {
		width: 100%;
		padding: 16px;
		border-radius: var(--radius);
		font-size: 16px;
		font-weight: 600;
		background: var(--accent);
		color: #fff;
		border: 1px solid var(--accent);
	}
	.btn:disabled {
		cursor: not-allowed;
	}
	.btn.primary:disabled {
		background: var(--bg-card);
		color: var(--text-dim);
		border-color: var(--border);
		cursor: wait;
	}
	.btn.pill:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
</style>
