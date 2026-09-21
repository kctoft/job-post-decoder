<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { extractPdfText } from '$lib/client/pdf';

	let {
		value = $bindable(''),
		onLoadExample
	}: {
		value: string;
		onLoadExample: () => void;
	} = $props();

	let pdfLoading = $state(false);
	let pdfError = $state('');
	let pdfFileName = $state('');

	async function handlePdfUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		pdfLoading = true;
		pdfError = '';
		pdfFileName = '';

		try {
			value = await extractPdfText(file);
			pdfFileName = file.name;
		} catch (err: any) {
			pdfError = err.message || 'Could not read that PDF';
		} finally {
			pdfLoading = false;
			input.value = '';
		}
	}
</script>

<Card style="margin-bottom: 24px;">
	<div class="header">
		<label for="resume">Your resume (optional — adds a fit score + tailored bullets)</label>
		<div class="actions">
			<label class="upload-label">
				{pdfLoading ? 'Reading PDF...' : 'Upload PDF'}
				<input
					type="file"
					accept="application/pdf"
					onchange={handlePdfUpload}
					disabled={pdfLoading}
				/>
			</label>
			<Button variant="pill" onclick={onLoadExample}>Load example</Button>
		</div>
	</div>
	<textarea
		id="resume"
		bind:value
		placeholder="Paste your resume text here, or upload a PDF above (optional)..."
		rows="8"
	></textarea>
	{#if pdfFileName}
		<div class="success">Loaded text from {pdfFileName} — parsed in your browser, never uploaded.</div>
	{/if}
	{#if pdfError}
		<div class="error">{pdfError}</div>
	{/if}
</Card>

<style>
	.header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 12px;
	}
	label[for='resume'] {
		font-weight: 500;
		font-size: 13px;
		color: var(--text-muted);
	}
	.actions {
		display: flex;
		gap: 8px;
	}
	.upload-label {
		background: var(--accent-bg);
		color: var(--accent-light);
		border-radius: 20px;
		padding: 6px 14px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		font-family: inherit;
	}
	.upload-label input {
		display: none;
	}
	textarea {
		width: 100%;
		background: var(--bg-input);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		padding: 14px;
		color: var(--text);
		font-size: 13px;
		resize: vertical;
		font-family: inherit;
		outline: none;
		line-height: 1.5;
	}
	textarea:focus {
		border-color: var(--border-focus);
	}
	.success {
		font-size: 12px;
		color: #4ade80;
		margin-top: 8px;
	}
	.error {
		font-size: 12px;
		color: #f87171;
		margin-top: 8px;
	}
</style>
