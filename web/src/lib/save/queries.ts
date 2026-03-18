import { PropertyType } from '../gvas/types.js';
import type { GVASData, UInt32PropertyData, IntPropertyData, StrPropertyData } from '../gvas/types.js';
import { DATA_IDS, DIFFICULTY_NAMES, TIME_OF_DAY_NAMES } from './data-ids.js';
import type { SaveSummary } from './structures.js';

function uint32ToBytes(value: number): Uint8Array {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, value, true);
	return bytes;
}

function getSocialLinkLevel(value: number): number {
	const bytes = uint32ToBytes(value);
	return bytes[0];
}

function setSocialLinkLevel(level: number, originalValue: number): number {
	const bytes = uint32ToBytes(originalValue);
	bytes[0] = level & 0xff;
	return new DataView(bytes.buffer).getUint32(0, true);
}

function getPaddingId(prop: GVASData): number {
	const padding = (prop as any).padding;
	if (!padding || !(padding instanceof Uint8Array) || padding.length < 4) return -1;
	return new DataView(padding.buffer, padding.byteOffset, padding.byteLength).getUint32(0, true);
}

export function findByIdUInt32(properties: GVASData[], id: number): number | undefined {
	for (const prop of properties) {
		if (prop.type === PropertyType.UInt32Property && getPaddingId(prop) === id) {
			return (prop as UInt32PropertyData).value;
		}
	}
	return undefined;
}

export function findByIdInt(properties: GVASData[], id: number): number | undefined {
	for (const prop of properties) {
		if (prop.type === PropertyType.IntProperty && getPaddingId(prop) === id) {
			return (prop as IntPropertyData).value;
		}
	}
	return undefined;
}

export function findStructProperty(properties: GVASData[], name: string): GVASData[] | undefined {
	for (const prop of properties) {
		if (prop.type === PropertyType.StructProperty && (prop as any).name === name) {
			return (prop as any).value as GVASData[];
		}
	}
	return undefined;
}

export function findInStruct(
	structProperties: GVASData[] | undefined,
	type: string,
	name: string
): GVASData | undefined {
	if (!structProperties) return undefined;
	for (const prop of structProperties) {
		if (prop.type === type && (prop as any).name === name) {
			return prop;
		}
	}
	return undefined;
}

export function getClearStatus(properties: GVASData[]): number | null {
	const headerStruct = findStructProperty(properties, 'SaveDataHeadder');
	if (!headerStruct) return null;

	const clearStatusProp = findInStruct(headerStruct, PropertyType.EnumProperty, 'ClearStatus');
	if (!clearStatusProp) return null;

	const statusStr = (clearStatusProp as any).value;
	if (statusStr === 'None') return 0;
	const status = parseInt(statusStr);
	return isNaN(status) ? 0 : status;
}

export function getSaveSummary(properties: GVASData[]): SaveSummary {
	const summary: SaveSummary = {
		socialStats: { academics: 0, charm: 0, courage: 0 },
		socialLinks: []
	};

	const money = findByIdUInt32(properties, DATA_IDS.Money);
	if (money !== undefined) summary.money = money;

	const playtime = findByIdUInt32(properties, DATA_IDS.Playtime);
	if (playtime !== undefined) summary.playtimeFrames = playtime;

	const day = findByIdUInt32(properties, DATA_IDS.DayCounter);
	if (day !== undefined) summary.day = day;

	const timeOfDay = findByIdUInt32(properties, DATA_IDS.TimeOfDay);
	if (timeOfDay !== undefined) {
		summary.timeOfDay = TIME_OF_DAY_NAMES[timeOfDay] || `Unknown (${timeOfDay})`;
	}

	summary.socialStats.academics = findByIdUInt32(properties, 5356) || 0;
	summary.socialStats.charm = findByIdUInt32(properties, 5358) || 0;
	summary.socialStats.courage = findByIdUInt32(properties, 5360) || 0;

	for (const prop of properties) {
		if (prop.type === PropertyType.UInt32Property) {
			const uintProp = prop as UInt32PropertyData;
			const dataId = getPaddingId(prop);
			if (dataId >= 5304 && dataId <= 5346 && dataId % 2 === 0) {
				summary.socialLinks.push({
					id: dataId,
					name: getSocialLinkName(dataId),
					level: getSocialLinkLevel(uintProp.value)
				});
			}
		}
	}

	const headerStruct = findStructProperty(properties, 'SaveDataHeadder');
	if (headerStruct) {
		const diffProp = findInStruct(headerStruct, PropertyType.UInt16Property, 'Difficulty');
		const diffVal = diffProp ? (diffProp as any).value as number : 0;
		summary.difficulty = DIFFICULTY_NAMES[diffVal] || `Unknown (${diffVal})`;

		const nameChars: number[] = [];
		for (const child of headerStruct) {
			if ((child as any).type === PropertyType.Int8Property && (child as any).name === 'FirstName') {
				nameChars.push((child as any).value);
			}
		}
		if (nameChars.length > 0) {
			summary.characterName = String.fromCharCode(...nameChars);
		}
	}

	return summary;
}

