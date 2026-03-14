<script lang="ts">
	import SaveUploader from '$lib/components/SaveUploader.svelte';
	import EditorPanel from '$lib/components/EditorPanel.svelte';
	import { loadState, hasSave } from '$lib/ui/stores.js';
</script>

<div class="container">
	<header>
		<h1>Persona 3 Reload Save Editor</h1>
		<p class="subtitle">Edit your P3R save files directly in the browser</p>
	</header>

	{#if $loadState.error}
		<div class="alert alert-error">
			<strong>Error:</strong> {$loadState.error}
		</div>
	{/if}

	{#if $loadState.isLoading}
		<div class="loading-overlay">
			<div class="spinner"></div>
			<p class="loading-text">
				{#if $loadState.stage === 'decrypting'}
					Decrypting save file...
				{:else if $loadState.stage === 'parsing'}
					Parsing game data...
				{:else if $loadState.stage === 'processing'}
					Processing save data...
				{:else}
					Loading...
				{/if}
			</p>
		</div>
	{:else}
		{#if !$hasSave}
			<SaveUploader />
		{:else}
			<EditorPanel />
		{/if}
	{/if}

	<footer>
		<p class="subtitle">
			<a
				href="https://github.com/mp-pinheiro/persona-3-reload-save-editor"
				target="_blank"
				rel="noopener"
				>Credits & Licenses</a
			>
		</p>
	</footer>
</div>

<style>
	footer {
		text-align: center;
		padding: 2rem 0;
		margin-top: 2rem;
		border-top: 1px solid var(--border);
	}

	footer a {
		color: var(--accent-light);
		text-decoration: none;
	}

	footer a:hover {
		text-decoration: underline;
	}
</style>
