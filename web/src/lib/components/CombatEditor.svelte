<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import {
		CHARACTERS,
		PERSONA_LIST,
		PERSONA_NAMES,
		type CharacterDef,
		type PersonaSlotData
	} from '$lib/save/combat-data.js';
	import {
		getCharacterData,
		updateCharacterField,
		getPersonaSlot,
		updatePersonaId,
		updatePersonaLevel,
		updatePersonaExp,
		updatePersonaSkills,
		updatePersonaStats,
		clonePersonaSlot,
		type CharacterData
	} from '$lib/save/combat-queries.js';
	import SkillSelect from './SkillSelect.svelte';

	interface CharacterState {
		char: CharacterDef;
		data: CharacterData;
		personas: PersonaSlotData[];
	}

	let states: CharacterState[] = [];
	let expanded: Record<string, boolean> = {};

	$: if ($saveStore.properties.length > 0) {
		states = CHARACTERS.map((char) => ({
			char,
			data: getCharacterData($saveStore.properties, char),
			personas: Array.from({ length: char.personaSlots }, (_, i) =>
				getPersonaSlot($saveStore.properties, char, i)
			)
		}));
	}

	function toggle(key: string) {
		expanded[key] = !expanded[key];
	}

	function clampInt(val: number, min: number, max: number): number {
		return Math.max(min, Math.min(max, Math.floor(val)));
	}

	function handleCharField(stateIdx: number, field: keyof CharacterData, raw: string) {
		const max = field === 'exp' ? 4294967295 : field === 'hp' || field === 'sp' ? 9999 : 99;
		const val = clampInt(Number(raw) || 0, 0, max);
		states[stateIdx].data[field] = val;
		updateCharacterField($saveStore.properties, states[stateIdx].char, field, val);
	}

	function handlePersonaChange(stateIdx: number, slotIdx: number, raw: string) {
		const id = Number(raw) || 0;
		states[stateIdx].personas[slotIdx].personaId = id;
		updatePersonaId($saveStore.properties, states[stateIdx].char, slotIdx, id);
	}

	function handlePersonaLevel(stateIdx: number, slotIdx: number, raw: string) {
		const val = clampInt(Number(raw) || 0, 0, 99);
		states[stateIdx].personas[slotIdx].level = val;
		updatePersonaLevel($saveStore.properties, states[stateIdx].char, slotIdx, val);
	}

	function handlePersonaExp(stateIdx: number, slotIdx: number, raw: string) {
		const val = clampInt(Number(raw) || 0, 0, 4294967295);
		states[stateIdx].personas[slotIdx].exp = val;
		updatePersonaExp($saveStore.properties, states[stateIdx].char, slotIdx, val);
	}

	function handleSkillChange(stateIdx: number, slotIdx: number, skillIdx: number, skillId: number) {
		states[stateIdx].personas[slotIdx].skills[skillIdx] = skillId;
		updatePersonaSkills(
			$saveStore.properties,
			states[stateIdx].char,
			slotIdx,
			states[stateIdx].personas[slotIdx].skills
		);
	}

	function handleStatChange(
		stateIdx: number,
		slotIdx: number,
		stat: 'st' | 'ma' | 'en' | 'ag' | 'lu',
		raw: string
	) {
		const val = clampInt(Number(raw) || 0, 0, 99);
		const persona = states[stateIdx].personas[slotIdx];
		if (stat === 'lu') {
			persona.lu = val;
		} else {
			persona.stats[stat] = val;
		}
		updatePersonaStats(
			$saveStore.properties,
			states[stateIdx].char,
			slotIdx,
			persona.stats,
			persona.lu
		);
	}

	function handleClonePersona(stateIdx: number, targetSlotIdx: number, sourceSlotIdx: number) {
		const state = states[stateIdx];
		const source = state.personas[sourceSlotIdx];
		if (source.personaId === 0) return;
		clonePersonaSlot($saveStore.properties, state.char, targetSlotIdx, source);
		states[stateIdx].personas[targetSlotIdx] = {
			personaId: source.personaId,
			level: source.level,
			exp: source.exp,
			skills: [...source.skills],
			stats: { ...source.stats },
			lu: source.lu
		};
	}
</script>

