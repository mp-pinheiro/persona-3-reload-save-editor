<script lang="ts">
	import { saveStore, setLoading, setError } from '$lib/ui/stores.js';
	import { serializeGVAS } from '$lib/gvas/properties.js';
	import { encryptForExport } from '$lib/crypto/decrypt.js';

	let isExporting = false;
	let showWarning = false;

	function requestExport() {
		showWarning = true;
	}

	function cancelExport() {
		showWarning = false;
	}

	async function confirmExport() {
		showWarning = false;
		if (isExporting) return;

		const { properties, file } = $saveStore;
		if (!file) {
			setError('No save file loaded');
			return;
		}

		isExporting = true;
		setLoading(true, 'processing');

		try {
			const buffer = serializeGVAS(properties);
			const data = new Uint8Array(buffer);
			const encrypted = await encryptForExport(data, file.wasEncrypted);

			const blob = new Blob([encrypted.buffer as ArrayBuffer], { type: 'application/octet-stream' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `${file.name}_edited.sav`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);

			setLoading(false, 'idle');
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to export save file');
			setLoading(false, 'idle');
		}

		isExporting = false;
	}
</script>

<button class="btn btn-success" disabled={isExporting} onclick={requestExport}>
	{#if isExporting}
		Exporting...
	{:else}
		Download Modified Save
	{/if}
</button>

{#if showWarning}
	<!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
	<div class="modal-backdrop" onclick={cancelExport}>
		<div class="modal-warning" onclick={(e) => e.stopPropagation()}>
			<div class="warning-icon">!</div>
			<h3>Warning</h3>
			<p>This tool is provided as-is. Modified saves may break your game. Always back up your original save files before using edited ones. No guarantees are made. Use at your own risk.</p>
			<div class="modal-actions">
				<button class="btn btn-secondary" onclick={cancelExport}>Cancel</button>
				<button class="btn btn-danger" onclick={confirmExport}>Download Anyway</button>
			</div>
		</div>
	</div>
{/if}

<style>
	.modal-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
	}

	.modal-warning {
		background: var(--bg-secondary);
		border: 2px solid var(--error);
		border-radius: 0.75rem;
		padding: 2rem;
		max-width: 420px;
		width: 90%;
		text-align: center;
	}

	.warning-icon {
		width: 3rem;
		height: 3rem;
		margin: 0 auto 1rem;
		background: var(--error);
		color: white;
		border-radius: 50%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 1.5rem;
		font-weight: 700;
	}

	.modal-warning h3 {
		color: var(--error);
		font-size: 1.25rem;
		margin-bottom: 1rem;
	}

	.modal-warning p {
		color: var(--text-secondary);
		font-size: 0.875rem;
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.modal-actions {
		display: flex;
		gap: 0.75rem;
		justify-content: center;
	}

	:global(.btn-danger) {
		background: var(--error);
		color: white;
	}

	:global(.btn-danger:hover:not(:disabled)) {
		background: #dc2626;
	}
</style>
