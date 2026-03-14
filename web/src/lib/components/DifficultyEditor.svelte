<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getDifficulty, updateDifficulty } from '$lib/save/queries.js';
	import { DIFFICULTY_NAMES } from '$lib/save/data-ids.js';

	const difficultyEntries = Object.entries(DIFFICULTY_NAMES).map(([idx, name]) => ({
		index: Number(idx),
		name
	}));

	let selectedIndex = $state(2);

	let currentIndex = $derived(getDifficulty($saveStore.properties));

	$effect(() => {
		selectedIndex = currentIndex;
	});

	function handleChange(index: number) {
		selectedIndex = index;
		updateDifficulty($saveStore.properties, index);
	}
</script>

<div class="form-group">
	<label class="form-label" for="difficulty-select">Difficulty</label>
	<select
		id="difficulty-select"
		class="form-input"
		value={selectedIndex}
		onchange={(e) => handleChange(Number((e.target as HTMLSelectElement).value))}
	>
		{#each difficultyEntries as { index, name }}
			<option value={index}>{name}</option>
		{/each}
	</select>
</div>
