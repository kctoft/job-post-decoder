<script lang="ts">
	import '../app.css';
	import { EXAMPLE_JOB, EXAMPLE_RESUME, DENSITY_CONFIG, SALARY_CONFIG } from '$lib/types';
	import type { DecodeResult } from '$lib/types';

	let jobPosting = $state('');
	let resume = $state('');
	let loading = $state(false);
	let result = $state<DecodeResult | null>(null);
	let error = $state('');

	let jobUrl = $state('');
	let fetchingUrl = $state(false);
	let urlError = $state('');

	let pdfLoading = $state(false);
	let pdfError = $state('');
	let pdfFileName = $state('');

	function fitColor(score: number): string {
		if (score >= 70) return '#22c55e';
		if (score >= 40) return '#f59e0b';
		return '#ef4444';
	}

	async function fetchJobFromUrl() {
		if (!jobUrl.trim()) return;
		fetchingUrl = true;
		urlError = '';
		try {
			const res = await fetch('/api/fetch-url', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ url: jobUrl.trim() })
			});
			const body = await res.json().catch(() => ({}));
			if (!res.ok) throw new Error(body.error || 'Could not fetch that URL');
			jobPosting = body.text;
		} catch (e: any) {
			urlError = e.message || 'Could not fetch that URL';
		} finally {
			fetchingUrl = false;
		}
	}

	async function handlePdfUpload(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		pdfLoading = true;
		pdfError = '';
		pdfFileName = '';

		try {
			const pdfjsLib = await import('pdfjs-dist');
			pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
				'pdfjs-dist/build/pdf.worker.min.mjs',
				import.meta.url
			).href;

			const buffer = await file.arrayBuffer();
			const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
			let text = '';
			for (let i = 1; i <= pdf.numPages; i++) {
				const page = await pdf.getPage(i);
				const content = await page.getTextContent();
				text += content.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n\n';
			}

			if (!text.trim()) throw new Error('Could not extract text — is this a scanned/image PDF?');
			resume = text.trim();
			pdfFileName = file.name;
		} catch (err: any) {
			pdfError = err.message || 'Could not read that PDF';
		} finally {
			pdfLoading = false;
			input.value = '';
		}
	}

	async function runDecode() {
		if (!jobPosting.trim()) return;
		loading = true;
		error = '';
		result = null;

		try {
			const res = await fetch('/api/decode', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ jobPosting, resume })
			});
			if (!res.ok) {
				const body = await res.json().catch(() => ({}));
				throw new Error(body.error || 'Something went wrong');
			}
			result = await res.json();
		} catch (e: any) {
			error = e.message || 'Something went wrong';
		} finally {
			loading = false;
		}
	}

	function loadExample() {
		jobPosting = EXAMPLE_JOB;
	}

	function loadExampleResume() {
		resume = EXAMPLE_RESUME;
	}
</script>

