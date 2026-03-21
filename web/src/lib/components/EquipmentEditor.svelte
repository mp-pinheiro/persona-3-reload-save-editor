<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import {
		getAllEquipment,
		updateEquipmentSlot
	} from '$lib/save/equipment-queries.js';
	import {
		WEAPON_NAMES, ARMOR_NAMES, FOOTWEAR_NAMES, ACCESSORY_NAMES, COSTUME_NAMES,
		type CharacterEquipment, type EquipSlotType
	} from '$lib/save/equipment-data.js';
	import ItemSelect from './ItemSelect.svelte';

	let characters: CharacterEquipment[] = [];
	let expanded: Record<string, boolean> = {};

	$: if ($saveStore.properties.length > 0) {
		characters = getAllEquipment($saveStore.properties);
	}

	const slotLabels: Record<EquipSlotType, string> = {
		weapon: 'Weapon',
		armor: 'Body Armor',
		footwear: 'Footwear',
		accessory: 'Accessory',
		costume: 'Costume'
	};

	const slotItems: Record<EquipSlotType, Record<number, string>> = {
		weapon: WEAPON_NAMES,
		armor: ARMOR_NAMES,
		footwear: FOOTWEAR_NAMES,
		accessory: ACCESSORY_NAMES,
		costume: COSTUME_NAMES
	};

	function toggle(key: string) {
		expanded[key] = !expanded[key];
	}

	function handleSlotChange(charIdx: number, slotType: EquipSlotType, itemId: number) {
		updateEquipmentSlot($saveStore.properties, charIdx, slotType, itemId);
		characters = getAllEquipment($saveStore.properties);
	}
</script>

<div class="equipment-editor">
	{#each characters as char, charIdx (char.characterName)}
		<div class="character-section">
			<button class="character-header" onclick={() => toggle(char.characterName)}>
				<span class="character-name">{char.characterName}</span>
				<span class="expand-icon">{expanded[char.characterName] ? '−' : '+'}</span>
			</button>

			{#if expanded[char.characterName]}
				<div class="character-body">
					{#each char.slots as slot}
						<div class="equip-row">
							<span class="slot-label">{slotLabels[slot.type as EquipSlotType]}</span>
							<ItemSelect
								value={slot.itemId}
								items={slotItems[slot.type as EquipSlotType]}
								placeholder="Search {slotLabels[slot.type as EquipSlotType].toLowerCase()}..."
								onchange={(id) => handleSlotChange(charIdx, slot.type as EquipSlotType, id)}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.equipment-editor {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.character-section {
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.character-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.75rem 1rem;
		background: var(--bg-tertiary);
		border: none;
		border-bottom: 1px solid var(--border);
		color: var(--text-primary);
		font-size: 0.9375rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.character-header:hover {
		background: var(--border-light);
	}

	.expand-icon {
		color: var(--text-muted);
		font-size: 1.25rem;
		font-weight: 300;
	}

	.character-body {
		padding: 0.75rem 1rem;
		background: var(--bg-secondary);
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.equip-row {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	.slot-label {
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
		min-width: 5.5rem;
		flex-shrink: 0;
	}

	@media (max-width: 640px) {
		.equip-row {
			flex-wrap: wrap;
		}
	}
</style>
