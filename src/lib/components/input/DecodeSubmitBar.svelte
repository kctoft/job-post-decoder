<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';

	let {
		loading = false,
		disabled = false,
		includeCoverLetter = $bindable(false),
		includeInterviewPrep = $bindable(false),
		hasResume = false,
		onSubmit
	}: {
		loading?: boolean;
		disabled?: boolean;
		includeCoverLetter?: boolean;
		includeInterviewPrep?: boolean;
		hasResume?: boolean;
		onSubmit: () => void;
	} = $props();
</script>

{#if hasResume}
	<div class="extras">
		<label><input type="checkbox" bind:checked={includeCoverLetter} /> Also draft a cover letter</label>
		<label
			><input type="checkbox" bind:checked={includeInterviewPrep} /> Also generate interview prep</label
		>
	</div>
{/if}

<div class="submit">
	<Button variant="primary" disabled={disabled || loading} onclick={onSubmit}>
		{loading ? 'Decoding...' : 'Decode Job Posting →'}
	</Button>
</div>

<style>
	.extras {
		display: flex;
		flex-wrap: wrap;
		gap: 20px;
		margin-bottom: 12px;
		font-size: 13px;
		color: var(--text-muted);
	}
	.extras label {
		display: flex;
		align-items: center;
		gap: 6px;
		cursor: pointer;
	}
	.submit {
		margin-bottom: 32px;
	}
</style>
