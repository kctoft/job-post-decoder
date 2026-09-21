import { describe, it, expect } from 'vitest';
import { extractJson } from './parse';

describe('extractJson', () => {
	it('parses plain JSON', () => {
		expect(extractJson('{"a":1}')).toEqual({ a: 1 });
	});

	it('strips ```json fenced blocks', () => {
		expect(extractJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
	});

	it('strips plain ``` fenced blocks', () => {
		expect(extractJson('```\n{"a":1}\n```')).toEqual({ a: 1 });
	});

	it('trims surrounding whitespace', () => {
		expect(extractJson('   {"a":1}   \n')).toEqual({ a: 1 });
	});

	it('throws on invalid JSON', () => {
		expect(() => extractJson('not json')).toThrow();
	});
});
