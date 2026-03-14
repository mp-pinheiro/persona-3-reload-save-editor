<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { findByIdUInt32, updateUInt32Property } from '$lib/save/queries.js';
	import { SOCIAL_STAT_MAX } from '$lib/save/data-ids.js';

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
			academics = SOCIAL_STAT_MAX.Academics;
			updateUInt32Property($saveStore.properties, 5356, SOCIAL_STAT_MAX.Academics);
		} else if (stat === 'charm') {
			charm = SOCIAL_STAT_MAX.Charm;
			updateUInt32Property($saveStore.properties, 5358, SOCIAL_STAT_MAX.Charm);
		} else {
			courage = SOCIAL_STAT_MAX.Courage;
			updateUInt32Property($saveStore.properties, 5360, SOCIAL_STAT_MAX.Courage);
		}
	}

	function updateStat(stat: 'academics' | 'charm' | 'courage', value: number) {
		if (stat === 'academics') {
			const clamped = Math.max(0, Math.min(SOCIAL_STAT_MAX.Academics, Math.floor(value)));
			academics = clamped;
			updateUInt32Property($saveStore.properties, 5356, clamped);
		} else if (stat === 'charm') {
			const clamped = Math.max(0, Math.min(SOCIAL_STAT_MAX.Charm, Math.floor(value)));
			charm = clamped;
			updateUInt32Property($saveStore.properties, 5358, clamped);
		} else {
			const clamped = Math.max(0, Math.min(SOCIAL_STAT_MAX.Courage, Math.floor(value)));
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
		<div class="slider-container">
			<input
				id="academics-slider"
				type="range"
				min="0"
				max={SOCIAL_STAT_MAX.Academics}
				bind:value={academics}
				onchange={(e) => updateStat('academics', Number((e.target as HTMLInputElement).value))}
				class="slider"
			/>
			<span class="slider-value">{academics}/230</span>
		</div>
	</div>

	<div class="form-group">
		<div class="stat-header">
			<label class="form-label" for="charm-slider">Charm</label>
			<button class="max-btn" onclick={() => setMax('charm')}>Max</button>
		</div>
		<div class="slider-container">
			<input
				id="charm-slider"
				type="range"
				min="0"
				max={SOCIAL_STAT_MAX.Charm}
				bind:value={charm}
				onchange={(e) => updateStat('charm', Number((e.target as HTMLInputElement).value))}
				class="slider"
			/>
			<span class="slider-value">{charm}/100</span>
		</div>
	</div>

	<div class="form-group">
		<div class="stat-header">
			<label class="form-label" for="courage-slider">Courage</label>
			<button class="max-btn" onclick={() => setMax('courage')}>Max</button>
		</div>
		<div class="slider-container">
			<input
				id="courage-slider"
				type="range"
				min="0"
				max={SOCIAL_STAT_MAX.Courage}
				bind:value={courage}
				onchange={(e) => updateStat('courage', Number((e.target as HTMLInputElement).value))}
				class="slider"
			/>
			<span class="slider-value">{courage}/80</span>
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
</style>
