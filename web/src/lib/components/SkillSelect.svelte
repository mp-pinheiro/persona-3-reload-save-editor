<script lang="ts">
	import { SKILL_LIST, SKILL_NAMES } from '$lib/save/combat-data.js';

	export let value: number = 0;
	export let onchange: (skillId: number) => void = () => {};

	let search = '';
	let open = false;
	let inputEl: HTMLInputElement;

	$: displayValue = value === 0 ? 'None' : (SKILL_NAMES[value] ?? `Unknown (${value})`);
	$: filtered = search.length === 0
		? SKILL_LIST
		: SKILL_LIST.filter(([, name]) => name.toLowerCase().includes(search.toLowerCase()));

	function activate() {
		open = true;
		search = '';
		requestAnimationFrame(() => inputEl?.focus());
	}

	function handleBlur() {
		setTimeout(() => { open = false; }, 150);
	}

	function select(id: number) {
		value = id;
		open = false;
		search = '';
		onchange(id);
	}
</script>

<div class="skill-select">
	{#if open}
		<input
			bind:this={inputEl}
			type="text"
			class="form-input skill-input"
			placeholder="Search skills..."
			bind:value={search}
			onblur={handleBlur}
		/>
	{:else}
		<button class="skill-display" class:empty={value === 0} onclick={activate}>
			{displayValue}
		</button>
	{/if}
	{#if open}
		<div class="dropdown">
			<button class="dropdown-item" class:selected={value === 0} onmousedown={() => select(0)}>
				<span class="skill-name">None</span>
			</button>
			{#each filtered as [id, name] (id)}
				<button class="dropdown-item" class:selected={value === id} onmousedown={() => select(id)}>
					<span class="skill-name">{name}</span>
					<span class="skill-id">#{id}</span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.skill-select {
		position: relative;
	}

	.skill-display {
		width: 100%;
		text-align: left;
		font-size: 0.8125rem;
		padding: 0.375rem 0.5rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-light);
		border-radius: 0.375rem;
		color: var(--text-primary);
		cursor: pointer;
		transition: border-color 0.15s ease;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.skill-display:hover {
		border-color: var(--accent);
	}

	.skill-display.empty {
		color: var(--text-muted);
	}

	.skill-input {
		width: 100%;
		font-size: 0.8125rem;
		padding: 0.375rem 0.5rem;
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 12rem;
		overflow-y: auto;
		background: var(--bg-tertiary);
		border: 1px solid var(--border-light);
		border-radius: 0.25rem;
		z-index: 50;
		margin-top: 2px;
	}

	.dropdown-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.375rem 0.5rem;
		border: none;
		background: none;
		color: var(--text-primary);
		font-size: 0.8125rem;
		cursor: pointer;
		text-align: left;
	}

	.dropdown-item:hover {
		background: var(--accent);
		color: white;
	}

	.dropdown-item.selected {
		background: rgba(59, 130, 246, 0.15);
	}

	.skill-id {
		color: var(--text-muted);
		font-size: 0.75rem;
	}

	.dropdown-item:hover .skill-id {
		color: rgba(255, 255, 255, 0.7);
	}
</style>
