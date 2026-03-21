import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, upsertUInt32Property } from './queries.js';
import {
	type EquipmentSlot,
	type CharacterEquipment,
	getItemName,
	getEquipDataIds,
	EQUIP_CHARACTERS
} from './equipment-data.js';

export function getCharacterEquipment(properties: GVASData[], charIndex: number): CharacterEquipment {
	const ids = getEquipDataIds(charIndex);
	const char = EQUIP_CHARACTERS[charIndex];

	const weaponArmorVal = findByIdUInt32(properties, ids.weaponArmor) ?? 0;
	const footAccVal = findByIdUInt32(properties, ids.footAcc) ?? 0;
	const costumeVal = findByIdUInt32(properties, ids.costume) ?? 0;

	const weaponId = weaponArmorVal & 0xFFFF;
	const armorId = (weaponArmorVal >>> 16) & 0xFFFF;
	const footwearId = footAccVal & 0xFFFF;
	const accessoryId = (footAccVal >>> 16) & 0xFFFF;
	const costumeId = costumeVal & 0xFFFF;

	return {
		characterName: char.name,
		slots: [
			{ type: 'weapon', itemId: weaponId, name: getItemName('weapon', weaponId) },
			{ type: 'armor', itemId: armorId, name: getItemName('armor', armorId) },
			{ type: 'footwear', itemId: footwearId, name: getItemName('footwear', footwearId) },
			{ type: 'accessory', itemId: accessoryId, name: getItemName('accessory', accessoryId) },
			{ type: 'costume', itemId: costumeId, name: getItemName('costume', costumeId) }
		]
	};
}

export function updateEquipmentSlot(
	properties: GVASData[],
	charIndex: number,
	slotType: 'weapon' | 'armor' | 'footwear' | 'accessory' | 'costume',
	newItemId: number
): void {
	const ids = getEquipDataIds(charIndex);
	const id16 = newItemId & 0xFFFF;

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
}

export function getAllEquipment(properties: GVASData[]): CharacterEquipment[] {
	return EQUIP_CHARACTERS.map((_, i) => getCharacterEquipment(properties, i));
}
