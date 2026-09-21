import { lookup } from 'node:dns/promises';

const MAX_BYTES = 3_000_000;
const FETCH_TIMEOUT_MS = 10_000;
const MAX_REDIRECTS = 5;

export class UnsafeUrlError extends Error {}

export function isPrivateIPv4(ip: string): boolean {
	const parts = ip.split('.').map(Number);
	if (parts.length !== 4 || parts.some((p) => Number.isNaN(p))) return false;
	const [a, b] = parts;
	if (a === 127) return true; // loopback
	if (a === 10) return true; // private
	if (a === 172 && b >= 16 && b <= 31) return true; // private
	if (a === 192 && b === 168) return true; // private
	if (a === 169 && b === 254) return true; // link-local / cloud metadata
	if (a === 0) return true;
	return false;
}

export function isPrivateIPv6(ip: string): boolean {
	const norm = ip.toLowerCase();
	if (norm === '::1') return true; // loopback
	if (norm.startsWith('fc') || norm.startsWith('fd')) return true; // unique local
	if (norm.startsWith('fe80')) return true; // link-local
	if (norm.startsWith('::ffff:')) return isPrivateIPv4(norm.slice(7)); // IPv4-mapped
	return false;
}

async function assertPublicHost(hostname: string): Promise<void> {
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		throw new UnsafeUrlError('URL points to a local address, which is not allowed');
	}
	const addresses = await lookup(hostname, { all: true }).catch(() => {
		throw new UnsafeUrlError('Could not resolve that hostname');
	});
	for (const { address, family } of addresses) {
		const isPrivate = family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address);
		if (isPrivate) {
			throw new UnsafeUrlError('URL resolves to a private/internal address, which is not allowed');
		}
	}
}

export function stripHtml(html: string): string {
	let text = html
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ')
		.replace(/<(br|p|div|li|tr|h[1-6])[^>]*>/gi, '\n')
		.replace(/<[^>]+>/g, ' ');

	text = text
		.replace(/&nbsp;/gi, ' ')
		.replace(/&amp;/gi, '&')
		.replace(/&lt;/gi, '<')
		.replace(/&gt;/gi, '>')
		.replace(/&quot;/gi, '"')
		.replace(/&#39;/gi, "'")
		.replace(/&mdash;/gi, '—')
		.replace(/&ndash;/gi, '–');

	return text
		.split('\n')
		.map((line) => line.replace(/[ \t]+/g, ' ').trim())
		.filter((line, i, arr) => line || arr[i - 1] !== '')
		.join('\n')
		.trim();
}

export async function fetchUrlAsText(rawUrl: string): Promise<string> {
	let url: URL;
	try {
		url = new URL(rawUrl);
	} catch {
		throw new UnsafeUrlError('That is not a valid URL');
	}

	let hops = 0;
	while (hops <= MAX_REDIRECTS) {
		if (url.protocol !== 'http:' && url.protocol !== 'https:') {
			throw new UnsafeUrlError('Only http/https URLs are allowed');
		}
		await assertPublicHost(url.hostname);

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
		let res: Response;
		try {
			res = await fetch(url, {
				redirect: 'manual',
				signal: controller.signal,
				headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobPostDecoder/1.0)' }
			});
		} finally {
			clearTimeout(timeout);
		}

		if (res.status >= 300 && res.status < 400) {
			const location = res.headers.get('location');
			if (!location) throw new UnsafeUrlError('Redirect with no location header');
			url = new URL(location, url);
			hops++;
			continue;
		}

		if (!res.ok) {
			throw new Error(`Fetch failed with status ${res.status}`);
		}

		const contentType = res.headers.get('content-type') || '';
		if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
			throw new Error(`Unsupported content type: ${contentType || 'unknown'}`);
		}

		const reader = res.body?.getReader();
		if (!reader) throw new Error('Empty response body');
		const chunks: Uint8Array[] = [];
		let received = 0;
		for (;;) {
			const { done, value } = await reader.read();
			if (done) break;
			received += value.length;
			if (received > MAX_BYTES) {
				await reader.cancel();
				throw new Error('Page too large to fetch');
			}
			chunks.push(value);
		}
		const html = Buffer.concat(chunks).toString('utf-8');
		return stripHtml(html);
	}

	throw new UnsafeUrlError('Too many redirects');
}
