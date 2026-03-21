import { WEAPON_NAMES, ARMOR_NAMES, FOOTWEAR_NAMES, ACCESSORY_NAMES, COSTUME_NAMES } from './equipment-names.js';

export { WEAPON_NAMES, ARMOR_NAMES, FOOTWEAR_NAMES, ACCESSORY_NAMES, COSTUME_NAMES };

export type EquipSlotType = 'weapon' | 'armor' | 'footwear' | 'accessory' | 'costume';

export interface EquipmentSlot {
	type: EquipSlotType;
	itemId: number;
	name: string;
}

export interface CharacterEquipment {
	characterName: string;
	slots: EquipmentSlot[];
}

const SLOT_NAMES: Record<EquipSlotType, Record<number, string>> = {
	weapon: WEAPON_NAMES,
	armor: ARMOR_NAMES,
	footwear: FOOTWEAR_NAMES,
	accessory: ACCESSORY_NAMES,
	costume: COSTUME_NAMES
};

export function getItemName(type: EquipSlotType, itemId: number): string {
	return SLOT_NAMES[type][itemId] ?? `Unknown (${itemId})`;
}

export const EQUIP_BLOCK6_BASE = 209934;
export const EQUIP_CHAR_STRIDE = 176;

export const EQUIP_CHARACTERS = [
	{ key: 'protagonist', name: 'Protagonist', offset: 0 },
	{ key: 'yukari', name: 'Yukari', offset: 1 },
	{ key: 'junpei', name: 'Junpei', offset: 2 },
	{ key: 'akihiko', name: 'Akihiko', offset: 3 },
	{ key: 'mitsuru', name: 'Mitsuru', offset: 4 },
	{ key: 'fuuka', name: 'Fuuka', offset: 5 },
	{ key: 'aigis', name: 'Aigis', offset: 6 },
	{ key: 'ken', name: 'Ken', offset: 7 },
	{ key: 'koromaru', name: 'Koromaru', offset: 8 },
	{ key: 'shinjiro', name: 'Shinjiro', offset: 9 }
];

export function getEquipDataIds(charIndex: number): { weaponArmor: number; footAcc: number; costume: number } {
	const base = EQUIP_BLOCK6_BASE + charIndex * EQUIP_CHAR_STRIDE;
	return { weaponArmor: base, footAcc: base + 1, costume: base + 2 };
}
