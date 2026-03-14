<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { findByIdUInt32, updateSocialLinkLevel } from '$lib/save/queries.js';
	import { SOCIAL_LINK_DEFINITIONS } from '$lib/save/structures.js';

	interface SocialLinkState {
		id: number;
		name: string;
		level: number;
	}

	let socialLinks: SocialLinkState[] = [];

	$: if ($saveStore.properties.length > 0) {
		socialLinks = SOCIAL_LINK_DEFINITIONS.map((def) => {
			const value = findByIdUInt32($saveStore.properties, def.id) || 0;
			const bytes = new Uint8Array(4);
			new DataView(bytes.buffer).setUint32(0, value, true);
			const level = bytes[0];
			return { id: def.id, name: def.name, level };
		});
	}

	function getSocialLinkName(name: string): string {
		if (name === 'Nyx Annihilation Team') return 'Nyx Team';
		if (name === 'SEES') return 'SEES';
		return name;
	}

	function updateSocialLink(id: number, newLevel: number) {
		updateSocialLinkLevel($saveStore.properties, id, newLevel);
		const link = socialLinks.find((sl) => sl.id === id);
		if (link) link.level = newLevel;
	}

	function setAllMax() {
		for (const link of socialLinks) {
			if (link.level > 0) {
				updateSocialLink(link.id, 10);
			}
		}
	}
</script>

<div class="social-links-editor">
	<div class="social-links-header">
		<h3>Click to set level (0-10)</h3>
		<button class="btn btn-sm btn-secondary" onclick={setAllMax}>Max All Unlocked</button>
	</div>

	<div class="social-links-grid">
		{#each socialLinks as link (link.id)}
			<div class="social-link-item">
				<span class="social-link-name">{getSocialLinkName(link.name)}</span>
				<select
					class="social-link-select"
					bind:value={link.level}
					onchange={(e) => updateSocialLink(link.id, Number((e.target as HTMLInputElement).value))}
				>
					<option value={0}>Not Started</option>
					<option value={1}>Rank 1</option>
					<option value={2}>Rank 2</option>
					<option value={3}>Rank 3</option>
					<option value={4}>Rank 4</option>
					<option value={5}>Rank 5</option>
					<option value={6}>Rank 6</option>
					<option value={7}>Rank 7</option>
					<option value={8}>Rank 8</option>
					<option value={9}>Rank 9</option>
					<option value={10}>Rank 10 (Max)</option>
				</select>
			</div>
		{/each}
	</div>
</div>

<style>
	.social-links-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.social-links-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.social-links-header h3 {
		margin: 0;
		font-size: 1rem;
		color: var(--text-secondary);
	}

	.social-links-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
		gap: 0.5rem;
	}

	.social-link-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.625rem 0.875rem;
		background: var(--bg-tertiary);
		border-radius: 0.375rem;
	}
</style>
