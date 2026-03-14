<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { findByIdUInt32, updateUInt32Property } from '$lib/save/queries.js';
	import { SOCIAL_STAT_THRESHOLD, SOCIAL_STAT_TIERS } from '$lib/save/data-ids.js';

	const STAT_MAX = 999;

	function getTierName(stat: string, value: number): string {
		const tiers = SOCIAL_STAT_TIERS[stat];
		if (!tiers) return '';
		let name = tiers[0].name;
		for (const tier of tiers) {
			if (value >= tier.min) name = tier.name;
		}
		return name;
	}

	let academics = 0;
	let charm = 0;
	let courage = 0;

	$: if ($saveStore.properties.length > 0) {
		academics = findByIdUInt32($saveStore.properties, 5356) || 0;
		charm = findByIdUInt32($saveStore.properties, 5358) || 0;
		courage = findByIdUInt32($saveStore.properties, 5360) || 0;
	}

	function setMax(stat: 'academics' | 'charm' | 'courage') {
		if (stat === 'academics') {
			academics = SOCIAL_STAT_THRESHOLD.Academics;
			updateUInt32Property($saveStore.properties, 5356, SOCIAL_STAT_THRESHOLD.Academics);
		} else if (stat === 'charm') {
			charm = SOCIAL_STAT_THRESHOLD.Charm;
			updateUInt32Property($saveStore.properties, 5358, SOCIAL_STAT_THRESHOLD.Charm);
		} else {
			courage = SOCIAL_STAT_THRESHOLD.Courage;
			updateUInt32Property($saveStore.properties, 5360, SOCIAL_STAT_THRESHOLD.Courage);
		}
	}

	function updateStat(stat: 'academics' | 'charm' | 'courage', value: number) {
		const clamped = Math.max(0, Math.min(STAT_MAX, Math.floor(value)));
		if (stat === 'academics') {
			academics = clamped;
			updateUInt32Property($saveStore.properties, 5356, clamped);
		} else if (stat === 'charm') {
			charm = clamped;
			updateUInt32Property($saveStore.properties, 5358, clamped);
		} else {
			courage = clamped;
			updateUInt32Property($saveStore.properties, 5360, clamped);
		}
	}
</script>

<div class="stat-editor">
	<div class="form-group">
		<div class="stat-header">
			<label class="form-label" for="academics-slider">Academics</label>
			<button class="max-btn" onclick={() => setMax('academics')}>Max</button>
		</div>
		<div class="slider-with-ticks">
			<div class="slider-container">
				<input
					id="academics-slider"
					type="range"
					min="0"
					max={STAT_MAX}
					bind:value={academics}
					onchange={(e) => updateStat('academics', Number((e.target as HTMLInputElement).value))}
					class="slider"
				/>
				<span class="slider-value">{academics}/{STAT_MAX} ({getTierName('Academics', academics)})</span>
			</div>
			<div class="tick-marks">
				{#each SOCIAL_STAT_TIERS['Academics'].slice(1) as tier}
					<div class="tick-mark" style="left: {(tier.min / STAT_MAX) * 100}%" title="{tier.name} ({tier.min})"></div>
				{/each}
			</div>
		</div>
	</div>

	<div class="form-group">
		<div class="stat-header">
			<label class="form-label" for="charm-slider">Charm</label>
			<button class="max-btn" onclick={() => setMax('charm')}>Max</button>
		</div>
		<div class="slider-with-ticks">
			<div class="slider-container">
				<input
					id="charm-slider"
					type="range"
					min="0"
					max={STAT_MAX}
					bind:value={charm}
					onchange={(e) => updateStat('charm', Number((e.target as HTMLInputElement).value))}
					class="slider"
				/>
				<span class="slider-value">{charm}/{STAT_MAX} ({getTierName('Charm', charm)})</span>
			</div>
			<div class="tick-marks">
				{#each SOCIAL_STAT_TIERS['Charm'].slice(1) as tier}
					<div class="tick-mark" style="left: {(tier.min / STAT_MAX) * 100}%" title="{tier.name} ({tier.min})"></div>
				{/each}
			</div>
		</div>
	</div>

	<div class="form-group">
		<div class="stat-header">
			<label class="form-label" for="courage-slider">Courage</label>
			<button class="max-btn" onclick={() => setMax('courage')}>Max</button>
		</div>
		<div class="slider-with-ticks">
			<div class="slider-container">
				<input
					id="courage-slider"
					type="range"
					min="0"
					max={STAT_MAX}
					bind:value={courage}
					onchange={(e) => updateStat('courage', Number((e.target as HTMLInputElement).value))}
					class="slider"
				/>
				<span class="slider-value">{courage}/{STAT_MAX} ({getTierName('Courage', courage)})</span>
			</div>
			<div class="tick-marks">
				{#each SOCIAL_STAT_TIERS['Courage'].slice(1) as tier}
					<div class="tick-mark" style="left: {(tier.min / STAT_MAX) * 100}%" title="{tier.name} ({tier.min})"></div>
				{/each}
			</div>
		</div>
	</div>
</div>

<style>
	.stat-editor {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.stat-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.slider-with-ticks {
		position: relative;
	}

	.tick-marks {
		position: relative;
		height: 0.625rem;
		margin-top: 0.25rem;
		margin-right: calc(10rem + 1rem);
	}

	.tick-mark {
		position: absolute;
		top: 50%;
		width: 5px;
		height: 5px;
		border-radius: 50%;
		background: var(--text-muted);
		transform: translate(-50%, -50%);
	}
</style>
