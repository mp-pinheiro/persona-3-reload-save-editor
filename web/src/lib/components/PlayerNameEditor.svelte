<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getHeaderName, updatePlayerName } from '$lib/save/queries.js';
	import { NAME_CONSTRAINTS } from '$lib/save/data-ids.js';

	let firstName = '';
	let lastName = '';
	let firstNameError = '';
	let lastNameError = '';

	$: if ($saveStore.properties.length > 0) {
		firstName = getHeaderName($saveStore.properties, 'FirstName');
		lastName = getHeaderName($saveStore.properties, 'LastName');
		firstNameError = '';
		lastNameError = '';
	}

	function validateName(name: string): string {
		if (name.length === 0) return 'Name cannot be empty';
		if (name.length > NAME_CONSTRAINTS.MaxLength) return `Max ${NAME_CONSTRAINTS.MaxLength} characters`;
		for (let i = 0; i < name.length; i++) {
			if (name.charCodeAt(i) > NAME_CONSTRAINTS.AsciiMax) return 'ASCII characters only';
		}
		return '';
	}

	function updateFirstName(value: string) {
		const error = validateName(value);
		firstNameError = error;
		if (error) return;

		firstName = value;
		updatePlayerName($saveStore.properties, 'FirstName', value);
	}

	function updateLastName(value: string) {
		const error = validateName(value);
		lastNameError = error;
		if (error) return;

		lastName = value;
		updatePlayerName($saveStore.properties, 'LastName', value);
	}
</script>

<div class="name-editor">
	<div class="form-group">
		<label class="form-label" for="first-name">First Name</label>
		<div class="input-wrapper">
			<input
				id="first-name"
				type="text"
				bind:value={firstName}
				oninput={(e) => updateFirstName((e.target as HTMLInputElement).value)}
				maxlength={NAME_CONSTRAINTS.MaxLength}
				class="text-input"
				class:error={firstNameError}
			/>
			<span class="char-count">{firstName.length}/{NAME_CONSTRAINTS.MaxLength}</span>
		</div>
		{#if firstNameError}
			<span class="error-text">{firstNameError}</span>
		{/if}
	</div>

	<div class="form-group">
		<label class="form-label" for="last-name">Last Name</label>
		<div class="input-wrapper">
			<input
				id="last-name"
				type="text"
				bind:value={lastName}
				oninput={(e) => updateLastName((e.target as HTMLInputElement).value)}
				maxlength={NAME_CONSTRAINTS.MaxLength}
				class="text-input"
				class:error={lastNameError}
			/>
			<span class="char-count">{lastName.length}/{NAME_CONSTRAINTS.MaxLength}</span>
		</div>
		{#if lastNameError}
			<span class="error-text">{lastNameError}</span>
		{/if}
	</div>
</div>

<style>
	.name-editor {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.input-wrapper {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.text-input {
		flex: 1;
		padding: 0.5rem;
		border: 1px solid var(--border);
		border-radius: 4px;
		background: var(--bg);
		color: var(--text);
		font-size: 1rem;
	}

	.text-input:focus {
		outline: none;
		border-color: var(--accent);
	}

	.text-input.error {
		border-color: var(--error, #dc3545);
	}

	.char-count {
		font-size: 0.875rem;
		color: var(--text-muted);
		min-width: 3rem;
		text-align: right;
	}

	.error-text {
		font-size: 0.875rem;
		color: var(--error, #dc3545);
	}
</style>
