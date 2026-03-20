import { writable, derived } from 'svelte/store';
import type { GVASData } from '../gvas/types.js';
import type { SaveSummary } from '../save/structures.js';
import { getSaveSummary } from '../save/queries.js';

interface LoadState {
	isLoading: boolean;
	error: string | null;
	stage: 'idle' | 'decrypting' | 'parsing' | 'processing';
}

interface UIState {
	activeTab: 'summary' | 'stats' | 'social-links' | 'combat' | 'inventory' | 'achievements' | 'story';
}

interface SaveFile {
	name: string;
	wasEncrypted: boolean;
	originalData: Uint8Array;
}

interface SaveState {
	properties: GVASData[];
	summary: SaveSummary | null;
	file: SaveFile | null;
}

function createSaveStore() {
	const { subscribe, set, update } = writable<SaveState>({
		properties: [],
		summary: null,
		file: null
	});

	return {
		subscribe,
		set,
		update,
		loadSave: (properties: GVASData[], file: SaveFile) => {
			const summary = getSaveSummary(properties);
			set({ properties, summary, file });
		},
		clear: () => set({ properties: [], summary: null, file: null })
	};
}

export const loadState = writable<LoadState>({
	isLoading: false,
	error: null,
	stage: 'idle'
});

export const uiState = writable<UIState>({
	activeTab: 'summary'
});

export const saveStore = createSaveStore();

export const hasSave = derived(saveStore, ($saveStore) => $saveStore.file !== null);

export const canExport = derived(saveStore, ($saveStore) => $saveStore.file !== null);

export function setTab(tab: UIState['activeTab']) {
	uiState.update((state) => ({ ...state, activeTab: tab }));
}

export function setLoading(isLoading: boolean, stage: LoadState['stage'] = 'idle') {
	loadState.set({ isLoading, error: null, stage });
}

export function setError(error: string) {
	loadState.set({ isLoading: false, error, stage: 'idle' });
}

export function clearError() {
	loadState.update((state) => ({ ...state, error: null }));
}
