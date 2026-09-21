import { describe, it, expect } from 'vitest';
import { createRateLimiter } from './rateLimit';

describe('createRateLimiter', () => {
	it('allows requests under the limit', () => {
		const isLimited = createRateLimiter(3, 60_000);
		expect(isLimited('a', 0)).toBe(false);
		expect(isLimited('a', 1)).toBe(false);
		expect(isLimited('a', 2)).toBe(false);
	});

	it('blocks requests over the limit within the window', () => {
		const isLimited = createRateLimiter(2, 60_000);
		expect(isLimited('a', 0)).toBe(false);
		expect(isLimited('a', 1)).toBe(false);
		expect(isLimited('a', 2)).toBe(true);
	});

	it('tracks keys independently', () => {
		const isLimited = createRateLimiter(1, 60_000);
		expect(isLimited('a', 0)).toBe(false);
		expect(isLimited('b', 0)).toBe(false);
	});

	it('resets once requests age out of the window', () => {
		const isLimited = createRateLimiter(1, 1000);
		expect(isLimited('a', 0)).toBe(false);
		expect(isLimited('a', 500)).toBe(true);
		expect(isLimited('a', 1600)).toBe(false);
	});
});
