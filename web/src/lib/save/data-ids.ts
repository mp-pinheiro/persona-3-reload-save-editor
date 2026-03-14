export const SOCIAL_LINK_IDS = {
	SEES: 5304,
	Tomochika: 5306,
	Yamagishi: 5308,
	Kirijo: 5310,
	Odagiri: 5312,
	Kitamura: 5314,
	Takeba: 5316,
	Miyamoto: 5318,
	Fushimi: 5320,
	Maya: 5322,
	Hiraga: 5324,
	Nishiwaki: 5326,
	Maiko: 5328,
	Pharos: 5330,
	Bebe: 5332,
	Tanaka: 5334,
	Mutatsu: 5336,
	Hayase: 5338,
	Suemitsu: 5340,
	Kamiki: 5342,
	NyxAnnihilationTeam: 5344,
	Aigis: 5346
};

export const SOCIAL_STAT_IDS = {
	Academics: 5356,
	Charm: 5358,
	Courage: 5360
};

export const SOCIAL_STAT_THRESHOLD = {
	Academics: 230,
	Charm: 100,
	Courage: 80
};

export const DATA_IDS = {
	Money: 7261,
	Playtime: 12836,
	Difficulty: 388,
	DayCounter: 1932,
	TimeOfDay: 1933,
	DaySkipFlag: 1934,
	TwilightFragmentsCollected: 1429,
	MonadDoorsConquered: 1393,
	TreasureChestsOpened: 7909,
	TwilightFragmentsUsed: 1431,
	ShiftCounter: 576,
	ChanceEncounters: 13158,
	JobEarnings: 516,
	AllOutAttackBase: 7909,
	AllOutAttackOffset: 32784
};

export const DIFFICULTY_VALUES: Record<number, string> = {
	2166366214: 'Peaceful',
	2166374406: 'Easy',
	2166390790: 'Normal',
	2166423558: 'Hard',
	100794368: 'Merciless'
};

export const TIME_OF_DAY_NAMES: Record<number, string> = {
	257: 'Very Early Morning',
	258: 'Early Morning',
	259: 'Morning',
	260: 'Lunch Break',
	261: 'Afternoon',
	262: 'After School',
	263: 'Evening',
	264: 'Dark Hour',
	265: 'Late Evening'
};

export const SOCIAL_STAT_TIERS: Record<string, { name: string; min: number }[]> = {
	Academics: [
		{ name: 'Slacker', min: 0 },
		{ name: 'Average', min: 20 },
		{ name: 'Above Average', min: 55 },
		{ name: 'Smart', min: 100 },
		{ name: 'Intelligent', min: 155 },
		{ name: 'Genius', min: 230 }
	],
	Charm: [
		{ name: 'Plain', min: 0 },
		{ name: 'Unpolished', min: 15 },
		{ name: 'Confident', min: 30 },
		{ name: 'Smooth', min: 45 },
		{ name: 'Popular', min: 70 },
		{ name: 'Charismatic', min: 100 }
	],
	Courage: [
		{ name: 'Timid', min: 0 },
		{ name: 'Ordinary', min: 15 },
		{ name: 'Determined', min: 30 },
		{ name: 'Tough', min: 45 },
		{ name: 'Fearless', min: 60 },
		{ name: 'Badass', min: 80 }
	]
};

export const ALL_OUT_ATTACK_IDS = [
	7909, 40689, 73473, 106257, 139041, 171825, 204609
];
