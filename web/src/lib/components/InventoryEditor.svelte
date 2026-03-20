<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import {
		getAllConsumables,
		setItemQuantity,
		type InventoryItem
	} from '$lib/save/inventory-queries.js';

	let items: InventoryItem[] = [];
	let searchQuery = '';
	let showAll = false;

	$: if ($saveStore.properties.length > 0) {
		items = getAllConsumables($saveStore.properties);
	}

	$: filtered = items.filter((item) => {
		const matchesSearch =
			searchQuery === '' || item.name.toLowerCase().includes(searchQuery.toLowerCase());
		const matchesFilter = showAll || item.quantity > 0;
		return matchesSearch && matchesFilter;
	});

	$: ownedCount = items.filter((i) => i.quantity > 0).length;

	function updateQuantity(localId: number, raw: string) {
		const qty = Math.max(0, Math.min(99, Math.floor(Number(raw) || 0)));
		setItemQuantity($saveStore.properties, localId, qty);
		const item = items.find((i) => i.localId === localId);
		if (item) item.quantity = qty;
		items = items;
	}

	function maxAllOwned() {
		for (const item of items) {
			if (item.quantity > 0) {
				setItemQuantity($saveStore.properties, item.localId, 99);
				item.quantity = 99;
			}
		}
		items = items;
	}
</script>

<div class="inventory-editor">
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
						updateQuantity(item.localId, (e.target as HTMLInputElement).value)}
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
