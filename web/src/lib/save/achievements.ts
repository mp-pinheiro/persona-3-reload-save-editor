import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, getClearStatus, getSaveSummary } from './queries.js';
import { DATA_IDS } from './data-ids.js';
import type { AchievementProgress } from './structures.js';

export interface AchievementReport {
	completed: AchievementProgress[];
	inProgress: AchievementProgress[];
	cannotTrack: AchievementProgress[];
}

export function getAchievementProgress(properties: GVASData[]): AchievementReport {
	const summary = getSaveSummary(properties);
	const clearStatus = getClearStatus(properties);

	const trackable: AchievementProgress[] = [];
	const cannotTrack: AchievementProgress[] = [];

	// Social Link achievements
	const maxedLinks = summary.socialLinks.filter((sl) => sl.level === 10).length;
	const unlockedLinks = summary.socialLinks.filter((sl) => sl.level > 0).length;

	trackable.push({
		name: 'Unbreakable Link',
		completed: maxedLinks >= 1,
		progress: Math.min(maxedLinks, 1),
		max: 1,
		description: 'Maxed out one Social Link'
	});

	trackable.push({
		name: 'People Person',
		completed: unlockedLinks === 22,
		progress: Math.min(unlockedLinks, 22),
		max: 22,
		description: 'Unlocked all Social Links'
	});

	trackable.push({
		name: 'A Legacy of Friendships',
		completed: maxedLinks === 22,
		progress: Math.min(maxedLinks, 22),
		max: 22,
		description: 'Maxed out all Social Links'
	});

	// Social Stat achievements
	const { academics, charm, courage } = summary.socialStats;
	const hasMaxedStat = academics >= 230 || charm >= 100 || courage >= 80;
	const allMaxed = academics >= 230 && charm >= 100 && courage >= 80;

	trackable.push({
		name: 'Specialist',
		completed: hasMaxedStat,
		progress: Math.min(Math.max(academics, charm, courage), 230),
		max: 230,
		description: 'Maxed out one Social Stat'
	});

	trackable.push({
		name: 'Peak Performance',
		completed: allMaxed,
		progress: Math.min(academics, charm, courage),
		max: 230,
		description: 'Maxed out all Social Stats'
	});

	// Exploration achievements
	const twilightFragments = findByIdUInt32(properties, DATA_IDS.TwilightFragmentsCollected) || 0;
	trackable.push({
		name: 'Eagle Eye',
		completed: twilightFragments >= 124,
		progress: Math.min(twilightFragments, 124),
		max: 124,
		description: 'Collect all 124 Twilight Fragments'
	});

	const monadDoors = findByIdUInt32(properties, DATA_IDS.MonadDoorsConquered) || 0;
	trackable.push({
		name: 'Glimpse of the Depths',
		completed: monadDoors >= 10,
		progress: Math.min(monadDoors, 10),
		max: 10,
		description: 'Conquer 10 Monad Doors'
	});

	const treasureChests = findByIdUInt32(properties, DATA_IDS.TreasureChestsOpened) || 0;
	trackable.push({
		name: 'Briefcase Burglar',
		completed: treasureChests >= 50,
		progress: Math.min(treasureChests, 50),
		max: 50,
		description: 'Open 50 Treasure Chests'
	});

	const fragmentsUsed = findByIdUInt32(properties, DATA_IDS.TwilightFragmentsUsed) || 0;
	trackable.push({
		name: 'Shattered Plumes',
		completed: fragmentsUsed >= 50,
		progress: Math.min(fragmentsUsed, 50),
		max: 50,
		description: 'Use 50 Twilight Fragments'
	});

	// Story achievements
	const defeatedNyx = clearStatus !== null && clearStatus !== 0;
	const goodEnding = clearStatus === 1;

	trackable.push({
		name: 'The Great Seal',
		completed: defeatedNyx,
		progress: defeatedNyx ? 1 : 0,
		max: 1,
		description: 'Defeat Nyx'
	});

	trackable.push({
		name: 'From Shadows into Light',
		completed: goodEnding,
		progress: goodEnding ? 1 : 0,
		max: 1,
		description: 'Watch the good ending'
	});

	cannotTrack.push({
		name: 'Shrouded Assassin',
		completed: false,
		progress: 0,
		max: 50,
		description: 'Data ID 13158 reads 0 even when achievement is unlocked'
	});

	cannotTrack.push({
		name: 'Making the Dream Work',
		completed: false,
		progress: 0,
		max: 50,
		description: 'Data ID 7909 collides with Treasure Chests counter'
	});

	cannotTrack.push({
		name: 'Path to Salvation',
		completed: false,
		progress: 0,
		max: 1,
		description: 'Fused Messiah (requires compendium data)'
	});

	cannotTrack.push({
		name: 'The First of Many',
		completed: false,
		progress: 0,
		max: 1,
		description: 'Perform a Dyad Fusion'
	});

	cannotTrack.push({
		name: 'Fusion Artisan',
		completed: false,
		progress: 0,
		max: 1,
		description: 'Perform a 3+ Persona fusion'
	});

	cannotTrack.push({
		name: "There's No 'I' in 'Team'",
		completed: false,
		progress: findByIdUInt32(properties, DATA_IDS.ShiftCounter) || 0,
		max: 9,
		description: 'Perform a Shift'
	});

	cannotTrack.push({
		name: 'The Grindset Mindset',
		completed: false,
		progress: findByIdUInt32(properties, DATA_IDS.JobEarnings) || 0,
		max: 50000,
		description: 'Earn 50000 yen from jobs'
	});

	const completed = trackable.filter((a) => a.completed);
	const inProgress = trackable.filter((a) => !a.completed);

	return { completed, inProgress, cannotTrack };
}
