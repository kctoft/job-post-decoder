<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import SectionHeading from '$lib/components/ui/SectionHeading.svelte';

	let { letter }: { letter: string } = $props();

	let copied = $state(false);

	async function copy() {
		try {
			await navigator.clipboard.writeText(letter);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard access can be denied by the browser; the letter is still selectable/visible
		}
	}
</script>

<section class="section">
	<div class="header">
		<SectionHeading text="Cover letter draft" />
		<Button variant="pill" onclick={copy}>{copied ? 'Copied!' : 'Copy'}</Button>
	</div>
	<Card>
		<div class="letter">{letter}</div>
	</Card>
</section>

<style>
	.section {
		margin-bottom: 24px;
	}
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	.header :global(h2) {
		margin-bottom: 0;
	}
	.letter {
		font-size: 14px;
		line-height: 1.7;
		white-space: pre-wrap;
		color: var(--text-muted);
	}
</style>
