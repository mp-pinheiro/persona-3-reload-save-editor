<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getSaveSummary } from '$lib/save/queries.js';

	$: summary = $saveStore.summary ? getSaveSummary($saveStore.properties) : null;

	function formatPlaytime(seconds: number): string {
		const hours = Math.floor(seconds / 3600);
		const minutes = Math.floor((seconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	}
</script>

{#if summary}
	<div class="card">
		<h2>Save Summary</h2>
		<div class="grid grid-2">
			<div class="summary-item">
				<div class="summary-label">Character</div>
				<div class="summary-value">{summary.characterName || 'Unknown'}</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Playtime</div>
				<div class="summary-value">
					{summary.playtimeSeconds ? formatPlaytime(summary.playtimeSeconds) : 'Unknown'}
				</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Day</div>
				<div class="summary-value">{summary.day || 'Unknown'}</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Time of Day</div>
				<div class="summary-value">{summary.timeOfDay || 'Unknown'}</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Difficulty</div>
				<div class="summary-value">{summary.difficulty || 'Unknown'}</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Money</div>
				<div class="summary-value">¥{summary.money?.toLocaleString() || '0'}</div>
			</div>
		</div>
	</div>

	<div class="card">
		<h2>Social Stats Overview</h2>
		<div class="grid grid-3">
			<div class="summary-item">
				<div class="summary-label">Academics</div>
				<div class="summary-value">{summary.socialStats.academics}/230</div>
				<div class="progress-bar">
					<div
						class="progress-fill"
						class:complete={summary.socialStats.academics >= 230}
						style="width: {Math.min(100, (summary.socialStats.academics / 230) * 100)}%"
					></div>
				</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Charm</div>
				<div class="summary-value">{summary.socialStats.charm}/100</div>
				<div class="progress-bar">
					<div
						class="progress-fill"
						class:complete={summary.socialStats.charm >= 100}
						style="width: {Math.min(100, (summary.socialStats.charm / 100) * 100)}%"
					></div>
				</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Courage</div>
				<div class="summary-value">{summary.socialStats.courage}/80</div>
				<div class="progress-bar">
					<div
						class="progress-fill"
						class:complete={summary.socialStats.courage >= 80}
						style="width: {Math.min(100, (summary.socialStats.courage / 80) * 100)}%"
					></div>
				</div>
			</div>
		</div>
	</div>

	<div class="card">
		<h2>Social Links Overview</h2>
		<div class="social-links-summary">
			<div class="summary-item">
				<div class="summary-label">Maxed Links</div>
				<div class="summary-value">
					{summary.socialLinks.filter((sl) => sl.level === 10).length}/22
				</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Unlocked Links</div>
				<div class="summary-value">
					{summary.socialLinks.filter((sl) => sl.level > 0).length}/22
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.social-links-summary {
		display: flex;
		gap: 1rem;
	}
</style>
