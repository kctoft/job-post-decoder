import { describe, it, expect, beforeEach } from 'vitest';
import { LocalStorageHistoryStore, type HistoryEntry } from './historyStore';

class MemoryStorage implements Storage {
	private data = new Map<string, string>();
	get length() {
		return this.data.size;
	}
	clear(): void {
		this.data.clear();
	}
	getItem(key: string): string | null {
		return this.data.has(key) ? this.data.get(key)! : null;
	}
	key(index: number): string | null {
		return Array.from(this.data.keys())[index] ?? null;
	}
	removeItem(key: string): void {
		this.data.delete(key);
	}
	setItem(key: string, value: string): void {
		this.data.set(key, value);
	}
}

function makeEntry(overrides: Partial<HistoryEntry> = {}): HistoryEntry {
	return {
		id: overrides.id ?? crypto.randomUUID(),
		createdAt: overrides.createdAt ?? new Date().toISOString(),
		roleTitle: 'Widget Engineer @ Acme',
		jobPosting: 'full posting text',
		job: {
			roleTitle: 'Widget Engineer @ Acme',
			roleSummary: 'Builds widgets.',
			seniorityLevel: 'Mid-level',
			mustHaves: [],
			niceToHaves: [],
			redFlags: [],
			buzzwordDensity: 'low',
			salaryTransparency: 'clear'
		},
		fit: null,
		coverLetter: null,
		interviewPrep: null,
		hasResume: false,
		...overrides
	};
}

describe('LocalStorageHistoryStore', () => {
	let storage: MemoryStorage;
	let store: LocalStorageHistoryStore;

	beforeEach(() => {
		storage = new MemoryStorage();
		store = new LocalStorageHistoryStore(storage);
	});

	it('starts empty', async () => {
		expect(await store.list()).toEqual([]);
	});

	it('saves and lists an entry', async () => {
		const entry = makeEntry();
		await store.save(entry);
		const list = await store.list();
		expect(list).toHaveLength(1);
		expect(list[0].id).toBe(entry.id);
	});

	it('lists newest first', async () => {
		await store.save(makeEntry({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }));
		await store.save(makeEntry({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z' }));
		const list = await store.list();
		expect(list.map((e) => e.id)).toEqual(['b', 'a']);
	});

	it('gets a single entry by id', async () => {
		const entry = makeEntry({ id: 'target' });
		await store.save(entry);
		await store.save(makeEntry({ id: 'other' }));
		expect((await store.get('target'))?.id).toBe('target');
	});

	it('returns null for an unknown id', async () => {
		expect(await store.get('nope')).toBeNull();
	});

	it('removes an entry', async () => {
		await store.save(makeEntry({ id: 'a' }));
		await store.save(makeEntry({ id: 'b' }));
		await store.remove('a');
		const list = await store.list();
		expect(list.map((e) => e.id)).toEqual(['b']);
	});

	it('clears all entries', async () => {
		await store.save(makeEntry());
		await store.save(makeEntry());
		await store.clear();
		expect(await store.list()).toEqual([]);
	});

	it('prunes to the 50 most recent entries', async () => {
		for (let i = 0; i < 55; i++) {
			await store.save(makeEntry({ id: `e${i}`, createdAt: new Date(2026, 0, 1, 0, 0, i).toISOString() }));
		}
		const list = await store.list();
		expect(list).toHaveLength(50);
		// The 5 oldest (e0-e4) should have been pruned; the most recent (e54) should remain.
		expect(list.some((e) => e.id === 'e0')).toBe(false);
		expect(list.some((e) => e.id === 'e54')).toBe(true);
	});

	it('recovers gracefully from corrupted storage', async () => {
		storage.setItem('job-post-decoder:history', 'not json');
		expect(await store.list()).toEqual([]);
	});
});
