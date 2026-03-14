<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getClearStatus, findStructProperty, findInStruct } from '$lib/save/queries.js';
	import { PropertyType } from '$lib/gvas/types.js';

	let clearStatus = $derived(getClearStatus($saveStore.properties));
	let headerStruct = $derived(findStructProperty($saveStore.properties, 'SaveDataHeadder'));
	let selectedStatus = $state(0);

	$effect(() => {
		selectedStatus = clearStatus ?? 0;
	});

	function setClearStatus(value: number) {
		if (!headerStruct) return;
		const clearStatusProp = findInStruct(headerStruct, PropertyType.EnumProperty, 'ClearStatus');
		if (clearStatusProp) {
			(clearStatusProp as any).value = value === 0 ? 'None' : value.toString();
		}
	}

	function updateStatus(value: number) {
		setClearStatus(value);
		selectedStatus = value;
	}
</script>

<div class="story-flags">
	<div class="form-group">
		<label class="form-label" for="completion-status">Game Completion Status</label>
		<select
			id="completion-status"
			class="form-input"
			bind:value={selectedStatus}
			onchange={(e) => updateStatus(Number((e.target as HTMLInputElement).value))}
		>
			<option value={0}>Not Completed</option>
			<option value={1}>Good Ending</option>
			<option value={2}>Bad Ending</option>
		</select>
		<p class="form-hint">
			{#if selectedStatus === 0}
				Nyx has not been defeated yet.
			{:else if selectedStatus === 1}
				You achieved the good ending.
			{:else}
				You achieved the bad ending.
			{/if}
		</p>
	</div>

	<div class="info-card">
		<h4>About Story Flags</h4>
		<p>
			Changing these flags can affect your game's story state. The "Good Ending" flag is required
			for New Game+ content.
		</p>
		<p class="warning">
			Warning: Incorrect story flags may cause unexpected behavior or soft-locks.
		</p>
	</div>
</div>

<style>
	.story-flags {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.info-card {
		padding: 1rem;
		background: rgba(59, 130, 246, 0.1);
		border: 1px solid rgba(59, 130, 246, 0.3);
		border-radius: 0.375rem;
	}

	.info-card h4 {
		font-size: 0.875rem;
		color: var(--accent-light);
		margin-bottom: 0.5rem;
	}

	.info-card p {
		font-size: 0.875rem;
		color: var(--text-secondary);
		line-height: 1.5;
		margin-bottom: 0.5rem;
	}

	.info-card p:last-child {
		margin-bottom: 0;
	}

	.warning {
		color: #fca5a5;
	}
</style>
