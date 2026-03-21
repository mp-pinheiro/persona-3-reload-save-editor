<script lang="ts">
	export let value: number = 0;
	export let items: Record<number, string>;
	export let onchange: (id: number) => void = () => {};
	export let placeholder: string = 'Search...';

	let search = '';
	let open = false;
	let inputEl: HTMLInputElement;

	$: displayValue = items[value] ? `${items[value]} (${value})` : `Unknown (${value})`;
	$: sortedItems = Object.entries(items)
		.map(([id, name]) => [Number(id), name] as [number, string])
		.sort((a, b) => a[1].localeCompare(b[1]));
	$: filtered = search.length === 0
		? sortedItems
		: sortedItems.filter(([id, name]) =>
			name.toLowerCase().includes(search.toLowerCase()) || String(id).includes(search));

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

<div class="item-select">
	{#if open}
		<input
			bind:this={inputEl}
			type="text"
			class="form-input select-input"
			{placeholder}
			bind:value={search}
			onblur={handleBlur}
		/>
	{:else}
		<button class="select-display" onclick={activate}>
			{displayValue}
		</button>
	{/if}
	{#if open}
		<div class="dropdown">
			{#each filtered as [id, name] (id)}
				<button class="dropdown-item" class:selected={value === id} onmousedown={() => select(id)}>
					<span class="item-name">{name}</span>
					<span class="item-id">{id}</span>
				</button>
			{/each}
			{#if filtered.length === 0}
				<div class="dropdown-empty">No matches</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.item-select {
		position: relative;
		flex: 1;
		min-width: 0;
	}

	.select-display {
		width: 100%;
		text-align: left;
		font-size: 0.8125rem;
		padding: 0.375rem 0.625rem;
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

	.select-display:hover {
		border-color: var(--accent);
	}

	.select-input {
		width: 100%;
		font-size: 0.8125rem;
		padding: 0.375rem 0.625rem;
	}

	.dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		max-height: 14rem;
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
		padding: 0.375rem 0.625rem;
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

	.item-id {
		color: var(--text-muted);
		font-size: 0.75rem;
		flex-shrink: 0;
		margin-left: 0.5rem;
	}

	.dropdown-item:hover .item-id {
		color: rgba(255, 255, 255, 0.7);
	}

	.dropdown-empty {
		padding: 0.75rem;
		text-align: center;
		color: var(--text-muted);
		font-size: 0.8125rem;
	}
</style>
