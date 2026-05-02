import { writable, derived } from 'svelte/store';
import type { AppConfig } from '$lib/config/config-types';
import type { ActionConfig } from '$lib/actions/action-types';
import { loadConfig, saveConfig } from '$lib/config/migrations';

const configStore = writable<AppConfig>(
  typeof window !== 'undefined' ? loadConfig() : ({} as AppConfig),
);

configStore.subscribe((config) => {
  if (typeof window !== 'undefined' && config.schemaVersion) {
    saveConfig(config);
  }
});

export const appConfig = { subscribe: configStore.subscribe };

export const actions = derived(configStore, ($c) => $c.actions ?? []);

export const targetPlaylistId = derived(configStore, ($c) => $c.targetPlaylistId);

export const sourceMode = derived(configStore, ($c) => $c.sourceMode);

export function updateActions(newActions: ActionConfig[]): void {
  configStore.update((c) => ({ ...c, actions: newActions }));
}

export function setTargetPlaylist(playlistId: string | null): void {
  configStore.update((c) => ({ ...c, targetPlaylistId: playlistId }));
}

export function setSourceMode(mode: AppConfig['sourceMode'], feedId: string | null = null): void {
  configStore.update((c) => ({ ...c, sourceMode: mode, sourceFeedId: feedId }));
}

export function setMaxItemsPerSession(max: number): void {
  configStore.update((c) => ({ ...c, maxItemsPerSession: max }));
}

export function resetConfig(): void {
  const fresh = loadConfig();
  configStore.set(fresh);
}
