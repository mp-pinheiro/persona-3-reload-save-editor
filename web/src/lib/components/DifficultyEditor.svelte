<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getDifficulty, updateDifficulty } from '$lib/save/queries.js';
	import { DIFFICULTY_NAMES } from '$lib/save/data-ids.js';

	let selectedDifficulty = $state(4);

	let currentDifficulty = $derived(getDifficulty($saveStore.properties));

	$effect(() => {
		if (currentDifficulty !== undefined) {
			selectedDifficulty = currentDifficulty;
		}
	});

	function handleChange(value: number) {
		selectedDifficulty = value;
		updateDifficulty($saveStore.properties, value);
	}
</script>

<div class="form-group">
	<label class="form-label" for="difficulty-select">Difficulty</label>
	<select
		id="difficulty-select"
		class="form-input"
		bind:value={selectedDifficulty}
		onchange={(e) => handleChange(Number((e.target as HTMLSelectElement).value))}
	>
		{#each DIFFICULTY_NAMES as name, i}
			<option value={i}>{name}</option>
		{/each}
	</select>
	{#if currentDifficulty === undefined}
		<p class="form-hint warning">Difficulty not found in this save file.</p>
	{:else}
		<p class="form-hint">Current: {DIFFICULTY_NAMES[selectedDifficulty] || 'Unknown'}</p>
	{/if}
</div>

<style>
	.warning {
		color: #fca5a5;
	}
</style>
