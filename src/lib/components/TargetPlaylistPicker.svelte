<script lang="ts">
  import PlaylistSourcePicker from '$lib/components/PlaylistSourcePicker.svelte';
  import { targetPlaylistId, setTargetPlaylist } from '$lib/config/config-store';
  import type { YouTubePlaylist } from '$lib/api/youtube-types';

  type Props = {
    excludeId?: string | null;
  };

  let { excludeId = null }: Props = $props();

  function handleSelect(playlist: YouTubePlaylist): void {
    setTargetPlaylist(playlist.id);
  }
</script>

<div class="target-picker">
  <div class="target-picker__header">
    <p class="target-picker__label">Target playlist</p>
    {#if $targetPlaylistId}
      <button class="target-picker__clear" onclick={() => setTargetPlaylist(null)}>Clear</button>
    {/if}
  </div>

  {#if $targetPlaylistId && excludeId && $targetPlaylistId === excludeId}
    <p class="target-picker__warning" role="alert">
      ⚠️ Target is the same as source — move/add actions will be disabled.
    </p>
  {/if}

  <PlaylistSourcePicker selectedId={$targetPlaylistId} onSelect={handleSelect} {excludeId} />
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .target-picker__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--space-3);
  }

  .target-picker__label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .target-picker__clear {
    @include button-reset;
    @include focus-visible;
    font-size: var(--text-sm);
    color: var(--color-accent);
    cursor: pointer;
  }

  .target-picker__warning {
    font-size: var(--text-xs);
    color: var(--color-action-down);
    padding: var(--space-2) var(--space-3);
    background: color-mix(in srgb, var(--color-action-down) 10%, transparent);
    border-radius: var(--radius-sm);
    margin-bottom: var(--space-3);
  }
</style>
