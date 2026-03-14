<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { findByIdUInt32, updateUInt32Property } from '$lib/save/queries.js';
	import { DATA_IDS } from '$lib/save/data-ids.js';

	let moneyValue = 0;
	const MAX_MONEY = 9999999;

	$: if ($saveStore.properties.length > 0) {
		moneyValue = findByIdUInt32($saveStore.properties, DATA_IDS.Money) || 0;
	}

	function setMaxMoney() {
		moneyValue = MAX_MONEY;
		updateMoney(moneyValue);
	}

	function updateMoney(value: number) {
		const clamped = Math.max(0, Math.min(MAX_MONEY, Math.floor(value)));
		moneyValue = clamped;
		updateUInt32Property($saveStore.properties, DATA_IDS.Money, clamped);
	}
</script>

<div class="form-group">
	<label class="form-label" for="money-input">Money (¥)</label>
	<div class="input-with-max">
		<input
			id="money-input"
			class="form-input"
			type="number"
			min="0"
			max={MAX_MONEY}
			bind:value={moneyValue}
			onchange={(e) => updateMoney(Number((e.target as HTMLInputElement).value))}
		/>
		<button class="max-btn" onclick={setMaxMoney}>Max</button>
	</div>
	<div class="form-hint">Current: ¥{moneyValue.toLocaleString()}</div>
</div>

<style>
	.form-hint {
		margin-top: 0.5rem;
		font-size: 0.75rem;
		color: var(--text-muted);
	}
</style>
