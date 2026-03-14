<script lang="ts">
	import {
		processSaveFile,
		isSaveEncrypted
	} from '$lib/crypto/decrypt.js';
	import { parseGVAS } from '$lib/gvas/properties.js';
	import { saveStore, setLoading, setError } from '$lib/ui/stores.js';

	let isDragging = false;

	async function handleFileSelect(files: FileList | null) {
		if (!files || files.length === 0) return;

		const file = files[0];
		if (!file.name.endsWith('.sav')) {
			setError('Please select a .sav file');
			return;
		}

		setLoading(true, 'decrypting');

		try {
			const arrayBuffer = await file.arrayBuffer();
			const data = new Uint8Array(arrayBuffer);
			const wasEncrypted = isSaveEncrypted(data);

			setLoading(true, 'parsing');

			const decrypted = await processSaveFile(data.buffer as ArrayBuffer);
			const properties = parseGVAS(decrypted.buffer as ArrayBuffer);

			setLoading(true, 'processing');

			saveStore.loadSave(properties, {
				name: file.name.replace('.sav', ''),
				wasEncrypted,
				originalData: data
			});

			setLoading(false, 'idle');
		} catch (e) {
			setError(e instanceof Error ? e.message : 'Failed to load save file');
			setLoading(false, 'idle');
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		handleFileSelect(e.dataTransfer?.files || null);
	}

	function handleKeyPress(e: KeyboardEvent) {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
		}
	}

	function handleInputChange(e: Event) {
		handleFileSelect((e.target as HTMLInputElement).files);
	}
</script>

<label
	class="upload-zone"
	class:drag-over={isDragging}
	ondragover={handleDragOver}
	ondragleave={handleDragLeave}
	ondrop={handleDrop}
	role="button"
	tabindex="0"
	onkeydown={handleKeyPress}
>
	<div class="upload-icon">📁</div>
	<div class="upload-text">
		Drop your <code>.sav</code> file here or click to browse
	</div>
	<div class="upload-hint">
		Located in: Steam/steamapps/common/P3R/save/&lt;Steam ID&gt;/SaveDataXXX.sav
	</div>
	<input
		type="file"
		accept=".sav"
		multiple={false}
		class="hidden-input"
		onchange={handleInputChange}
	/>
</label>

<style>
	code {
		background: var(--bg-tertiary);
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: 'SF Mono', 'Consolas', 'Monaco', monospace;
		font-size: 0.875em;
	}

	.hidden-input {
		display: none;
	}
</style>