<div class="combat-editor">
	{#each states as state, stateIdx (state.char.key)}
		<div class="character-section">
			<button class="character-header" onclick={() => toggle(state.char.key)}>
				<span class="character-name">{state.char.name}</span>
				<span class="expand-icon">{expanded[state.char.key] ? '−' : '+'}</span>
			</button>

			{#if expanded[state.char.key]}
				<div class="character-body">
					<div class="char-stats-row">
						<div class="stat-field">
							<span class="field-label">Level</span>
							<input
								type="number"
								class="form-input field-input"
								min="0"
								max="99"
								value={state.data.level}
								onchange={(e) => handleCharField(stateIdx, 'level', (e.target as HTMLInputElement).value)}
							/>
						</div>
						<div class="stat-field">
							<span class="field-label">EXP</span>
							<input
								type="number"
								class="form-input field-input"
								min="0"
								value={state.data.exp}
								onchange={(e) => handleCharField(stateIdx, 'exp', (e.target as HTMLInputElement).value)}
							/>
						</div>
						<div class="stat-field">
							<span class="field-label">HP</span>
							<input
								type="number"
								class="form-input field-input"
								min="0"
								max="9999"
								value={state.data.hp}
								onchange={(e) => handleCharField(stateIdx, 'hp', (e.target as HTMLInputElement).value)}
							/>
						</div>
						<div class="stat-field">
							<span class="field-label">SP</span>
							<input
								type="number"
								class="form-input field-input"
								min="0"
								max="9999"
								value={state.data.sp}
								onchange={(e) => handleCharField(stateIdx, 'sp', (e.target as HTMLInputElement).value)}
							/>
						</div>
					</div>

					{#each state.personas as persona, slotIdx (slotIdx)}
						<div class="persona-slot">
							{#if state.char.personaSlots > 1}
								<h4 class="slot-title">
									Persona Slot {slotIdx + 1}
									{#if state.char.key === 'protagonist' && slotIdx >= 6}
										<span class="slot-warning">Requires Lv{slotIdx < 8 ? 12 : slotIdx < 10 ? 20 : 30}+</span>
									{/if}
								</h4>
							{/if}

							<div class="persona-header-row">
								<div class="persona-select-field">
									<select
										class="persona-dropdown"
										value={persona.personaId}
										onchange={(e) => handlePersonaChange(stateIdx, slotIdx, (e.target as HTMLSelectElement).value)}
									>
										<option value={0}>Empty</option>
										{#each PERSONA_LIST as [id, name] (id)}
											<option value={id}>{name} (#{id})</option>
										{/each}
									</select>
								</div>

								{#if state.char.key === 'protagonist'}
									<div class="inline-field">
										<span class="field-label">Lv</span>
										<input
											type="number"
											class="form-input field-input-sm"
											min="0"
											max="99"
											value={persona.level}
											onchange={(e) => handlePersonaLevel(stateIdx, slotIdx, (e.target as HTMLInputElement).value)}
										/>
									</div>
									<div class="inline-field">
										<span class="field-label">EXP</span>
										<input
											type="number"
											class="form-input field-input"
											min="0"
											value={persona.exp}
											onchange={(e) => handlePersonaExp(stateIdx, slotIdx, (e.target as HTMLInputElement).value)}
										/>
									</div>
								{/if}
							</div>

							{#if persona.personaId > 0}
								<div class="skills-section">
									<span class="field-label">Skills</span>
									<div class="skills-grid">
										{#each persona.skills as skill, skillIdx (skillIdx)}
											<SkillSelect
												value={skill}
												onchange={(id) => handleSkillChange(stateIdx, slotIdx, skillIdx, id)}
											/>
										{/each}
									</div>
								</div>

								<div class="stats-row">
									<div class="stat-field">
										<span class="field-label">St</span>
										<input
											type="number"
											class="form-input field-input stat-input"
											min="0"
											max="99"
											value={persona.stats.st}
											onchange={(e) => handleStatChange(stateIdx, slotIdx, 'st', (e.target as HTMLInputElement).value)}
										/>
									</div>
									<div class="stat-field">
										<span class="field-label">Ma</span>
										<input
											type="number"
											class="form-input field-input stat-input"
											min="0"
											max="99"
											value={persona.stats.ma}
											onchange={(e) => handleStatChange(stateIdx, slotIdx, 'ma', (e.target as HTMLInputElement).value)}
										/>
									</div>
									<div class="stat-field">
										<span class="field-label">En</span>
										<input
											type="number"
											class="form-input field-input stat-input"
											min="0"
											max="99"
											value={persona.stats.en}
											onchange={(e) => handleStatChange(stateIdx, slotIdx, 'en', (e.target as HTMLInputElement).value)}
										/>
									</div>
									<div class="stat-field">
										<span class="field-label">Ag</span>
										<input
											type="number"
											class="form-input field-input stat-input"
											min="0"
											max="99"
											value={persona.stats.ag}
											onchange={(e) => handleStatChange(stateIdx, slotIdx, 'ag', (e.target as HTMLInputElement).value)}
										/>
									</div>
									<div class="stat-field">
										<span class="field-label">Lu</span>
										<input
											type="number"
											class="form-input field-input stat-input"
											min="0"
											max="99"
											value={persona.lu}
											onchange={(e) => handleStatChange(stateIdx, slotIdx, 'lu', (e.target as HTMLInputElement).value)}
										/>
									</div>
								</div>
							{:else if state.char.key === 'protagonist'}
								{@const filledSlots = state.personas
									.map((p, i) => ({ p, i }))
									.filter(({ p, i }) => p.personaId > 0 && i !== slotIdx)}
								{#if filledSlots.length > 0}
									<div class="clone-section">
										<span class="field-label">Clone from</span>
										<select
											class="persona-dropdown"
											value=""
											onchange={(e) => {
												const val = (e.target as HTMLSelectElement).value;
												if (val !== '') handleClonePersona(stateIdx, slotIdx, Number(val));
												(e.target as HTMLSelectElement).value = '';
											}}
										>
											<option value="" disabled selected>Select a persona to clone...</option>
											{#each filledSlots as { p, i } (i)}
												<option value={i}>
													Slot {i + 1}: {PERSONA_NAMES[p.personaId] ?? `#${p.personaId}`} (Lv{p.level})
												</option>
											{/each}
										</select>
									</div>
								{/if}
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	{/each}
</div>

<style>
	.combat-editor {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.character-section {
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: 0.5rem;
		overflow: hidden;
	}

	.character-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		width: 100%;
		padding: 0.875rem 1rem;
		background: none;
		border: none;
		color: var(--text-primary);
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.15s ease;
	}

	.character-header:hover {
		background: var(--bg-tertiary);
	}

	.expand-icon {
		color: var(--text-muted);
		font-size: 1.25rem;
		font-weight: 300;
	}

	.character-body {
		padding: 0 1rem 1rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.char-stats-row {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 0.75rem;
	}

	.char-stats-row .form-input {
		width: 100%;
	}

	.persona-slot {
		background: var(--bg-tertiary);
		border: 1px solid var(--border-light);
		border-radius: 0.5rem;
		padding: 1rem;
		display: flex;
		flex-direction: column;
		gap: 0.875rem;
	}

	.slot-title {
		margin: 0;
		font-size: 0.75rem;
		font-weight: 600;
		color: var(--text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}

	.slot-warning {
		color: #fca5a5;
		font-weight: 500;
		text-transform: none;
		letter-spacing: normal;
	}

	.persona-header-row {
		display: flex;
		gap: 0.75rem;
		align-items: center;
	}

	.persona-select-field {
		flex: 1;
		min-width: 0;
	}

	.persona-dropdown {
		width: 100%;
		padding: 0.5rem 2rem 0.5rem 0.75rem;
		background: var(--bg-secondary);
		border: 1px solid var(--border-light);
		border-radius: 0.375rem;
		color: var(--text-primary);
		font-size: 0.875rem;
		cursor: pointer;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a1a1aa' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 0.625rem center;
	}

	.persona-dropdown:focus {
		outline: none;
		border-color: var(--accent);
	}

	.inline-field {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		flex-shrink: 0;
	}

	.stat-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.field-label {
		font-size: 0.75rem;
		font-weight: 500;
		color: var(--text-secondary);
	}

	.field-input {
		width: 6.5rem;
		font-size: 0.875rem;
		padding: 0.5rem 0.625rem;
	}

	.field-input-sm {
		width: 4.5rem;
		font-size: 0.875rem;
		padding: 0.5rem 0.625rem;
	}

	.persona-slot :global(.form-input) {
		background: var(--bg-secondary);
		border-color: var(--border-light);
	}

	.stat-input {
		width: 4.5rem;
	}

	.skills-section {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding-top: 0.625rem;
		border-top: 1px solid var(--border);
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr));
		gap: 0.375rem;
	}

	.stats-row {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		padding-top: 0.625rem;
		border-top: 1px solid var(--border);
	}

	.clone-section {
		display: flex;
		flex-direction: column;
		gap: 0.375rem;
		padding-top: 0.5rem;
	}

	@media (max-width: 640px) {
		.char-stats-row {
			grid-template-columns: repeat(2, 1fr);
		}

		.persona-header-row {
			flex-wrap: wrap;
		}

		.skills-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
