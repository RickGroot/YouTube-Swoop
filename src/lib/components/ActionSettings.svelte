<script lang="ts">
  import { actions, updateActions } from '$lib/config/config-store';
  import { addToast } from '$lib/stores/toast-store';
  import { playlists } from '$lib/stores/playlist-store';
  import type { ActionConfig, ActionType, SwipeDirection } from '$lib/actions/action-types';

  type Props = { onClose: () => void };
  let { onClose }: Props = $props();

  let localActions = $state<ActionConfig[]>([...$actions]);

  const ACTION_LABELS: Record<ActionType, string> = {
    keep: 'Keep',
    skip: 'Skip',
    'remove-from-playlist': 'Remove from playlist',
    'add-to-playlist': 'Add to playlist',
    'move-to-playlist': 'Move to playlist',
    'open-video': 'Open video',
    'open-channel': 'Open channel',
    like: 'Like',
    'tag-local': 'Tag locally',
  };

  const ACTION_TYPES = Object.keys(ACTION_LABELS) as ActionType[];
  const NEEDS_PLAYLIST: ActionType[] = ['add-to-playlist', 'move-to-playlist'];

  const DIR_LABEL: Record<SwipeDirection, string> = {
    left: '← Left', right: '→ Right', up: '↑ Up', down: '↓ Down',
  };
  const DIR_COLOR: Record<SwipeDirection, string> = {
    left: 'var(--color-action-left)',
    right: 'var(--color-action-right)',
    up: 'var(--color-action-up)',
    down: 'var(--color-action-down)',
  };

  function toggleAction(id: string, enabled: boolean) {
    localActions = localActions.map((a) => (a.id === id ? { ...a, enabled } : a));
  }

  function setActionType(id: string, type: ActionType) {
    localActions = localActions.map((a) =>
      a.id === id ? { ...a, type, label: ACTION_LABELS[type] } : a,
    );
  }

  function setActionPlaylist(id: string, playlistId: string) {
    localActions = localActions.map((a) =>
      a.id === id ? { ...a, params: { ...a.params, playlistId } } : a,
    );
  }

  function saveAndClose() {
    updateActions(localActions);
    addToast('Settings saved', 'success');
    onClose();
  }
</script>

<div class="action-settings">
  <div class="action-settings__inner">
    <h2 class="action-settings__heading">Swipe Actions</h2>
    <p class="action-settings__hint">Configure what each direction does.</p>

    <div class="action-settings__list">
      {#each localActions as action (action.id)}
        <div class="action-settings__item">
          <div class="action-settings__item-row">
            <span class="action-settings__dir" style:color={DIR_COLOR[action.direction]}>
              {DIR_LABEL[action.direction]}
            </span>
            <label class="action-settings__toggle-wrap">
              <input
                type="checkbox"
                class="action-settings__toggle-input"
                checked={action.enabled}
                onchange={(e) => toggleAction(action.id, (e.target as HTMLInputElement).checked)}
              />
              <span class="action-settings__toggle-track" aria-hidden="true"></span>
              <span class="sr-only">{action.enabled ? 'On' : 'Off'}</span>
            </label>
          </div>

          {#if action.enabled}
            <div class="action-settings__fields">
              <div class="action-settings__field">
                <label class="action-settings__field-label" for="type-{action.id}">Action</label>
                <select
                  id="type-{action.id}"
                  class="action-settings__select"
                  value={action.type}
                  onchange={(e) => setActionType(action.id, (e.target as HTMLSelectElement).value as ActionType)}
                >
                  {#each ACTION_TYPES as type (type)}
                    <option value={type}>{ACTION_LABELS[type]}</option>
                  {/each}
                </select>
              </div>

              {#if NEEDS_PLAYLIST.includes(action.type)}
                <div class="action-settings__field">
                  <label class="action-settings__field-label" for="playlist-{action.id}">Target playlist</label>
                  <select
                    id="playlist-{action.id}"
                    class="action-settings__select"
                    value={action.params?.playlistId ?? ''}
                    onchange={(e) => setActionPlaylist(action.id, (e.target as HTMLSelectElement).value)}
                  >
                    <option value="">— Select playlist —</option>
                    {#each $playlists.playlists as pl (pl.id)}
                      <option value={pl.id}>{pl.snippet.title}</option>
                    {/each}
                  </select>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {/each}
    </div>

    <div class="action-settings__footer">
      <button class="action-settings__btn action-settings__btn--primary" onclick={saveAndClose}>Save</button>
      <button class="action-settings__btn action-settings__btn--ghost" onclick={onClose}>Cancel</button>
    </div>
  </div>
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .action-settings {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-6) var(--space-4);
  }

  .action-settings__inner {
    max-width: var(--max-content-width);
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .action-settings__heading {
    font-size: var(--text-2xl);
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .action-settings__hint {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    margin-top: calc(-1 * var(--space-2));
  }

  .action-settings__list {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .action-settings__item {
    @include glass-raised;
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .action-settings__item-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4);
  }

  .action-settings__dir {
    font-weight: 700;
    font-size: var(--text-base);
    letter-spacing: -0.01em;
  }

  // iOS-style toggle
  .action-settings__toggle-wrap {
    position: relative;
    display: inline-flex;
    align-items: center;
    cursor: pointer;
  }

  .action-settings__toggle-input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .action-settings__toggle-track {
      background: var(--color-action-right);

      &::after {
        transform: translateX(20px);
      }
    }

    &:focus-visible + .action-settings__toggle-track {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
  }

  .action-settings__toggle-track {
    position: relative;
    width: 44px;
    height: 26px;
    border-radius: var(--radius-pill);
    background: rgba(0, 0, 0, 0.12);
    transition: background var(--transition-fast);

    :global([data-theme='dark']) & {
      background: rgba(255, 255, 255, 0.15);
    }

    &::after {
      content: '';
      position: absolute;
      top: 3px;
      left: 3px;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-pill);
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform var(--transition-fast);
    }
  }

  .action-settings__fields {
    border-top: 1px solid var(--color-border);
    padding: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .action-settings__field {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
  }

  .action-settings__field-label {
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-secondary);
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  .action-settings__select {
    @include focus-visible;
    width: 100%;
    padding: var(--space-3);
    background: var(--color-bg);
    border: 1px solid var(--color-border);
    border-radius: var(--radius-md);
    font-size: var(--text-sm);
    color: var(--color-text);
    cursor: pointer;
  }

  .action-settings__footer {
    display: flex;
    gap: var(--space-3);
    padding-top: var(--space-2);
  }

  .action-settings__btn {
    @include focus-visible;
    @include touch-target;
    flex: 1;
    padding: var(--space-3);
    border-radius: var(--radius-pill);
    font-size: var(--text-base);
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background var(--transition-fast);

    &--primary {
      background: var(--color-accent);
      color: var(--color-text-inverse);
      &:hover { background: var(--color-accent-hover); }
    }

    &--ghost {
      background: rgba(0, 0, 0, 0.05);
      color: var(--color-text-secondary);
      :global([data-theme='dark']) & { background: rgba(255, 255, 255, 0.07); }
      &:hover { background: rgba(0, 0, 0, 0.09); }
    }
  }

  .sr-only {
    @include sr-only;
  }
</style>
