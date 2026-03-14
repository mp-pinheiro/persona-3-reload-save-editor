<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getAchievementProgress } from '$lib/save/achievements.js';

	let report = $derived(getAchievementProgress($saveStore.properties));
</script>

<div class="achievements-section">
	<section>
		<h3>Completed</h3>
		{#if report.completed.length === 0}
			<p class="text-muted">No achievements completed yet.</p>
		{:else}
			<div class="achievements-list">
				{#each report.completed as achievement}
					<div class="achievement-item">
						<div class="achievement-header">
							<div class="achievement-status completed" title="Completed"></div>
							<span class="achievement-name">{achievement.name}</span>
						</div>
						<div class="achievement-desc">{achievement.description}</div>
						{#if achievement.max > 1}
							<div class="achievement-progress">
								{achievement.progress}/{achievement.max}
								<div class="progress-bar">
									<div class="progress-fill complete" style="width: 100%"></div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section>
		<h3>In Progress</h3>
		{#if report.inProgress.length === 0}
			<p class="text-muted">No achievements in progress.</p>
		{:else}
			<div class="achievements-list">
				{#each report.inProgress as achievement}
					<div class="achievement-item">
						<div class="achievement-header">
							<div class="achievement-status in-progress" title="In Progress"></div>
							<span class="achievement-name">{achievement.name}</span>
						</div>
						<div class="achievement-desc">{achievement.description}</div>
						<div class="achievement-progress">
							{achievement.progress}/{achievement.max}
							<div class="progress-bar">
								<div
									class="progress-fill"
									style="width: {Math.min(100, (achievement.progress / achievement.max) * 100)}%"
								></div>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<section>
		<h3>Cannot Track</h3>
		<p class="text-hint">These achievements require additional data discovery.</p>
		<div class="achievements-list">
			{#each report.cannotTrack as achievement}
				<div class="achievement-item">
					<div class="achievement-header">
						<div class="achievement-status unknown" title="Unknown"></div>
						<span class="achievement-name">{achievement.name}</span>
					</div>
					<div class="achievement-desc">{achievement.description}</div>
					{#if achievement.progress > 0 || achievement.max > 1}
						<div class="achievement-progress">
							{achievement.progress}/{achievement.max} (estimated)
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</section>
</div>

<style>
	.achievements-section {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	section h3 {
		font-size: 1rem;
		color: var(--text-primary);
		margin-bottom: 1rem;
		border-bottom: 1px solid var(--border);
		padding-bottom: 0.5rem;
	}

	.text-muted,
	.text-hint {
		color: var(--text-muted);
		font-size: 0.875rem;
	}

	.text-hint {
		font-style: italic;
		margin-bottom: 1rem;
	}

	.achievements-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
</style>
