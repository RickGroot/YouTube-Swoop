<script lang="ts">
  import PlaylistSourcePicker from '$lib/components/PlaylistSourcePicker.svelte';
  import TargetPlaylistPicker from '$lib/components/TargetPlaylistPicker.svelte';
  import { appConfig, setSourceMode, setMaxItemsPerSession, updateActions } from '$lib/config/config-store';
  import { DEFAULT_PLAYLIST_ACTIONS, DEFAULT_FEED_ACTIONS } from '$lib/config/default-config';
  import { addToast } from '$lib/stores/toast-store';
  import type { YouTubePlaylist } from '$lib/api/youtube-types';
  import type { FeedSourceType } from '$lib/feed/feed-types';

  type Props = {
    onStart: () => void;
    isLoading: boolean;
    subscriptionLoadProgress: { loaded: number; total: number };
  };

  let { onStart, isLoading, subscriptionLoadProgress }: Props = $props();

  const config = $derived($appConfig);
  const sourceMode = $derived(config.sourceMode);
  const needsTargetPlaylist = $derived(
    config.actions?.some(
      (a) => a.enabled && (a.type === 'add-to-playlist' || a.type === 'move-to-playlist'),
    ) ?? false,
  );
  const canStart = $derived(
    !isLoading &&
      ((sourceMode === 'ownedPlaylist' && !!config.sourceFeedId) || sourceMode === 'subscriptions'),
  );

  function handleSourceModeChange(mode: FeedSourceType): void {
    setSourceMode(mode, null);
    updateActions(mode === 'ownedPlaylist' ? DEFAULT_PLAYLIST_ACTIONS : DEFAULT_FEED_ACTIONS);
  }

  function handlePlaylistSelect(playlist: YouTubePlaylist): void {
    setSourceMode('ownedPlaylist', playlist.id);
  }

  function handleStart(): void {
    if (!canStart) { addToast('Please select a source first', 'warning'); return; }
    onStart();
  }

  const progressPct = $derived(
    subscriptionLoadProgress.total > 0
      ? Math.round((subscriptionLoadProgress.loaded / subscriptionLoadProgress.total) * 100)
      : 0,
  );
</script>

