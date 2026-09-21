import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { fetchUrlAsText, UnsafeUrlError } from '$lib/urlFetch';
import { createRateLimiter } from '$lib/rateLimit';

const MAX_CHARS = 20000;
const rateLimited = createRateLimiter(15, 60_000);

export const POST: RequestHandler = async ({ request, getClientAddress }) => {
	if (rateLimited(getClientAddress())) {
		return json({ error: 'Too many requests. Please wait a minute and try again.' }, { status: 429 });
	}

	const { url } = await request.json();
	if (!url?.trim()) {
		return json({ error: 'No URL provided' }, { status: 400 });
	}

	try {
		const text = await fetchUrlAsText(url.trim());
		if (!text.trim()) {
			return json({ error: 'Could not find readable text at that URL. Try pasting the text directly.' }, { status: 422 });
		}
		return json({ text: text.slice(0, MAX_CHARS) });
	} catch (err: any) {
		if (err instanceof UnsafeUrlError) {
			return json({ error: err.message }, { status: 400 });
		}
		return json({ error: 'Could not fetch that page — some sites (like LinkedIn) block automated fetching. Try pasting the text directly.' }, { status: 502 });
	}
};
