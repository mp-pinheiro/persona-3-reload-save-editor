import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, updateUInt32Property, upsertUInt32Property } from './queries.js';
import {
	type CharacterDef,
	type PersonaSlotData,
	SLOT_OFFSETS,
	getPersonaSlotBaseId,
	decodePersonaId,
	encodePersonaId,
	decodeSkillSlot,
	encodeSkillSlot,
	decodePersonaStats,
	encodePersonaStats
} from './combat-data.js';

export interface CharacterData {
	hp: number;
	sp: number;
	level: number;
	exp: number;
}

export function getCharacterData(properties: GVASData[], char: CharacterDef): CharacterData {
	return {
		hp: findByIdUInt32(properties, char.baseId + char.hpOffset) ?? 0,
		sp: findByIdUInt32(properties, char.baseId + char.spOffset) ?? 0,
		level: findByIdUInt32(properties, char.baseId + char.levelOffset) ?? 0,
		exp: findByIdUInt32(properties, char.baseId + char.expOffset) ?? 0
	};
}

export function updateCharacterField(
	properties: GVASData[],
	char: CharacterDef,
	field: keyof CharacterData,
	value: number
): boolean {
	const offsets: Record<keyof CharacterData, number> = {
		hp: char.hpOffset,
		sp: char.spOffset,
		level: char.levelOffset,
		exp: char.expOffset
	};
	const id = char.baseId + offsets[field];
	return updateUInt32Property(properties, id, value);
}

export function getPersonaSlot(
	properties: GVASData[],
	char: CharacterDef,
	slotIndex: number
): PersonaSlotData {
	const base = getPersonaSlotBaseId(char, slotIndex);

	const rawId = findByIdUInt32(properties, base + SLOT_OFFSETS.personaId) ?? 0;
	const rawSkill1 = findByIdUInt32(properties, base + SLOT_OFFSETS.skillSlot1) ?? 0;
	const rawSkill2 = findByIdUInt32(properties, base + SLOT_OFFSETS.skillSlot2) ?? 0;
	const rawSkill3 = findByIdUInt32(properties, base + SLOT_OFFSETS.skillSlot3) ?? 0;
	const rawSkill4 = findByIdUInt32(properties, base + SLOT_OFFSETS.skillSlot4) ?? 0;
	const rawStats = findByIdUInt32(properties, base + SLOT_OFFSETS.stats) ?? 0;

	const [s1, s2] = decodeSkillSlot(rawSkill1);
	const [s3, s4] = decodeSkillSlot(rawSkill2);
	const [s5, s6] = decodeSkillSlot(rawSkill3);
	const [s7, s8] = decodeSkillSlot(rawSkill4);

	return {
		personaId: decodePersonaId(rawId),
		level: findByIdUInt32(properties, base + SLOT_OFFSETS.level) ?? 0,
		exp: findByIdUInt32(properties, base + SLOT_OFFSETS.exp) ?? 0,
		skills: [s1, s2, s3, s4, s5, s6, s7, s8],
		stats: decodePersonaStats(rawStats),
		lu: (findByIdUInt32(properties, base + SLOT_OFFSETS.lu) ?? 0) & 0xff
	};
}

export function updatePersonaId(
	properties: GVASData[],
	char: CharacterDef,
	slotIndex: number,
	personaId: number
): boolean {
	const base = getPersonaSlotBaseId(char, slotIndex);
	const id = base + SLOT_OFFSETS.personaId;
	return upsertUInt32Property(properties, id, encodePersonaId(personaId));
}

export function updatePersonaLevel(
	properties: GVASData[],
	char: CharacterDef,
	slotIndex: number,
	level: number
): boolean {
	const base = getPersonaSlotBaseId(char, slotIndex);
	const id = base + SLOT_OFFSETS.level;
	return upsertUInt32Property(properties, id, level);
}

export function updatePersonaExp(
	properties: GVASData[],
	char: CharacterDef,
	slotIndex: number,
	exp: number
): boolean {
	const base = getPersonaSlotBaseId(char, slotIndex);
	const id = base + SLOT_OFFSETS.exp;
	return upsertUInt32Property(properties, id, exp);
}

export function updatePersonaSkills(
	properties: GVASData[],
	char: CharacterDef,
	slotIndex: number,
	skills: number[]
): boolean {
	const base = getPersonaSlotBaseId(char, slotIndex);
	const padded = [...skills, 0, 0, 0, 0, 0, 0, 0, 0].slice(0, 8);

	const ok1 = upsertUInt32Property(properties, base + SLOT_OFFSETS.skillSlot1, encodeSkillSlot(padded[0], padded[1]));
	const ok2 = upsertUInt32Property(properties, base + SLOT_OFFSETS.skillSlot2, encodeSkillSlot(padded[2], padded[3]));
	const ok3 = upsertUInt32Property(properties, base + SLOT_OFFSETS.skillSlot3, encodeSkillSlot(padded[4], padded[5]));
	const ok4 = upsertUInt32Property(properties, base + SLOT_OFFSETS.skillSlot4, encodeSkillSlot(padded[6], padded[7]));

	return ok1 && ok2 && ok3 && ok4;
}

export function updatePersonaStats(
	properties: GVASData[],
	char: CharacterDef,
	slotIndex: number,
	stats: { st: number; ma: number; en: number; ag: number },
	lu: number
): boolean {
	const base = getPersonaSlotBaseId(char, slotIndex);
	const okStats = upsertUInt32Property(
		properties,
		base + SLOT_OFFSETS.stats,
		encodePersonaStats(stats.st, stats.ma, stats.en, stats.ag)
	);
	const luId = base + SLOT_OFFSETS.lu;
	const rawLu = findByIdUInt32(properties, luId) ?? 0;
	const newLu = (rawLu & 0xffffff00) | (lu & 0xff);
	const okLu = upsertUInt32Property(properties, luId, newLu);
	return okStats && okLu;
}

export function clonePersonaSlot(
	properties: GVASData[],
	char: CharacterDef,
	targetSlotIndex: number,
	source: PersonaSlotData
): boolean {
	const ok1 = updatePersonaId(properties, char, targetSlotIndex, source.personaId);
	const ok2 = updatePersonaLevel(properties, char, targetSlotIndex, source.level);
	const ok3 = updatePersonaExp(properties, char, targetSlotIndex, source.exp);
	const ok4 = updatePersonaSkills(properties, char, targetSlotIndex, source.skills);
	const ok5 = updatePersonaStats(properties, char, targetSlotIndex, source.stats, source.lu);
	return ok1 && ok2 && ok3 && ok4 && ok5;
}
