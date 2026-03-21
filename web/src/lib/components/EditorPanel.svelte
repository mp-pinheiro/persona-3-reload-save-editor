<script lang="ts">
	import { saveStore, uiState, setTab, hasSave } from '$lib/ui/stores.js';
	import SummaryCard from './SummaryCard.svelte';
	import MoneyEditor from './MoneyEditor.svelte';
	import SocialStatsEditor from './SocialStatsEditor.svelte';
	import SocialLinksEditor from './SocialLinksEditor.svelte';
	import AchievementProgress from './AchievementProgress.svelte';
	import StoryFlags from './StoryFlags.svelte';
	import ExportButton from './ExportButton.svelte';
	import DifficultyEditor from './DifficultyEditor.svelte';
	import DateTimeEditor from './DateTimeEditor.svelte';
	import CombatEditor from './CombatEditor.svelte';
	import InventoryEditor from './InventoryEditor.svelte';
	import EquipmentEditor from './EquipmentEditor.svelte';
	import PlayerNameEditor from './PlayerNameEditor.svelte';
	import { FEATURES } from '$lib/config/features.js';

	let activeTab = $uiState.activeTab;

	const allTabs = [
		{ id: 'summary' as const, label: 'Summary' },
		{ id: 'stats' as const, label: 'Social Stats' },
		{ id: 'social-links' as const, label: 'Social Links' },
		{ id: 'combat' as const, label: 'Combat' },
		{ id: 'inventory' as const, label: 'Inventory' },
		{ id: 'equipment' as const, label: 'Equipment' },
		{ id: 'achievements' as const, label: 'Achievements', feature: 'achievements' as const },
		{ id: 'story' as const, label: 'Story Flags' }
	];

	const tabs = allTabs.filter((t) => !t.feature || FEATURES[t.feature]);

	function switchTab(tabId: (typeof tabs)[number]['id']) {
		setTab(tabId);
		activeTab = tabId;
	}

	function resetSave() {
		saveStore.clear();
	}
</script>

<div class="editor-panel">
	<div class="file-bar">
		<span class="file-label">Editing: <strong>{$saveStore.file?.name ?? ''}</strong></span>
		<div class="file-actions">
			<button class="file-change" onclick={resetSave}>Change</button>
			<ExportButton />
		</div>
	</div>
	<div class="tabs">
		{#each tabs as tab}
			<button
				class="tab"
				class:active={activeTab === tab.id}
				onclick={() => switchTab(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>

	<div class="editor-content">
		{#if activeTab === 'summary'}
			<SummaryCard />
		{:else if activeTab === 'stats'}
			<div class="card">
				<h2>Player Name</h2>
				<PlayerNameEditor />
			</div>
			<div class="card">
				<h2>Social Stats</h2>
				<SocialStatsEditor />
			</div>
			<div class="card">
				<h2>Money</h2>
				<MoneyEditor />
			</div>
			<div class="card">
				<h2>Difficulty</h2>
				<DifficultyEditor />
			</div>
			<div class="card">
				<h2>Date & Time</h2>
				<DateTimeEditor />
			</div>
		{:else if activeTab === 'social-links'}
			<div class="card">
				<h2>Social Links</h2>
				<SocialLinksEditor />
			</div>
		{:else if activeTab === 'combat'}
			<CombatEditor />
		{:else if activeTab === 'inventory'}
			<div class="card">
				<h2>Inventory</h2>
				<InventoryEditor />
			</div>
		{:else if activeTab === 'equipment'}
			<EquipmentEditor />
		{:else if activeTab === 'achievements'}
			<div class="card">
				<h2>Achievement Progress</h2>
				<AchievementProgress />
			</div>
		{:else if activeTab === 'story'}
			<div class="card">
				<h2>Story Flags</h2>
				<StoryFlags />
			</div>
		{/if}
	</div>

</div>

<style>
	.editor-panel {
		max-width: 800px;
		margin: 0 auto;
	}

	.editor-content {
		min-height: 300px;
	}

	.file-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.875rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.file-label {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.file-label strong {
		color: var(--text-secondary);
		font-family: monospace;
	}

	.file-actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	.file-change {
		padding: 0.25rem 0.625rem;
		background: none;
		border: 1px solid var(--border-light);
		border-radius: 0.25rem;
		color: var(--text-muted);
		font-size: 0.75rem;
		cursor: pointer;
		transition: all 0.15s ease;
	}

	.file-change:hover {
		color: var(--accent-light);
		border-color: var(--accent);
	}
</style>
