import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, upsertUInt32Property } from './queries.js';
import { INVENTORY } from './data-ids.js';
import { CONSUMABLE_NAMES, MATERIAL_NAMES } from './inventory-data.js';

export type ItemCategory = 'consumables' | 'materials';

export interface InventoryItem {
	localId: number;
	name: string;
	quantity: number;
	category: ItemCategory;
}

const CATEGORY_CONFIG: Record<ItemCategory, { base: number; names: Record<number, string> }> = {
	consumables: { base: INVENTORY.ConsumablesBase, names: CONSUMABLE_NAMES },
	materials: { base: INVENTORY.MaterialsBase, names: MATERIAL_NAMES }
};

function getDataIdAndByte(base: number, localId: number): { dataId: number; bytePos: number } {
	return {
		dataId: base + Math.floor(localId / 4),
		bytePos: localId % 4
	};
}

export function getItemQuantity(properties: GVASData[], category: ItemCategory, localId: number): number {
	const { dataId, bytePos } = getDataIdAndByte(CATEGORY_CONFIG[category].base, localId);
	const value = findByIdUInt32(properties, dataId);
	if (value === undefined) return 0;
	return (value >>> (bytePos * 8)) & 0xff;
}

export function setItemQuantity(properties: GVASData[], category: ItemCategory, localId: number, qty: number): void {
	const clamped = Math.max(0, Math.min(99, Math.floor(qty)));
	const { dataId, bytePos } = getDataIdAndByte(CATEGORY_CONFIG[category].base, localId);
	const current = findByIdUInt32(properties, dataId) ?? 0;
	const mask = ~(0xff << (bytePos * 8));
	const newValue = ((current & mask) | (clamped << (bytePos * 8))) >>> 0;
	upsertUInt32Property(properties, dataId, newValue);
}

export function getItemsByCategory(properties: GVASData[], category: ItemCategory): InventoryItem[] {
	const { names } = CATEGORY_CONFIG[category];
	const items: InventoryItem[] = [];
	for (const [idStr, name] of Object.entries(names)) {
		const localId = Number(idStr);
		const quantity = getItemQuantity(properties, category, localId);
		items.push({ localId, name, quantity, category });
	}
	return items;
}
