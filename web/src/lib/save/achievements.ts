import type { GVASData } from '../gvas/types.js';
import { findByIdUInt32, getClearStatus, getSaveSummary } from './queries.js';
import { DATA_IDS, ALL_OUT_ATTACK_IDS } from './data-ids.js';
import type { AchievementProgress } from './structures.js';

export interface AchievementReport {
	completed: AchievementProgress[];
	inProgress: AchievementProgress[];
	cannotTrack: AchievementProgress[];
}

export function getAchievementProgress(properties: GVASData[]): AchievementReport {
	const summary = getSaveSummary(properties);
	const clearStatus = getClearStatus(properties);

	const completed: AchievementProgress[] = [];
	const inProgress: AchievementProgress[] = [];
	const cannotTrack: AchievementProgress[] = [];

	// Social Link achievements
	const maxedLinks = summary.socialLinks.filter((sl) => sl.level === 10).length;
	const unlockedLinks = summary.socialLinks.filter((sl) => sl.level > 0).length;

	completed.push({
		name: 'Unbreakable Link',
		completed: maxedLinks >= 1,
		progress: maxedLinks,
		max: 1,
		description: 'Maxed out one Social Link'
	});

	inProgress.push({
		name: 'People Person',
		completed: unlockedLinks === 22,
		progress: unlockedLinks,
		max: 22,
		description: 'Unlocked all Social Links'
	});

	inProgress.push({
		name: 'A Legacy of Friendships',
		completed: maxedLinks === 22,
		progress: maxedLinks,
		max: 22,
		description: 'Maxed out all Social Links'
	});

	// Social Stat achievements
	const { academics, charm, courage } = summary.socialStats;
	const hasMaxedStat = academics >= 230 || charm >= 100 || courage >= 80;
	const allMaxed = academics >= 230 && charm >= 100 && courage >= 80;

	completed.push({
		name: 'Specialist',
		completed: hasMaxedStat,
		progress: Math.max(academics, charm, courage),
		max: 230,
		description: 'Maxed out one Social Stat'
	});

	completed.push({
		name: 'Peak Performance',
		completed: allMaxed,
		progress: Math.min(academics, charm, courage),
		max: 230,
		description: 'Maxed out all Social Stats'
	});

	// Exploration achievements
	const twilightFragments = findByIdUInt32(properties, DATA_IDS.TwilightFragmentsCollected) || 0;
	inProgress.push({
		name: 'Eagle Eye',
		completed: twilightFragments >= 124,
		progress: twilightFragments,
		max: 124,
		description: 'Collect all 124 Twilight Fragments'
	});

	const monadDoors = findByIdUInt32(properties, DATA_IDS.MonadDoorsConquered) || 0;
	inProgress.push({
		name: 'Glimpse of the Depths',
		completed: monadDoors >= 10,
		progress: monadDoors,
		max: 10,
		description: 'Conquer 10 Monad Doors'
	});

	const treasureChests = findByIdUInt32(properties, DATA_IDS.TreasureChestsOpened) || 0;
	completed.push({
		name: 'Briefcase Burglar',
		completed: treasureChests >= 50,
		progress: treasureChests,
		max: 50,
		description: 'Open 50 Treasure Chests'
	});

	const fragmentsUsed = findByIdUInt32(properties, DATA_IDS.TwilightFragmentsUsed) || 0;
	completed.push({
		name: 'Shattered Plumes',
		completed: fragmentsUsed >= 50,
		progress: fragmentsUsed,
		max: 50,
		description: 'Use 50 Twilight Fragments'
	});

	// Combat achievements
	const allOutAttacks = findByIdUInt32(properties, DATA_IDS.AllOutAttackBase) || 0;
	completed.push({
		name: "Making the Dream Work",
		completed: allOutAttacks >= 50,
		progress: allOutAttacks,
		max: 50,
		description: 'Perform 50 All-Out Attacks'
	});

	const chanceEncounters = findByIdUInt32(properties, DATA_IDS.ChanceEncounters) || 0;
	completed.push({
		name: 'Shrouded Assassin',
		completed: chanceEncounters >= 50,
		progress: chanceEncounters,
		max: 50,
		description: 'Trigger 50 Chance Encounters'
	});

	// Story achievements
	if (clearStatus !== null) {
		const defeatedNyx = clearStatus !== 0;
		const goodEnding = clearStatus === 1;

		completed.push({
			name: 'The Great Seal',
			completed: defeatedNyx,
			progress: defeatedNyx ? 1 : 0,
			max: 1,
			description: 'Defeat Nyx'
		});

		completed.push({
			name: 'From Shadows into Light',
			completed: goodEnding,
			progress: goodEnding ? 1 : 0,
			max: 1,
			description: 'Watch the good ending'
		});
	} else {
		inProgress.push({
			name: 'The Great Seal',
			completed: false,
			progress: 0,
			max: 1,
			description: 'Defeat Nyx'
		});

		inProgress.push({
			name: 'From Shadows into Light',
			completed: false,
			progress: 0,
			max: 1,
			description: 'Watch the good ending'
		});
	}

	// Cannot track (requires data discovery)
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

	return { completed, inProgress, cannotTrack };
}
