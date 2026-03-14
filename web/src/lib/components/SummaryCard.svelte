<script lang="ts">
	import { saveStore } from '$lib/ui/stores.js';
	import { getSaveSummary } from '$lib/save/queries.js';
	import { SOCIAL_STAT_TIERS, SOCIAL_STAT_THRESHOLD, formatCalendarDate } from '$lib/save/data-ids.js';

	$: summary = $saveStore.summary ? getSaveSummary($saveStore.properties) : null;

	function formatPlaytime(frames: number): string {
		const totalSeconds = Math.floor(frames / 30);
		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds % 3600) / 60);
		return `${hours}h ${minutes}m`;
	}

	function getTierName(stat: string, value: number): string {
		const tiers = SOCIAL_STAT_TIERS[stat];
		if (!tiers) return '';
		let name = tiers[0].name;
		for (const tier of tiers) {
			if (value >= tier.min) name = tier.name;
		}
		return name;
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
					{summary.playtimeFrames ? formatPlaytime(summary.playtimeFrames) : 'Unknown'}
				</div>
			</div>
			<div class="summary-item">
				<div class="summary-label">Day</div>
				<div class="summary-value">{summary.day ? `${summary.day} - ${formatCalendarDate(summary.day) || '??/??'}` : 'Unknown'}</div>
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
			{#each [
				{ label: 'Academics', value: summary.socialStats.academics, threshold: SOCIAL_STAT_THRESHOLD.Academics },
				{ label: 'Charm', value: summary.socialStats.charm, threshold: SOCIAL_STAT_THRESHOLD.Charm },
				{ label: 'Courage', value: summary.socialStats.courage, threshold: SOCIAL_STAT_THRESHOLD.Courage }
			] as stat}
				<div class="summary-item">
					<div class="summary-label">{stat.label}</div>
					<div class="summary-value">{stat.value} <span class="tier-name">- {getTierName(stat.label, stat.value)}</span></div>
					<div class="stat-bar-container">
						<div class="progress-bar">
							<div
								class="progress-fill"
								class:complete={stat.value >= stat.threshold}
								style="width: {Math.min(100, (stat.value / stat.threshold) * 100)}%"
							></div>
						</div>
						<div class="tier-markers">
							{#each SOCIAL_STAT_TIERS[stat.label].slice(1) as tier}
								<div
									class="tier-marker"
									style="left: {(tier.min / stat.threshold) * 100}%"
									title="{tier.name} ({tier.min})"
								></div>
							{/each}
						</div>
					</div>
				</div>
			{/each}
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

	.tier-name {
		font-size: 0.875rem;
		font-weight: 400;
		color: var(--text-secondary);
	}

	.stat-bar-container {
		position: relative;
		margin-top: 0.5rem;
	}

	.stat-bar-container .progress-bar {
		margin-top: 0;
	}

	.tier-markers {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		pointer-events: none;
	}

	.tier-marker {
		position: absolute;
		top: -1px;
		width: 3px;
		height: calc(100% + 2px);
		background: var(--bg-tertiary);
		pointer-events: auto;
	}
</style>
