<script lang="ts">
  import { reviewHistory, clearHistory } from '$lib/review/review-store';
  import { addToast } from '$lib/stores/toast-store';

  type Props = { onClose: () => void };
  let { onClose }: Props = $props();

  function handleClear(): void {
    clearHistory();
    addToast('History cleared', 'info');
  }

  function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  const ACTION_COLORS: Record<string, string> = {
    keep: 'var(--color-action-right)',
    'add-to-playlist': 'var(--color-action-up)',
    'move-to-playlist': 'var(--color-action-up)',
    'remove-from-playlist': 'var(--color-action-left)',
    skip: 'var(--color-text-tertiary)',
    like: 'var(--color-action-down)',
    'open-video': 'var(--color-action-up)',
    'open-channel': 'var(--color-action-up)',
    'tag-local': 'var(--color-action-down)',
  };
</script>

<div class="review-history">
  <div class="review-history__inner">
    <div class="review-history__header">
      <h2 class="review-history__heading">History</h2>
      {#if $reviewHistory.length > 0}
        <button class="review-history__clear" onclick={handleClear}>Clear all</button>
      {/if}
    </div>

    {#if $reviewHistory.length === 0}
      <div class="review-history__empty">
        <p>No history yet.</p>
        <p>Start swiping to build it up.</p>
      </div>
    {:else}
      <ul class="review-history__list">
        {#each $reviewHistory as entry (entry.id)}
          <li class="review-history__item">
            <img class="review-history__thumb" src={entry.thumbnailUrl} alt="" loading="lazy" />
            <div class="review-history__info">
              <p class="review-history__title">{entry.title}</p>
              <p class="review-history__channel">{entry.channelTitle}</p>
            </div>
            <div class="review-history__right">
              <span class="review-history__badge" style:color={ACTION_COLORS[entry.actionType] ?? 'var(--color-text-tertiary)'}>
                {entry.actionLabel}
              </span>
              <span class="review-history__time">{formatTime(entry.timestamp)}</span>
            </div>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .review-history {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6) var(--space-4);
  }

  .review-history__inner {
    max-width: var(--max-content-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .review-history__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .review-history__heading {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .review-history__clear {
    @include button-reset;
    @include focus-visible;
    font-size: var(--text-sm);
    color: var(--color-accent);
    cursor: pointer;
  }

  .review-history__empty {
    @include glass-raised;
    border-radius: var(--radius-lg);
    padding: var(--space-8) var(--space-6);
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .review-history__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .review-history__item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);

    &:hover {
      background: rgba(0, 0, 0, 0.03);

      :global([data-theme='dark']) & {
        background: rgba(255, 255, 255, 0.04);
      }
    }
  }

  .review-history__thumb {
    width: 64px;
    height: 36px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .review-history__info {
    flex: 1;
    min-width: 0;
  }

  .review-history__title {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .review-history__channel {
    font-size: var(--text-xs);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-top: 2px;
  }

  .review-history__right {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    flex-shrink: 0;
    gap: 3px;
  }

  .review-history__badge {
    font-size: var(--text-xs);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .review-history__time {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }
</style>