<div class="feed-setup">
  <div class="feed-setup__inner">
    <div class="feed-setup__hero">
      <h1 class="feed-setup__heading">What are we triaging?</h1>
      <p class="feed-setup__sub">Review videos one by one, swipe to act.</p>
    </div>

    <!-- Source tabs -->
    <div class="feed-setup__tabs" role="tablist" aria-label="Feed source">
      <button
        role="tab"
        aria-selected={sourceMode === 'ownedPlaylist'}
        class="feed-setup__tab"
        class:is-active={sourceMode === 'ownedPlaylist'}
        onclick={() => handleSourceModeChange('ownedPlaylist')}
      >
        My Playlists
      </button>
      <button
        role="tab"
        aria-selected={sourceMode === 'subscriptions'}
        class="feed-setup__tab"
        class:is-active={sourceMode === 'subscriptions'}
        onclick={() => handleSourceModeChange('subscriptions')}
      >
        Subscriptions
      </button>
    </div>

    {#if sourceMode === 'ownedPlaylist'}
      <section class="feed-setup__section">
        <p class="feed-setup__section-label">Source playlist</p>
        <PlaylistSourcePicker
          selectedId={config.sourceFeedId}
          onSelect={handlePlaylistSelect}
          excludeId={config.targetPlaylistId}
        />
      </section>

      {#if config.sourceFeedId && needsTargetPlaylist}
        <section class="feed-setup__section">
          <TargetPlaylistPicker excludeId={config.sourceFeedId} />
        </section>
      {/if}
    {:else}
      <section class="feed-setup__section">
        <p class="feed-setup__section-label">Recent uploads from subscribed channels</p>
        <p class="feed-setup__quota-note">⚡ Uses ~2 API quota units per channel</p>
      </section>
      {#if needsTargetPlaylist}
        <section class="feed-setup__section">
          <TargetPlaylistPicker />
        </section>
      {/if}
    {/if}

    <section class="feed-setup__section feed-setup__section--range">
      <div class="feed-setup__range-header">
        <span class="feed-setup__section-label">Videos per session</span>
        <span class="feed-setup__range-value">{config.maxItemsPerSession}</span>
      </div>
      <input
        type="range"
        min="10"
        max="200"
        step="10"
        value={config.maxItemsPerSession}
        oninput={(e) => setMaxItemsPerSession(Number((e.target as HTMLInputElement).value))}
        class="feed-setup__range"
        aria-label="Videos per session"
      />
    </section>

    {#if isLoading}
      <div class="feed-setup__loading" role="status" aria-live="polite">
        {#if sourceMode === 'subscriptions' && subscriptionLoadProgress.total > 0}
          <p>Loading channels… {subscriptionLoadProgress.loaded} / {subscriptionLoadProgress.total}</p>
          <div class="feed-setup__prog-bar" role="progressbar" aria-valuenow={progressPct} aria-valuemin={0} aria-valuemax={100}>
            <div class="feed-setup__prog-fill" style="width: {progressPct}%"></div>
          </div>
        {:else}
          <p>Loading feed…</p>
        {/if}
      </div>
    {/if}

    <button class="feed-setup__start-btn" onclick={handleStart} disabled={!canStart}>
      {isLoading ? 'Loading…' : 'Start Swiping'}
    </button>
  </div>
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .feed-setup {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6) var(--space-4) var(--space-8);
  }

  .feed-setup__inner {
    max-width: var(--max-content-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .feed-setup__hero {
    padding: var(--space-2) 0 var(--space-1);
  }

  .feed-setup__heading {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--color-text);
  }

  .feed-setup__sub {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-top: var(--space-1);
  }

  .feed-setup__tabs {
    display: flex;
    gap: 4px;
    padding: 4px;
    background: rgba(0, 0, 0, 0.05);
    border-radius: var(--radius-pill);

    :global([data-theme='dark']) & {
      background: rgba(255, 255, 255, 0.07);
    }
  }

  .feed-setup__tab {
    @include button-reset;
    @include focus-visible;
    flex: 1;
    padding: 8px var(--space-4);
    border-radius: var(--radius-pill);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text-secondary);
    transition: background var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);

    &.is-active {
      background: var(--glass-bg-raised);
      color: var(--color-text);
      font-weight: 600;
      box-shadow: var(--shadow-xs);
    }
  }

  .feed-setup__section {
    @include glass-raised;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
  }

  .feed-setup__section--range {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .feed-setup__section-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: var(--space-3);
  }

  .feed-setup__quota-note {
    font-size: var(--text-xs);
    color: var(--color-action-down);
    margin-top: calc(-1 * var(--space-2));
  }

  .feed-setup__range-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .feed-setup__range-value {
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-accent);
  }

  .feed-setup__range {
    width: 100%;
    accent-color: var(--color-accent);
  }

  .feed-setup__loading {
    @include glass;
    border-radius: var(--radius-lg);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    text-align: center;
  }

  .feed-setup__prog-bar {
    height: 4px;
    background: rgba(0, 0, 0, 0.08);
    border-radius: var(--radius-pill);
    overflow: hidden;
  }

  .feed-setup__prog-fill {
    height: 100%;
    background: var(--color-accent);
    border-radius: var(--radius-pill);
    transition: width var(--transition-base);
  }

  .feed-setup__start-btn {
    @include focus-visible;
    @include touch-target;
    padding: var(--space-4);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-pill);
    font-size: var(--text-base);
    font-weight: 700;
    letter-spacing: -0.01em;
    cursor: pointer;
    width: 100%;
    transition: background var(--transition-fast), opacity var(--transition-fast), transform var(--transition-fast);

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
      transform: translateY(-1px);
    }

    &:active:not(:disabled) {
      transform: translateY(0);
    }

    &:disabled {
      opacity: 0.35;
      cursor: not-allowed;
    }

    @media (prefers-reduced-motion: reduce) {
      transition: none;

      &:hover:not(:disabled) {
        transform: none;
      }
    }
  }
</style>
