<script lang="ts">
  import type { VideoItem } from '$lib/feed/feed-types';
  import type { ActionConfig } from '$lib/actions/action-types';

  type Props = {
    video: VideoItem;
    isActive: boolean;
    offsetX?: number;
    offsetY?: number;
    isDragging?: boolean;
    activeAction?: ActionConfig | null;
  };

  let { video, isActive, offsetX = 0, offsetY = 0, isDragging = false, activeAction = null }: Props = $props();

  const rotation = $derived(isActive ? offsetX * 0.06 : 0);
  const opacity = $derived(isActive ? 1 : 0.6);
  const scale = $derived(isActive ? 1 : 0.95);

  const SWIPE_THRESHOLD = 80;
  const dragDist = $derived(Math.max(Math.abs(offsetX), Math.abs(offsetY)));
  const labelOpacity = $derived(Math.min(1, dragDist / SWIPE_THRESHOLD));
  const showLabel = $derived(labelOpacity > 0.1 && activeAction !== null && isActive);

  const actionColor = $derived((): string => {
    if (!activeAction) return 'transparent';
    const map: Record<string, string> = {
      right: 'var(--color-action-right)',
      left: 'var(--color-action-left)',
      up: 'var(--color-action-up)',
      down: 'var(--color-action-down)',
    };
    return map[activeAction.direction] ?? 'transparent';
  });
</script>

<article
  class="video-card"
  class:is-active={isActive}
  class:is-dragging={isDragging}
  style:transform="translate({offsetX}px, {offsetY}px) rotate({rotation}deg) scale({scale})"
  style:opacity={opacity}
  aria-label={video.title}
>
  <div class="video-card__thumb-wrapper">
    <img
      class="video-card__thumb"
      src={video.thumbnailUrl}
      alt=""
      loading={isActive ? 'eager' : 'lazy'}
      draggable="false"
    />

    {#if video.duration}
      <span class="video-card__duration">{video.duration}</span>
    {/if}

    <!-- Swipe direction overlay -->
    {#if showLabel && activeAction}
      <div
        class="video-card__swipe-overlay"
        style:background="linear-gradient(135deg, {actionColor()} 0%, color-mix(in srgb, {actionColor()} 80%, transparent) 100%)"
        style:opacity={labelOpacity * 0.85}
        aria-hidden="true"
      ></div>
      <div class="video-card__swipe-label" style:opacity={labelOpacity} aria-hidden="true">
        <span class="video-card__swipe-label-text" style:color={actionColor()}>
          {activeAction.label}
        </span>
      </div>
    {/if}
  </div>

  <div class="video-card__body">
    <p class="video-card__title">{video.title}</p>
    <div class="video-card__meta-row">
      <span class="video-card__channel">{video.channelTitle}</span>
      {#if video.viewCount !== undefined}
        <span class="video-card__dot" aria-hidden="true">·</span>
        <span class="video-card__views">{video.viewCount.toLocaleString()} views</span>
      {/if}
    </div>
    <span class="video-card__date">{new Date(video.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
  </div>
</article>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .video-card {
    @include glass-raised;
    position: absolute;
    inset: 0;
    will-change: transform;
    user-select: none;
    touch-action: none;
    cursor: grab;
    border-radius: var(--radius-card);
    transition:
      box-shadow var(--transition-fast),
      opacity var(--transition-fast);

    &.is-dragging {
      box-shadow: var(--shadow-card-drag);
      cursor: grabbing;
      transition: box-shadow var(--transition-fast);
    }

    &:not(.is-active) {
      pointer-events: none;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }

  .video-card__thumb-wrapper {
    position: relative;
    aspect-ratio: 16 / 9;
    overflow: hidden;
    background: var(--color-bg);
    border-radius: var(--radius-card) var(--radius-card) 0 0;
  }

  .video-card__thumb {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-card__duration {
    position: absolute;
    bottom: var(--space-2);
    right: var(--space-2);
    background: rgba(0, 0, 0, 0.72);
    color: #ffffff;
    font-size: var(--text-xs);
    font-weight: 600;
    padding: 2px 7px;
    border-radius: var(--radius-pill);
    letter-spacing: 0.01em;
  }

  .video-card__swipe-overlay {
    position: absolute;
    inset: 0;
    border-radius: inherit;
  }

  .video-card__swipe-label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .video-card__swipe-label-text {
    font-size: 2.4rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.3));
    // Draw text with a white stroke so it reads on any bg
    paint-order: stroke fill;
    -webkit-text-stroke: 3px rgba(255, 255, 255, 0.5);
  }

  .video-card__body {
    padding: var(--space-4) var(--space-4) var(--space-5);
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
  }

  .video-card__title {
    font-size: var(--text-base);
    font-weight: 600;
    color: var(--color-text);
    line-height: 1.4;
    letter-spacing: -0.01em;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .video-card__meta-row {
    display: flex;
    align-items: center;
    gap: var(--space-1);
    margin-top: 2px;
  }

  .video-card__channel {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 60%;
  }

  .video-card__dot {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }

  .video-card__views {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    white-space: nowrap;
  }

  .video-card__date {
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
  }
</style>