function getSocialLinkName(id: number): string {
	const names: Record<number, string> = {
		5304: 'SEES',
		5306: 'Tomochika',
		5308: 'Yamagishi',
		5310: 'Kirijo',
		5312: 'Odagiri',
		5314: 'Kitamura',
		5316: 'Takeba',
		5318: 'Miyamoto',
		5320: 'Fushimi',
		5322: 'Maya',
		5324: 'Hiraga',
		5326: 'Nishiwaki',
		5328: 'Maiko',
		5330: 'Pharos',
		5332: 'Bebe',
		5334: 'Tanaka',
		5336: 'Mutatsu',
		5338: 'Hayase',
		5340: 'Suemitsu',
		5342: 'Kamiki',
		5344: 'Nyx Annihilation Team',
		5346: 'Aigis'
	};
	return names[id] || `SL ${id}`;
}

function idToPadding(id: number): Uint8Array {
	const bytes = new Uint8Array(4);
	new DataView(bytes.buffer).setUint32(0, id, true);
	return bytes;
}

function insertBeforeFileEnd(properties: GVASData[], newProp: GVASData): void {
	const fileEndIndex = properties.findIndex(p => p.type === PropertyType.FileEndProperty);
	if (fileEndIndex !== -1) {
		properties.splice(fileEndIndex, 0, newProp);
	} else {
		properties.push(newProp);
	}
}

export function createUInt32Property(id: number, value: number): UInt32PropertyData {
	return {
		type: PropertyType.UInt32Property,
		name: 'SaveDataArea',
		paddingStatic: new Uint8Array([0x04, 0x00, 0x00, 0x00]),
		padding: idToPadding(id),
		value
	};
}

export function upsertUInt32Property(
	properties: GVASData[],
	id: number,
	newValue: number
): boolean {
	for (const prop of properties) {
		if (prop.type === PropertyType.UInt32Property && getPaddingId(prop) === id) {
			(prop as UInt32PropertyData).value = newValue;
			return true;
		}
	}
	insertBeforeFileEnd(properties, createUInt32Property(id, newValue));
	return true;
}

export function updateUInt32Property(
	properties: GVASData[],
	id: number,
	newValue: number
): boolean {
	for (const prop of properties) {
		if (prop.type === PropertyType.UInt32Property && getPaddingId(prop) === id) {
			(prop as UInt32PropertyData).value = newValue;
			return true;
		}
	}
	return false;
}

export function updateSocialLinkLevel(
	properties: GVASData[],
	id: number,
	newLevel: number
): boolean {
	for (const prop of properties) {
		if (prop.type === PropertyType.UInt32Property && getPaddingId(prop) === id) {
			const currentValue = (prop as UInt32PropertyData).value;
			(prop as UInt32PropertyData).value = setSocialLinkLevel(newLevel, currentValue);
			return true;
		}
	}
	return false;
}

export function updateIntById(
	properties: GVASData[],
	id: number,
	newValue: number
): boolean {
	for (const prop of properties) {
		if (prop.type === PropertyType.IntProperty && getPaddingId(prop) === id) {
			(prop as IntPropertyData).value = newValue;
			return true;
		}
	}
	return false;
}

export function getDifficulty(properties: GVASData[]): number {
	const headerStruct = findStructProperty(properties, 'SaveDataHeadder');
	if (!headerStruct) return 0;
	const diffProp = findInStruct(headerStruct, PropertyType.UInt16Property, 'Difficulty');
	if (!diffProp) return 0;
	return (diffProp as any).value as number;
}

export function updateDifficulty(properties: GVASData[], newValue: number): boolean {
	const headerStruct = findStructProperty(properties, 'SaveDataHeadder');
	if (!headerStruct) return false;
	const diffProp = findInStruct(headerStruct, PropertyType.UInt16Property, 'Difficulty');
	if (!diffProp) return false;
	(diffProp as any).value = newValue;
	return true;
}

export function getStrProperty(properties: GVASData[], name: string): string | undefined {
	for (const prop of properties) {
		if (prop.type === PropertyType.StrProperty && (prop as any).name === name) {
			return (prop as StrPropertyData).value;
		}
	}
	return undefined;
}

export function updateStrProperty(
	properties: GVASData[],
	name: string,
	newValue: string
): boolean {
	for (const prop of properties) {
		if (prop.type === PropertyType.StrProperty && (prop as any).name === name) {
			(prop as StrPropertyData).value = newValue;
			return true;
		}
	}
	return false;
}
