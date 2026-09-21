import type { DecodeEvent } from '$lib/types';

export interface DecodeStreamOptions {
	jobPosting: string;
	resume: string;
	includeCoverLetter: boolean;
	includeInterviewPrep: boolean;
}

export async function* streamDecode(opts: DecodeStreamOptions): AsyncGenerator<DecodeEvent> {
	const res = await fetch('/api/decode', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(opts)
	});

	if (!res.ok || !res.body) {
		const body = await res.json().catch(() => ({}));
		throw new Error(body.error || `Request failed with status ${res.status}`);
	}

	const reader = res.body.getReader();
	const decoder = new TextDecoder();
	let buf = '';

	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		buf += decoder.decode(value, { stream: true });

		let idx: number;
		while ((idx = buf.indexOf('\n\n')) !== -1) {
			const raw = buf.slice(0, idx);
			buf = buf.slice(idx + 2);
			const line = raw.split('\n').find((l) => l.startsWith('data: '));
			if (line) yield JSON.parse(line.slice(6)) as DecodeEvent;
		}
	}
}
