<script lang="ts">
  import { get } from 'svelte/store';
  import VideoCard from '$lib/components/VideoCard.svelte';
  import { currentVideo, queue, advanceQueue } from '$lib/stores/queue-store';
  import { actions } from '$lib/config/config-store';
  import { executeAction } from '$lib/actions/action-executor';
  import { pushHistory, popHistory } from '$lib/actions/action-history';
  import { executeUndo } from '$lib/actions/undo-executor';
  import { recordAction, markFailed } from '$lib/review/review-store';
  import { addToast } from '$lib/stores/toast-store';
  import type { SwipeDirection, ActionConfig } from '$lib/actions/action-types';

  type Props = {
    onComplete: () => void;
  };

  let { onComplete }: Props = $props();

  const SWIPE_THRESHOLD = 100;
  const VELOCITY_THRESHOLD = 0.4;

  let offsetX = $state(0);
  let offsetY = $state(0);
  let isDragging = $state(false);
  let isProcessing = $state(false);
  let canUndo = $state(false);

  let startX = 0;
  let startY = 0;
  let startTime = 0;

  const video = $derived($currentVideo);
  const enabledActions = $derived($actions.filter((a) => a.enabled));
  const total = $derived($queue.items.length);
  const current = $derived($queue.currentIndex);

  const activeAction = $derived((): ActionConfig | null => {
    if (!isDragging) return null;
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);
    if (absX < 20 && absY < 20) return null;
    const dir: SwipeDirection = absX > absY
      ? (offsetX > 0 ? 'right' : 'left')
      : (offsetY > 0 ? 'down' : 'up');
    return enabledActions.find((a) => a.direction === dir) ?? null;
  });

  const cardTransition = $derived(
    isDragging ? 'none' : 'transform 320ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  );

  function handlePointerDown(event: PointerEvent): void {
    if (isProcessing || !video) return;
    isDragging = true;
    startX = event.clientX;
    startY = event.clientY;
    startTime = Date.now();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: PointerEvent): void {
    if (!isDragging) return;
    offsetX = event.clientX - startX;
    offsetY = event.clientY - startY;
  }

  async function handlePointerUp(): Promise<void> {
    if (!isDragging) return;
    isDragging = false;
    const direction = detectDirection();
    if (!direction) { snapBack(); return; }
    const action = enabledActions.find((a) => a.direction === direction);
    if (!action) { snapBack(); return; }
    await triggerAction(action);
  }

  function snapBack(): void {
    offsetX = 0;
    offsetY = 0;
  }

  function detectDirection(): SwipeDirection | null {
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);
    const elapsed = Math.max(1, Date.now() - startTime);
    const velX = absX / elapsed;
    const velY = absY / elapsed;
    const met = absX > SWIPE_THRESHOLD || absY > SWIPE_THRESHOLD
      || velX > VELOCITY_THRESHOLD || velY > VELOCITY_THRESHOLD;
    if (!met) return null;
    return absX > absY
      ? (offsetX > 0 ? 'right' : 'left')
      : (offsetY > 0 ? 'down' : 'up');
  }

  function getFlyOffset(dir: SwipeDirection, axis: 'x' | 'y'): number {
    const d = 620;
    if (axis === 'x') return dir === 'right' ? d : dir === 'left' ? -d : 0;
    return dir === 'down' ? d : dir === 'up' ? -d : 0;
  }

  async function triggerAction(action: ActionConfig): Promise<void> {
    if (!video || isProcessing) return;
    isProcessing = true;
    offsetX = getFlyOffset(action.direction, 'x');
    offsetY = getFlyOffset(action.direction, 'y');
    await new Promise((r) => setTimeout(r, 280));

    try {
      const result = await executeAction(video, action);
      recordAction(video.videoId, action.type, action.label, video.title, video.thumbnailUrl, video.channelTitle);
      pushHistory(video, action, result, result.undo);
      canUndo = true;
      if (!result.success && result.error) {
        markFailed(video.videoId);
        addToast(`Failed: ${result.error}`, 'error');
      }
    } catch (err) {
      markFailed(video.videoId);
      addToast(err instanceof Error ? err.message : 'Action failed', 'error');
    }

    advanceQueue();
    if (get(queue).currentIndex >= get(queue).items.length) onComplete();
    offsetX = 0;
    offsetY = 0;
    isProcessing = false;
  }

  async function handleUndo(): Promise<void> {
    const entry = popHistory();
    if (!entry) return;
    canUndo = false;
    try {
      await executeUndo(entry.undo);
      addToast(`Undid: ${entry.action.label}`, 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Undo failed', 'error');
    }
  }

  function handleKeyDown(event: KeyboardEvent): void {
    if (isProcessing || !video) return;
    const map: Record<string, SwipeDirection> = {
      ArrowRight: 'right', ArrowLeft: 'left', ArrowUp: 'up', ArrowDown: 'down',
    };
    const dir = map[event.key];
    if (!dir) return;
    event.preventDefault();
    const action = enabledActions.find((a) => a.direction === dir);
    if (action) triggerAction(action);
  }

  const DIRECTION_ICONS: Record<string, string> = {
    right: '→', left: '←', up: '↑', down: '↓',
  };
</script>

<svelte:window onkeydown={handleKeyDown} />

<div class="swipe-deck">
  <!-- Story-style progress bar -->
  {#if total > 0}
    <div class="swipe-deck__progress-bar" aria-label="Progress" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={total}>
      {#each Array(Math.min(total, 20)) as _, i}
        <div
          class="swipe-deck__progress-segment"
          class:is-done={i < current}
          class:is-active={i === current}
        ></div>
      {/each}
    </div>
  {/if}

  <!-- Card area -->
  <div class="swipe-deck__stage" aria-label="Video swipe deck" role="region">
    {#if video}
      {#if $queue.items[$queue.currentIndex + 1]}
        <VideoCard video={$queue.items[$queue.currentIndex + 1]} isActive={false} />
      {/if}

      <div
        class="swipe-deck__card-wrapper"
        style:transition={cardTransition}
        onpointerdown={handlePointerDown}
        onpointermove={handlePointerMove}
        onpointerup={handlePointerUp}
        onpointercancel={handlePointerUp}
        role="button"
        tabindex="0"
        aria-label="Video: {video.title}. Use arrow keys to swipe."
      >
        <VideoCard
          {video}
          isActive={true}
          {offsetX}
          {offsetY}
          {isDragging}
          activeAction={activeAction()}
        />
      </div>
    {/if}
  </div>

  <!-- Counter -->
  <p class="swipe-deck__counter" aria-live="polite" aria-atomic="true">
    {current + 1} <span class="swipe-deck__counter-sep">/</span> {total}
  </p>

  <!-- Glass action bar -->
  <div class="swipe-deck__controls">
    {#each enabledActions as action (action.id)}
      <button
        class="swipe-deck__ctrl-btn"
        style:--action-color="var(--color-action-{action.direction})"
        onclick={() => triggerAction(action)}
        disabled={isProcessing || !video}
        aria-label="{action.label} ({DIRECTION_ICONS[action.direction]})"
        title="{action.label}"
      >
        <span class="swipe-deck__ctrl-arrow">{DIRECTION_ICONS[action.direction]}</span>
        <span class="swipe-deck__ctrl-label">{action.label}</span>
      </button>
    {/each}

    <button
      class="swipe-deck__undo-btn"
      onclick={handleUndo}
      disabled={!canUndo || isProcessing}
      aria-label="Undo last action"
      title="Undo"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <polyline points="9 14 4 9 9 4" />
        <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
      </svg>
    </button>
  </div>
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .swipe-deck {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--space-3) var(--space-4) var(--space-5);
    gap: var(--space-3);
    overflow: hidden;
  }

  // Story-style thin progress segments
  .swipe-deck__progress-bar {
    display: flex;
    gap: 4px;
    width: 100%;
    max-width: var(--max-content-width);
    flex-shrink: 0;
  }

  .swipe-deck__progress-segment {
    flex: 1;
    height: 3px;
    border-radius: var(--radius-pill);
    background: rgba(0, 0, 0, 0.1);
    transition: background var(--transition-fast);

    :global([data-theme='dark']) & {
      background: rgba(255, 255, 255, 0.15);
    }

    &.is-done {
      background: var(--color-accent);
    }

    &.is-active {
      background: color-mix(in srgb, var(--color-accent) 60%, transparent);
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .swipe-deck__stage {
    position: relative;
    width: 100%;
    max-width: var(--max-content-width);
    flex: 1;
    min-height: 0;
  }

  .swipe-deck__card-wrapper {
    position: absolute;
    inset: 0;
    border-radius: var(--radius-card);

    @media (prefers-reduced-motion: reduce) {
      transition: none !important;
    }
  }

  .swipe-deck__counter {
    font-size: var(--text-xs);
    font-weight: 500;
    color: var(--color-text-secondary);
    letter-spacing: 0.04em;
  }

  .swipe-deck__counter-sep {
    color: var(--color-text-tertiary);
  }

  // Glass control bar
  .swipe-deck__controls {
    @include glass;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-radius: var(--radius-pill);
    width: 100%;
    max-width: var(--max-content-width);
    justify-content: center;
  }

  .swipe-deck__ctrl-btn {
    @include button-reset;
    @include focus-visible;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    flex: 1;
    min-height: 52px;
    padding: var(--space-2) var(--space-1);
    border-radius: var(--radius-lg);
    transition: background var(--transition-fast), transform var(--transition-fast);

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);

      :global([data-theme='dark']) & {
        background: rgba(255, 255, 255, 0.08);
      }
    }

    &:active:not(:disabled) {
      transform: scale(0.94);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;

      &:active:not(:disabled) {
        transform: none;
      }
    }
  }

  .swipe-deck__ctrl-arrow {
    font-size: 1.25rem;
    color: var(--action-color);
    line-height: 1;
    font-weight: 700;
  }

  .swipe-deck__ctrl-label {
    font-size: 0.65rem;
    font-weight: 600;
    color: var(--color-text-secondary);
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  .swipe-deck__undo-btn {
    @include button-reset;
    @include focus-visible;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: var(--radius-pill);
    color: var(--color-text-secondary);
    flex-shrink: 0;
    transition: background var(--transition-fast), color var(--transition-fast);

    &:hover:not(:disabled) {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-text);

      :global([data-theme='dark']) & {
        background: rgba(255, 255, 255, 0.08);
      }
    }

    &:disabled {
      opacity: 0.25;
      cursor: not-allowed;
    }
  }
</style>
