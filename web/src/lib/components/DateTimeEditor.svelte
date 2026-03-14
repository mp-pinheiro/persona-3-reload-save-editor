<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { findByIdUInt32, updateUInt32Property } from '$lib/save/queries.js';
	import { DATA_IDS, TIME_OF_DAY_NAMES } from '$lib/save/data-ids.js';

	let dayValue = $state(1);
	let timeOfDayValue = $state(257);

	let currentDay = $derived(findByIdUInt32($saveStore.properties, DATA_IDS.DayCounter));
	let currentTime = $derived(findByIdUInt32($saveStore.properties, DATA_IDS.TimeOfDay));

	$effect(() => {
		if (currentDay !== undefined) dayValue = currentDay;
	});

	$effect(() => {
		if (currentTime !== undefined) timeOfDayValue = currentTime;
	});

	function updateDay(value: number) {
		const clamped = Math.max(1, Math.min(999, Math.floor(value)));
		dayValue = clamped;
		updateUInt32Property($saveStore.properties, DATA_IDS.DayCounter, clamped);
	}

	function updateTimeOfDay(value: number) {
		timeOfDayValue = value;
		updateUInt32Property($saveStore.properties, DATA_IDS.TimeOfDay, value);
	}

	const timeOptions = Object.entries(TIME_OF_DAY_NAMES).map(([val, name]) => ({
		value: Number(val),
		label: name
	}));
</script>

<div class="datetime-editor">
	<div class="form-group">
		<label class="form-label" for="day-input">Day Counter</label>
		<input
			id="day-input"
			class="form-input"
			type="number"
			min="1"
			max="999"
			bind:value={dayValue}
			onchange={(e) => updateDay(Number((e.target as HTMLInputElement).value))}
		/>
		<p class="form-hint">Current day in the game calendar.</p>
	</div>

	<div class="form-group">
		<label class="form-label" for="time-select">Time of Day</label>
		<select
			id="time-select"
			class="form-input"
			bind:value={timeOfDayValue}
			onchange={(e) => updateTimeOfDay(Number((e.target as HTMLSelectElement).value))}
		>
			{#each timeOptions as opt}
				<option value={opt.value}>{opt.label}</option>
			{/each}
		</select>
		{#if currentTime !== undefined && !TIME_OF_DAY_NAMES[timeOfDayValue]}
			<p class="form-hint warning">Current value ({timeOfDayValue}) is outside standard range.</p>
		{:else}
			<p class="form-hint">Current: {TIME_OF_DAY_NAMES[timeOfDayValue] || 'Unknown'}</p>
		{/if}
	</div>
</div>

<style>
	.datetime-editor {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.warning {
		color: #fca5a5;
	}
</style>
