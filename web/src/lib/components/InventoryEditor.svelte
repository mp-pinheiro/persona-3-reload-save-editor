<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import {
		getItemsByCategory,
		setItemQuantity,
		type InventoryItem,
		type ItemCategory
	} from '$lib/save/inventory-queries.js';

	let activeCategory: ItemCategory = 'consumables';
	let items: InventoryItem[] = [];
	let searchQuery = '';
	let showAll = false;

	const categories: { id: ItemCategory; label: string }[] = [
		{ id: 'consumables', label: 'Consumables' },
		{ id: 'materials', label: 'Materials' }
	];

	$: if ($saveStore.properties.length > 0) {
		items = getItemsByCategory($saveStore.properties, activeCategory);
	}

	function switchCategory(cat: ItemCategory) {
		activeCategory = cat;
		searchQuery = '';
		items = getItemsByCategory($saveStore.properties, activeCategory);
	}

	$: filtered = items.filter((item) => {
		const matchesSearch =
			searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = showAll || item.quantity > 0;
		return matchesSearch && matchesFilter;
	});

	$: ownedCount = items.filter((i) => i.quantity > 0).length;

	function updateQuantity(item: InventoryItem, raw: string) {
		const qty = Math.max(0, Math.min(99, Math.floor(Number(raw) || 0)));
		setItemQuantity($saveStore.properties, item.category, item.localId, qty);
		item.quantity = qty;
		items = items;
	}

	function maxAllOwned() {
		for (const item of items) {
			if (item.quantity > 0) {
				setItemQuantity($saveStore.properties, item.category, item.localId, 99);
				item.quantity = 99;
			}
		}
		items = items;
	}
</script>

<div class="inventory-editor">
	<div class="category-tabs">
		{#each categories as cat}
			<button
				class="category-tab"
				class:active={activeCategory === cat.id}
				onclick={() => switchCategory(cat.id)}
			>
				{cat.label}
			</button>
		{/each}
	</div>

	<div class="inventory-header">
		<div class="search-row">
			<input
				type="text"
				class="form-input search-input"
				placeholder="Search items..."
				bind:value={searchQuery}
			/>
			<label class="toggle-label">
				<input type="checkbox" bind:checked={showAll} />
				Show all ({items.length})
			</label>
		</div>
		<div class="actions-row">
			<span class="item-count">{ownedCount} items owned</span>
			<button class="btn btn-sm btn-secondary" onclick={maxAllOwned}>Max All Owned</button>
		</div>
	</div>

	<div class="inventory-grid">
		{#each filtered as item (item.localId)}
			<div class="inventory-item" class:empty={item.quantity === 0}>
				<span class="item-name">{item.name}</span>
				<input
					type="number"
					class="form-input qty-input"
					min="0"
					max="99"
					value={item.quantity}
					onchange={(e) =>
						updateQuantity(item, (e.target as HTMLInputElement).value)}
				/>
			</div>
		{/each}
	</div>

	{#if filtered.length === 0}
		<div class="empty-state">
			{#if searchQuery}
				No items matching "{searchQuery}"
			{:else}
				No items in inventory. Toggle "Show all" to add items.
			{/if}
		</div>
	{/if}
</div>

<style>
	.inventory-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.category-tabs {
		display: flex;
		gap: 0.25rem;
		margin-bottom: 0.75rem;
	}

	.category-tab {
		padding: 0.5rem 1rem;
		border: none;
		background: var(--bg-tertiary);
		color: var(--text-secondary);
		font-size: 0.8125rem;
		font-weight: 500;
		cursor: pointer;
		border-radius: 0.375rem;
		transition: all 0.15s ease;
	}

	.category-tab:hover {
		color: var(--text-primary);
	}

	.category-tab.active {
		background: var(--accent);
		color: white;
	}

	.inventory-header {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.search-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.search-input {
		flex: 1;
	}

	.toggle-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		font-size: 0.8125rem;
		color: var(--text-secondary);
		cursor: pointer;
		white-space: nowrap;
	}

	.actions-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.item-count {
		font-size: 0.8125rem;
		color: var(--text-muted);
	}

	.inventory-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 0.375rem;
	}

	.inventory-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0.5rem 0.75rem;
		background: var(--bg-tertiary);
		border-radius: 0.375rem;
	}

	.inventory-item.empty {
		opacity: 0.5;
	}

	.item-name {
		font-size: 0.8125rem;
		color: var(--text-secondary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
		margin-right: 0.5rem;
	}

	.qty-input {
		width: 4rem;
		text-align: center;
		padding: 0.25rem 0.375rem;
		font-size: 0.8125rem;
		flex-shrink: 0;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	@media (max-width: 640px) {
		.search-row {
			flex-direction: column;
			align-items: stretch;
		}

		.inventory-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
