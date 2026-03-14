<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getDifficulty, updateDifficulty } from '$lib/save/queries.js';
	import { DIFFICULTY_VALUES } from '$lib/save/data-ids.js';

	const difficultyEntries = Object.entries(DIFFICULTY_VALUES).map(([val, name]) => ({
		encodedValue: Number(val),
		name
	}));

	let selectedEncoded = $state(2166390790);

	let currentEncoded = $derived(getDifficulty($saveStore.properties));

	$effect(() => {
		if (currentEncoded !== undefined) {
			selectedEncoded = currentEncoded;
		}
	});

	function handleChange(encodedValue: number) {
		selectedEncoded = encodedValue;
		updateDifficulty($saveStore.properties, encodedValue);
	}
</script>

<div class="form-group">
	<label class="form-label" for="difficulty-select">Difficulty</label>
	<select
		id="difficulty-select"
		class="form-input"
		value={selectedEncoded}
		onchange={(e) => handleChange(Number((e.target as HTMLSelectElement).value))}
	>
		{#each difficultyEntries as { encodedValue, name }}
			<option value={encodedValue}>{name}</option>
		{/each}
	</select>
	{#if currentEncoded === undefined}
		<p class="form-hint warning">Difficulty not set in this save. Select a value to set it.</p>
	{:else}
		<p class="form-hint">Current: {DIFFICULTY_VALUES[selectedEncoded] || 'Unknown'}</p>
	{/if}
</div>

<style>
	.warning {
		color: #fca5a5;
	}
</style>
