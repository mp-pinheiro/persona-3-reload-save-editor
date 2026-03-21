import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, upsertUInt32Property } from './queries.js';
import {
	type CharacterEquipment,
	getItemName,
	getEquipDataIds,
	EQUIP_CHARACTERS,
	EQUIP_BLOCK_BASES
} from './equipment-data.js';

const READ_BLOCK = EQUIP_BLOCK_BASES.length - 1;

export function getCharacterEquipment(properties: GVASData[], charIndex: number): CharacterEquipment {
	const ids = getEquipDataIds(EQUIP_BLOCK_BASES[READ_BLOCK], charIndex);
	const char = EQUIP_CHARACTERS[charIndex];

	const weaponArmorVal = findByIdUInt32(properties, ids.weaponArmor) ?? 0;
	const footAccVal = findByIdUInt32(properties, ids.footAcc) ?? 0;
	const costumeVal = findByIdUInt32(properties, ids.costume) ?? 0;

	return {
		characterName: char.name,
		slots: [
			{ type: 'weapon', itemId: weaponArmorVal & 0xFFFF, name: getItemName('weapon', weaponArmorVal & 0xFFFF) },
			{ type: 'armor', itemId: (weaponArmorVal >>> 16) & 0xFFFF, name: getItemName('armor', (weaponArmorVal >>> 16) & 0xFFFF) },
			{ type: 'footwear', itemId: footAccVal & 0xFFFF, name: getItemName('footwear', footAccVal & 0xFFFF) },
			{ type: 'accessory', itemId: (footAccVal >>> 16) & 0xFFFF, name: getItemName('accessory', (footAccVal >>> 16) & 0xFFFF) },
			{ type: 'costume', itemId: costumeVal & 0xFFFF, name: getItemName('costume', costumeVal & 0xFFFF) }
		]
	};
}

function writeToAllBlocks(
	properties: GVASData[],
	charIndex: number,
	updater: (ids: ReturnType<typeof getEquipDataIds>) => void
): void {
	for (const blockBase of EQUIP_BLOCK_BASES) {
		const ids = getEquipDataIds(blockBase, charIndex);
		updater(ids);
	}
}

export function updateEquipmentSlot(
	properties: GVASData[],
	charIndex: number,
	slotType: 'weapon' | 'armor' | 'footwear' | 'accessory' | 'costume',
	newItemId: number
): void {
	const id16 = newItemId & 0xFFFF;

	writeToAllBlocks(properties, charIndex, (ids) => {
		if (slotType === 'weapon') {
			const current = findByIdUInt32(properties, ids.weaponArmor) ?? 0;
			upsertUInt32Property(properties, ids.weaponArmor, ((current & 0xFFFF0000) | id16) >>> 0);
		} else if (slotType === 'armor') {
			const current = findByIdUInt32(properties, ids.weaponArmor) ?? 0;
			upsertUInt32Property(properties, ids.weaponArmor, (((id16 << 16) | (current & 0xFFFF)) >>> 0));
		} else if (slotType === 'footwear') {
			const current = findByIdUInt32(properties, ids.footAcc) ?? 0;
			upsertUInt32Property(properties, ids.footAcc, ((current & 0xFFFF0000) | id16) >>> 0);
		} else if (slotType === 'accessory') {
			const current = findByIdUInt32(properties, ids.footAcc) ?? 0;
			upsertUInt32Property(properties, ids.footAcc, (((id16 << 16) | (current & 0xFFFF)) >>> 0));
		} else if (slotType === 'costume') {
			upsertUInt32Property(properties, ids.costume, id16);
		}
	});
}

export function getAllEquipment(properties: GVASData[]): CharacterEquipment[] {
	return EQUIP_CHARACTERS.map((_, i) => getCharacterEquipment(properties, i));
}
