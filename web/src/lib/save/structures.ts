import { SOCIAL_STAT_THRESHOLD } from './data-ids.js';

export interface SocialLink {
	id: number;
	name: string;
	level: number;
}

export interface SocialStat {
	id: number;
	name: string;
	value: number;
	threshold: number;
}

export interface SaveSummary {
	characterName?: string;
	playtimeFrames?: number;
	day?: number;
	timeOfDay?: string;
	difficulty?: string;
	money?: number;
	socialStats: {
		academics: number;
		charm: number;
		courage: number;
	};
	socialLinks: SocialLink[];
}

export interface AchievementProgress {
	name: string;
	completed: boolean;
	progress: number;
	max: number;
	description: string;
}

export const SOCIAL_LINK_DEFINITIONS: { name: string; id: number }[] = [
	{ name: 'SEES', id: 5304 },
	{ name: 'Tomochika', id: 5306 },
	{ name: 'Yamagishi', id: 5308 },
	{ name: 'Kirijo', id: 5310 },
	{ name: 'Odagiri', id: 5312 },
	{ name: 'Kitamura', id: 5314 },
	{ name: 'Takeba', id: 5316 },
	{ name: 'Miyamoto', id: 5318 },
	{ name: 'Fushimi', id: 5320 },
	{ name: 'Maya', id: 5322 },
	{ name: 'Hiraga', id: 5324 },
	{ name: 'Nishiwaki', id: 5326 },
	{ name: 'Maiko', id: 5328 },
	{ name: 'Pharos', id: 5330 },
	{ name: 'Bebe', id: 5332 },
	{ name: 'Tanaka', id: 5334 },
	{ name: 'Mutatsu', id: 5336 },
	{ name: 'Hayase', id: 5338 },
	{ name: 'Suemitsu', id: 5340 },
	{ name: 'Kamiki', id: 5342 },
	{ name: 'Nyx Annihilation Team', id: 5344 },
	{ name: 'Aigis', id: 5346 }
];

export const SOCIAL_STAT_DEFINITIONS = [
	{ name: 'Academics', id: 5356, threshold: SOCIAL_STAT_THRESHOLD.Academics },
	{ name: 'Charm', id: 5358, threshold: SOCIAL_STAT_THRESHOLD.Charm },
	{ name: 'Courage', id: 5360, threshold: SOCIAL_STAT_THRESHOLD.Courage }
];
