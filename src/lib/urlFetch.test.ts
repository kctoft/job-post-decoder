import { describe, it, expect } from 'vitest';
import { isPrivateIPv4, isPrivateIPv6, stripHtml } from './urlFetch';

describe('isPrivateIPv4', () => {
	it('flags loopback, private, and link-local ranges', () => {
		expect(isPrivateIPv4('127.0.0.1')).toBe(true);
		expect(isPrivateIPv4('10.0.0.5')).toBe(true);
		expect(isPrivateIPv4('172.16.0.1')).toBe(true);
		expect(isPrivateIPv4('172.31.255.255')).toBe(true);
		expect(isPrivateIPv4('192.168.1.1')).toBe(true);
		expect(isPrivateIPv4('169.254.169.254')).toBe(true); // cloud metadata endpoint
		expect(isPrivateIPv4('0.0.0.0')).toBe(true);
	});

	it('allows public addresses', () => {
		expect(isPrivateIPv4('8.8.8.8')).toBe(false);
		expect(isPrivateIPv4('172.32.0.1')).toBe(false); // just outside the 172.16/12 range
		expect(isPrivateIPv4('1.1.1.1')).toBe(false);
	});
});

describe('isPrivateIPv6', () => {
	it('flags loopback, unique-local, and link-local ranges', () => {
		expect(isPrivateIPv6('::1')).toBe(true);
		expect(isPrivateIPv6('fc00::1')).toBe(true);
		expect(isPrivateIPv6('fd12:3456::1')).toBe(true);
		expect(isPrivateIPv6('fe80::1')).toBe(true);
		expect(isPrivateIPv6('::ffff:127.0.0.1')).toBe(true); // IPv4-mapped loopback
	});

	it('allows public addresses', () => {
		expect(isPrivateIPv6('2001:4860:4860::8888')).toBe(false);
	});
});

describe('stripHtml', () => {
	it('removes script and style blocks entirely', () => {
		const html = '<html><head><style>.a{color:red}</style></head><body><script>alert(1)</script>Hello</body></html>';
		const text = stripHtml(html);
		expect(text).not.toContain('alert');
		expect(text).not.toContain('color:red');
		expect(text).toContain('Hello');
	});

	it('converts block tags to newlines and strips remaining tags', () => {
		const html = '<div>First</div><div>Second</div>';
		const text = stripHtml(html);
		expect(text).toBe('First\nSecond');
	});

	it('decodes common HTML entities', () => {
		expect(stripHtml('Tom &amp; Jerry &mdash; a &quot;classic&quot;')).toBe('Tom & Jerry — a "classic"');
	});
});
