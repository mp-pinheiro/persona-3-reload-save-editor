<script lang="ts">
	import { saveStore, setLoading, setError } from '$lib/ui/stores.js';
	import { serializeGVAS } from '$lib/gvas/properties.js';
	import { encryptForExport } from '$lib/crypto/decrypt.js';

	let isExporting = false;

	async function exportSave() {
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

<button class="btn btn-success" disabled={isExporting} onclick={exportSave}>
	{#if isExporting}
		Exporting...
	{:else}
		Download Modified Save
	{/if}
</button>
