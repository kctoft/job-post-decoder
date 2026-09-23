import { lookup } from 'node:dns/promises';
import { Agent, fetch as undiciFetch, type Dispatcher } from 'undici';

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

interface ResolvedHost {
	address: string;
	family: 4 | 6;
}

// Resolves and validates every address a hostname maps to, and returns one of them
// (pinned) so the caller can force the actual connection to use it. Just validating
// the hostname here and letting a later `fetch()` re-resolve DNS on its own would be a
// classic check-then-connect (TOCTOU) gap: an attacker's authoritative nameserver can
// answer this validation lookup with a public IP and the real connection's lookup with
// a private/metadata IP a moment later, since they're two independent DNS queries.
async function resolvePublicHost(hostname: string): Promise<ResolvedHost> {
	if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
		throw new UnsafeUrlError('URL points to a local address, which is not allowed');
	}
	const addresses = await lookup(hostname, { all: true }).catch(() => {
		throw new UnsafeUrlError('Could not resolve that hostname');
	});
	if (addresses.length === 0) {
		throw new UnsafeUrlError('Could not resolve that hostname');
	}
	for (const { address, family } of addresses) {
		const isPrivate = family === 4 ? isPrivateIPv4(address) : isPrivateIPv6(address);
		if (isPrivate) {
			throw new UnsafeUrlError('URL resolves to a private/internal address, which is not allowed');
		}
	}
	const { address, family } = addresses[0];
	return { address, family: family as 4 | 6 };
}

// Builds a dispatcher whose connector skips DNS entirely and always connects to the
// already-validated address above, no matter what hostname it's asked to look up.
function pinnedDispatcher(resolved: ResolvedHost): Dispatcher {
	return new Agent({
		connect: {
			lookup(_hostname: string, options: any, callback: any) {
				const cb = typeof options === 'function' ? options : callback;
				const wantsAll = typeof options === 'object' && options !== null && options.all;
				if (wantsAll) {
					cb(null, [{ address: resolved.address, family: resolved.family }]);
				} else {
					cb(null, resolved.address, resolved.family);
				}
			}
		} as any
	});
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
		const resolved = await resolvePublicHost(url.hostname);
		const dispatcher = pinnedDispatcher(resolved);

		const controller = new AbortController();
		const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
		let res: Awaited<ReturnType<typeof undiciFetch>>;
		try {
			// Use undici's own fetch (not the global one) — a dispatcher built from the
			// `undici` package isn't guaranteed compatible with Node's internally-bundled
			// fetch implementation, so pinning only works reliably if both come from here.
			res = await undiciFetch(url, {
				redirect: 'manual',
				signal: controller.signal,
				headers: { 'User-Agent': 'Mozilla/5.0 (compatible; JobPostDecoder/1.0)' },
				dispatcher
			});
		} finally {
			clearTimeout(timeout);
			await dispatcher.close();
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