<div style="max-width: 1000px; margin: 0 auto; padding: 24px 20px;">
	<header style="text-align: center; padding: 40px 0 32px;">
		<h1 style="font-size: 32px; font-weight: 700; background: linear-gradient(135deg, #818cf8, #6366f1, #ec4899); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
			Job Post Decoder
		</h1>
		<p style="color: var(--text-muted); font-size: 16px; margin-top: 8px;">
			Paste a job posting. Get the real requirements, the red flags, and — if you add your resume — an honest fit score with tailored bullets.
		</p>
	</header>

	<!-- Job posting input -->
	<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px;">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
			<label for="job-posting" style="font-weight: 600; font-size: 14px;">Paste the job posting</label>
			<button onclick={loadExample}
				style="background: var(--accent-bg); color: var(--accent-light); border: none; border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit;">
				Load example
			</button>
		</div>
		<textarea
			id="job-posting"
			bind:value={jobPosting}
			placeholder="Paste the full job description here..."
			rows="12"
			style="width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; color: var(--text); font-size: 13px; resize: vertical; font-family: inherit; outline: none; line-height: 1.5;"
			onfocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
			onblur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
		></textarea>

		<div style="display: flex; align-items: center; gap: 8px; margin-top: 8px; padding-top: 12px; border-top: 1px solid var(--border);">
			<span style="font-size: 12px; color: var(--text-dim); flex-shrink: 0;">or paste a link</span>
			<input
				bind:value={jobUrl}
				placeholder="https://jobs.example.com/posting/123"
				style="flex: 1; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 8px 12px; color: var(--text); font-size: 13px; font-family: inherit; outline: none;"
				onfocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
				onblur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
				onkeydown={(e) => e.key === 'Enter' && fetchJobFromUrl()}
			/>
			<button onclick={fetchJobFromUrl}
				disabled={fetchingUrl || !jobUrl.trim()}
				style="flex-shrink: 0; background: var(--accent-bg); color: var(--accent-light); border: none; border-radius: var(--radius-sm); padding: 8px 14px; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; white-space: nowrap;">
				{fetchingUrl ? 'Fetching...' : 'Fetch →'}
			</button>
		</div>
		{#if urlError}
			<div style="font-size: 12px; color: #f87171; margin-top: 8px;">{urlError}</div>
		{/if}
		<div style="font-size: 11px; color: var(--text-dim); margin-top: 6px;">
			Works best on Greenhouse, Lever, and Ashby-style postings. Some sites (LinkedIn, Indeed) block automated fetching — paste the text directly if it fails.
		</div>
	</section>

	<!-- Resume input -->
	<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 24px;">
		<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
			<label for="resume" style="font-weight: 500; font-size: 13px; color: var(--text-muted);">Your resume (optional — adds a fit score + tailored bullets)</label>
			<div style="display: flex; gap: 8px;">
				<label style="background: var(--accent-bg); color: var(--accent-light); border: none; border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit;">
					{pdfLoading ? 'Reading PDF...' : 'Upload PDF'}
					<input type="file" accept="application/pdf" onchange={handlePdfUpload} disabled={pdfLoading} style="display: none;" />
				</label>
				<button onclick={loadExampleResume}
					style="background: var(--accent-bg); color: var(--accent-light); border: none; border-radius: 20px; padding: 6px 14px; font-size: 12px; cursor: pointer; font-family: inherit;">
					Load example
				</button>
			</div>
		</div>
		<textarea
			id="resume"
			bind:value={resume}
			placeholder="Paste your resume text here, or upload a PDF above (optional)..."
			rows="8"
			style="width: 100%; background: var(--bg-input); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 14px; color: var(--text); font-size: 13px; resize: vertical; font-family: inherit; outline: none; line-height: 1.5;"
			onfocus={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
			onblur={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
		></textarea>
		{#if pdfFileName}
			<div style="font-size: 12px; color: #4ade80; margin-top: 8px;">Loaded text from {pdfFileName} — parsed in your browser, never uploaded.</div>
		{/if}
		{#if pdfError}
			<div style="font-size: 12px; color: #f87171; margin-top: 8px;">{pdfError}</div>
		{/if}
	</section>

	<button onclick={runDecode}
		disabled={loading || !jobPosting.trim()}
		style="width: 100%; padding: 16px; background: {loading || !jobPosting.trim() ? 'var(--bg-card)' : 'var(--accent)'}; color: {loading || !jobPosting.trim() ? 'var(--text-dim)' : '#fff'}; border: 1px solid {loading ? 'var(--border)' : 'var(--accent)'}; border-radius: var(--radius); font-size: 16px; font-weight: 600; cursor: {loading ? 'wait' : 'pointer'}; font-family: inherit; margin-bottom: 32px;">
		{loading ? 'Decoding...' : 'Decode Job Posting →'}
	</button>

	{#if error}
		<div style="background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius); padding: 16px; margin-bottom: 24px; color: #f87171;">{error}</div>
	{/if}

	{#if result}
		{@const job = result.job}
		<!-- Role summary banner -->
		<div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px;">
			<div style="font-size: 15px; line-height: 1.7; margin-bottom: 16px;">{job.roleSummary}</div>
			<div style="display: flex; flex-wrap: wrap; gap: 8px;">
				<span style="background: var(--accent-bg); color: var(--accent-light); font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">{job.seniorityLevel}</span>
				<span style="background: {DENSITY_CONFIG[job.buzzwordDensity].bg}; color: {DENSITY_CONFIG[job.buzzwordDensity].color}; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">{DENSITY_CONFIG[job.buzzwordDensity].label}</span>
				<span style="background: {SALARY_CONFIG[job.salaryTransparency].bg}; color: {SALARY_CONFIG[job.salaryTransparency].color}; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 20px;">{SALARY_CONFIG[job.salaryTransparency].label}</span>
			</div>
		</div>

		<!-- Must-haves / nice-to-haves -->
		<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px;">
			<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
				<h2 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text);">Must-haves</h2>
				<ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
					{#each job.mustHaves as item}
						<li style="font-size: 13px; color: var(--text-muted); line-height: 1.5; padding-left: 16px; position: relative;">
							<span style="position: absolute; left: 0; color: var(--accent-light);">•</span>{item}
						</li>
					{/each}
				</ul>
			</section>
			<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
				<h2 style="font-size: 14px; font-weight: 600; margin-bottom: 12px; color: var(--text);">Nice-to-haves</h2>
				<ul style="list-style: none; display: flex; flex-direction: column; gap: 8px;">
					{#each job.niceToHaves as item}
						<li style="font-size: 13px; color: var(--text-muted); line-height: 1.5; padding-left: 16px; position: relative;">
							<span style="position: absolute; left: 0; color: var(--text-dim);">•</span>{item}
						</li>
					{/each}
				</ul>
			</section>
		</div>

		<!-- Red flags -->
		{#if job.redFlags.length > 0}
			<section style="margin-bottom: 24px;">
				<h2 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Red flags</h2>
				{#each job.redFlags as rf}
					<div style="background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--danger); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 10px;">
						<div style="font-size: 14px; font-weight: 600; margin-bottom: 4px;">{rf.flag}</div>
						<div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">{rf.why}</div>
					</div>
				{/each}
			</section>
		{:else}
			<section style="background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 24px; color: #4ade80; font-size: 14px;">
				No red flags detected — this posting reads clean.
			</section>
		{/if}

		{#if result.fit}
			{@const fit = result.fit}
			<!-- Fit score -->
			<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; margin-bottom: 16px; display: flex; gap: 24px; align-items: center;">
				<div style="flex-shrink: 0; width: 88px; height: 88px; border-radius: 50%; border: 4px solid {fitColor(fit.fitScore)}; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: {fitColor(fit.fitScore)};">
					{fit.fitScore}
				</div>
				<div>
					<div style="font-size: 15px; font-weight: 600; margin-bottom: 4px;">Fit score</div>
					<div style="font-size: 13px; color: var(--text-muted); line-height: 1.6;">{fit.fitSummary}</div>
				</div>
			</section>

			<!-- Keywords -->
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
				<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
					<h2 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">You've got these covered</h2>
					<div style="display: flex; flex-wrap: wrap; gap: 6px;">
						{#each fit.matchedKeywords as kw}
							<span style="background: rgba(34,197,94,0.1); color: #4ade80; font-size: 12px; padding: 4px 10px; border-radius: 14px;">{kw}</span>
						{/each}
					</div>
				</section>
				<section style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px;">
					<h2 style="font-size: 14px; font-weight: 600; margin-bottom: 12px;">Missing from your resume</h2>
					<div style="display: flex; flex-wrap: wrap; gap: 6px;">
						{#each fit.missingKeywords as kw}
							<span style="background: rgba(239,68,68,0.1); color: #f87171; font-size: 12px; padding: 4px 10px; border-radius: 14px;">{kw}</span>
						{/each}
					</div>
				</section>
			</div>

			<!-- Priority gaps (evidence-based, top 5) -->
			{#if fit.priorityGaps && fit.priorityGaps.length > 0}
				<section style="margin-bottom: 24px;">
					<h2 style="font-size: 16px; font-weight: 600; margin-bottom: 4px;">Top {fit.priorityGaps.length} gaps to fix first</h2>
					<p style="font-size: 12px; color: var(--text-dim); margin-bottom: 12px;">Ranked by importance, each grounded in a real quote from the posting.</p>
					{#each fit.priorityGaps as gap, i}
						<div style="background: var(--bg-card); border: 1px solid var(--border); border-left: 3px solid var(--warning); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 10px;">
							<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
								<span style="background: rgba(245,158,11,0.15); color: var(--warning); font-size: 11px; font-weight: 700; width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">{i + 1}</span>
								<span style="font-size: 14px; font-weight: 600;">{gap.keyword}</span>
							</div>
							<div style="background: var(--bg-input); border-radius: 6px; padding: 10px 14px; margin-bottom: 10px; font-size: 12px; color: var(--text-muted); font-style: italic;">"{gap.evidence}"</div>
							<div style="font-size: 13px; color: var(--text-muted); line-height: 1.5;">{gap.whyItMatters}</div>
						</div>
					{/each}
				</section>
			{/if}

			<!-- Suggested bullets -->
			{#if fit.suggestedBullets.length > 0}
				<section style="margin-bottom: 24px;">
					<h2 style="font-size: 16px; font-weight: 600; margin-bottom: 12px;">Suggested resume bullets</h2>
					{#each fit.suggestedBullets as sb}
						<div style="background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 10px;">
							<div style="font-size: 14px; line-height: 1.6; margin-bottom: 8px;">{sb.bullet}</div>
							<div style="font-size: 12px; color: var(--accent-light);">Targets: {sb.targets}</div>
						</div>
					{/each}
				</section>
			{/if}
		{:else}
			<section style="background: var(--bg-card); border: 1px dashed var(--border); border-radius: var(--radius); padding: 20px; margin-bottom: 24px; text-align: center; color: var(--text-dim); font-size: 13px;">
				Add your resume above and re-run to get a fit score and tailored bullet suggestions.
			</section>
		{/if}
	{/if}

	<footer style="text-align: center; padding: 32px 0 24px; color: var(--text-dim); font-size: 13px;">
		Built by <a href="https://kitanatoft.com" style="color: var(--accent-light); text-decoration: none;">Kitana Toft</a> · Powered by Claude API
	</footer>
</div>
