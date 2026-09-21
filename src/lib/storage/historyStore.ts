import type { JobAnalysis, FitAnalysis, InterviewPrepItem } from '$lib/types';

export interface HistoryEntry {
	id: string;
	createdAt: string;
	roleTitle: string;
	jobPosting: string;
	job: JobAnalysis;
	fit: FitAnalysis | null;
	coverLetter: string | null;
	interviewPrep: InterviewPrepItem[] | null;
	hasResume: boolean;
}

export interface HistoryStorage {
	list(): Promise<HistoryEntry[]>;
	get(id: string): Promise<HistoryEntry | null>;
	save(entry: HistoryEntry): Promise<void>;
	remove(id: string): Promise<void>;
	clear(): Promise<void>;
}

const STORAGE_KEY = 'job-post-decoder:history';
const MAX_HISTORY_ENTRIES = 50;

export class LocalStorageHistoryStore implements HistoryStorage {
	constructor(private storage: Storage = globalThis.localStorage) {}

	private readAll(): HistoryEntry[] {
		try {
			const raw = this.storage.getItem(STORAGE_KEY);
			if (!raw) return [];
			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : [];
		} catch {
			return [];
		}
	}

	private writeAll(entries: HistoryEntry[]): void {
		this.storage.setItem(STORAGE_KEY, JSON.stringify(entries));
	}

	async list(): Promise<HistoryEntry[]> {
		return this.readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
	}

	async get(id: string): Promise<HistoryEntry | null> {
		return this.readAll().find((e) => e.id === id) ?? null;
	}

	async save(entry: HistoryEntry): Promise<void> {
		const entries = this.readAll();
		entries.unshift(entry);
		this.writeAll(entries.slice(0, MAX_HISTORY_ENTRIES));
	}

	async remove(id: string): Promise<void> {
		this.writeAll(this.readAll().filter((e) => e.id !== id));
	}

	async clear(): Promise<void> {
		this.storage.removeItem(STORAGE_KEY);
	}
}
