<script lang="ts">
  import { onMount } from 'svelte';
  import { playlists, setPlaylists, setPlaylistsLoading, setPlaylistsError } from '$lib/stores/playlist-store';
  import { fetchAllMyPlaylists } from '$lib/api/youtube-api';
  import { addToast } from '$lib/stores/toast-store';
  import type { YouTubePlaylist } from '$lib/api/youtube-types';

  type Props = {
    selectedId: string | null;
    onSelect: (playlist: YouTubePlaylist) => void;
    excludeId?: string | null;
  };

  let { selectedId, onSelect, excludeId = null }: Props = $props();

  const filteredPlaylists = $derived(
    $playlists.playlists.filter((p) => p.id !== excludeId),
  );

  onMount(async () => {
    if ($playlists.loaded) return;
    setPlaylistsLoading();
    try {
      const items = await fetchAllMyPlaylists();
      setPlaylists(items);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load playlists';
      setPlaylistsError(msg);
      addToast(msg, 'error');
    }
  });
</script>

<div class="playlist-picker">
  {#if $playlists.isLoading}
    <p class="playlist-picker__status">Loading playlists…</p>
  {:else if $playlists.error}
    <p class="playlist-picker__status playlist-picker__status--error">{$playlists.error}</p>
  {:else if filteredPlaylists.length === 0}
    <p class="playlist-picker__status">No playlists found.</p>
  {:else}
    <ul class="playlist-picker__list" role="listbox" aria-label="Select a playlist">
      {#each filteredPlaylists as playlist (playlist.id)}
        <li role="option" aria-selected={playlist.id === selectedId}>
          <button
            class="playlist-picker__item"
            class:is-selected={playlist.id === selectedId}
            onclick={() => onSelect(playlist)}
          >
            {#if playlist.snippet.thumbnails.default?.url}
              <img class="playlist-picker__thumb" src={playlist.snippet.thumbnails.default.url} alt="" loading="lazy" />
            {:else}
              <div class="playlist-picker__thumb-placeholder" aria-hidden="true">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="14" rx="2"/><polyline points="8 21 12 17 16 21"/></svg>
              </div>
            {/if}
            <div class="playlist-picker__info">
              <span class="playlist-picker__name">{playlist.snippet.title}</span>
              {#if playlist.contentDetails?.itemCount !== undefined}
                <span class="playlist-picker__count">{playlist.contentDetails.itemCount} videos</span>
              {/if}
            </div>
            {#if playlist.id === selectedId}
              <svg class="playlist-picker__check" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            {/if}
          </button>
        </li>
      {/each}
    </ul>
  {/if}
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .playlist-picker__status {
    padding: var(--space-3) 0;
    text-align: center;
    color: var(--color-text-secondary);
    font-size: var(--text-sm);

    &--error {
      color: var(--color-action-left);
    }
  }

  .playlist-picker__list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }

  .playlist-picker__item {
    @include button-reset;
    @include focus-visible;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    width: 100%;
    padding: var(--space-2) var(--space-2);
    border-radius: var(--radius-md);
    transition: background var(--transition-fast);

    &:hover {
      background: rgba(0, 0, 0, 0.04);

      :global([data-theme='dark']) & {
        background: rgba(255, 255, 255, 0.06);
      }
    }

    &.is-selected {
      background: rgba(0, 0, 0, 0.04);

      :global([data-theme='dark']) & {
        background: rgba(255, 255, 255, 0.06);
      }
    }
  }

  .playlist-picker__thumb {
    width: 52px;
    height: 38px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    flex-shrink: 0;
  }

  .playlist-picker__thumb-placeholder {
    width: 52px;
    height: 38px;
    background: rgba(0, 0, 0, 0.06);
    border-radius: var(--radius-sm);
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-tertiary);
  }

  .playlist-picker__info {
    flex: 1;
    min-width: 0;
    text-align: left;
  }

  .playlist-picker__name {
    display: block;
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .playlist-picker__count {
    display: block;
    font-size: var(--text-xs);
    color: var(--color-text-tertiary);
    margin-top: 2px;
  }

  .playlist-picker__check {
    color: var(--color-action-right);
    flex-shrink: 0;
  }
</style>
