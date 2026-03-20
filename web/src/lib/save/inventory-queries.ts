import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, upsertUInt32Property } from './queries.js';
import { INVENTORY } from './data-ids.js';
import { CONSUMABLE_NAMES } from './inventory-data.js';

export interface InventoryItem {
	localId: number;
	name: string;
	quantity: number;
}

function getDataIdAndByte(localId: number): { dataId: number; bytePos: number } {
	return {
		dataId: INVENTORY.ConsumablesBase + Math.floor(localId / 4),
		bytePos: localId % 4
	};
}

export function getItemQuantity(properties: GVASData[], localId: number): number {
	const { dataId, bytePos } = getDataIdAndByte(localId);
	const value = findByIdUInt32(properties, dataId);
	if (value === undefined) return 0;
	return (value >>> (bytePos * 8)) & 0xff;
}

export function setItemQuantity(properties: GVASData[], localId: number, qty: number): void {
	const clamped = Math.max(0, Math.min(99, Math.floor(qty)));
	const { dataId, bytePos } = getDataIdAndByte(localId);
	const current = findByIdUInt32(properties, dataId) ?? 0;
	const mask = ~(0xff << (bytePos * 8));
	const newValue = ((current & mask) | (clamped << (bytePos * 8))) >>> 0;
	upsertUInt32Property(properties, dataId, newValue);
}

export function getAllConsumables(properties: GVASData[]): InventoryItem[] {
	const items: InventoryItem[] = [];
	for (const [idStr, name] of Object.entries(CONSUMABLE_NAMES)) {
		const localId = Number(idStr);
		const quantity = getItemQuantity(properties, localId);
		items.push({ localId, name, quantity });
	}
	return items;
}
