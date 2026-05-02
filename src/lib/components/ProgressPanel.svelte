<script lang="ts">
  import { reviewState } from '$lib/review/review-store';
  import { queue } from '$lib/stores/queue-store';
  import { computeStats } from '$lib/review/review-progress';

  type Props = {
    onContinue: () => void;
    onReset: () => void;
  };

  let { onContinue, onReset }: Props = $props();

  const stats = $derived(computeStats($reviewState, $queue.items.length));
  const hasMore = $derived($queue.hasMore || $queue.currentIndex < $queue.items.length);
  const totalDone = $derived(stats.reviewed + stats.remaining || 1);
  const pct = $derived(Math.round((stats.reviewed / totalDone) * 100));

  type Stat = { label: string; value: number; accent?: string };
  const statRows = $derived<Stat[]>([
    { label: 'Reviewed',  value: stats.reviewed },
    { label: 'Remaining', value: stats.remaining },
    { label: 'Kept',      value: stats.kept,    accent: 'var(--color-action-right)' },
    { label: 'Removed',   value: stats.removed, accent: 'var(--color-action-left)' },
    { label: 'Added',     value: stats.added,   accent: 'var(--color-action-up)' },
    { label: 'Moved',     value: stats.moved },
    { label: 'Skipped',   value: stats.skipped },
    { label: 'Failed',    value: stats.failed,  accent: 'var(--color-action-left)' },
  ]);
</script>

<div class="progress-panel">
  <div class="progress-panel__inner">
    <h2 class="progress-panel__heading">Session Progress</h2>

    {#if stats.reviewed > 0}
      <div class="progress-panel__ring-wrap">
        <svg class="progress-panel__ring" viewBox="0 0 80 80" width="80" height="80" aria-hidden="true">
          <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(0,0,0,0.06)" stroke-width="7" />
          <circle cx="40" cy="40" r="34" fill="none" stroke="var(--color-accent)" stroke-width="7"
            stroke-dasharray="{2 * Math.PI * 34}"
            stroke-dashoffset="{2 * Math.PI * 34 * (1 - pct / 100)}"
            stroke-linecap="round"
            transform="rotate(-90 40 40)" />
        </svg>
        <span class="progress-panel__ring-pct">{pct}%</span>
      </div>
    {/if}

    <div class="progress-panel__grid">
      {#each statRows as stat (stat.label)}
        <div class="progress-panel__stat" style:--stat-accent={stat.accent ?? 'var(--color-text-secondary)'}>
          <span class="progress-panel__stat-value">{stat.value}</span>
          <span class="progress-panel__stat-label">{stat.label}</span>
        </div>
      {/each}
    </div>

    <div class="progress-panel__actions">
      {#if hasMore}
        <button class="progress-panel__btn progress-panel__btn--primary" onclick={onContinue}>
          Continue
        </button>
      {/if}
      <button class="progress-panel__btn progress-panel__btn--ghost" onclick={onReset}>
        Start over
      </button>
    </div>
  </div>
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .progress-panel {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6) var(--space-4);
  }

  .progress-panel__inner {
    max-width: var(--max-content-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
  }

  .progress-panel__heading {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .progress-panel__ring-wrap {
    position: relative;
    width: 80px;
    height: 80px;
    align-self: center;
  }

  .progress-panel__ring {
    transform-origin: center;
  }

  .progress-panel__ring-pct {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-sm);
    font-weight: 700;
    color: var(--color-text);
  }

  .progress-panel__grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--space-2);
  }

  .progress-panel__stat {
    @include glass-raised;
    border-radius: var(--radius-md);
    padding: var(--space-3) var(--space-2);
    text-align: center;
  }

  .progress-panel__stat-value {
    display: block;
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--stat-accent);
    letter-spacing: -0.02em;
  }

  .progress-panel__stat-label {
    display: block;
    font-size: 0.65rem;
    color: var(--color-text-tertiary);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-top: 2px;
  }

  .progress-panel__actions {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }

  .progress-panel__btn {
    @include focus-visible;
    @include touch-target;
    padding: var(--space-4);
    border-radius: var(--radius-pill);
    font-size: var(--text-base);
    font-weight: 600;
    border: none;
    cursor: pointer;
    letter-spacing: -0.01em;
    transition: background var(--transition-fast), transform var(--transition-fast);

    &--primary {
      background: var(--color-accent);
      color: var(--color-text-inverse);

      &:hover { background: var(--color-accent-hover); transform: translateY(-1px); }
      &:active { transform: translateY(0); }
    }

    &--ghost {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-text-secondary);

      :global([data-theme='dark']) & { background: rgba(255, 255, 255, 0.07); }

      &:hover { background: rgba(0, 0, 0, 0.09); }
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
      &:hover { transform: none; }
    }
  }
</style>
