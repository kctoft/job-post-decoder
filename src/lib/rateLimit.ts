export function createRateLimiter(limit: number, windowMs: number) {
	const hits = new Map<string, number[]>();

	return function isLimited(key: string, now: number = Date.now()): boolean {
		const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
		recent.push(now);
		hits.set(key, recent);
		return recent.length > limit;
	};
}
