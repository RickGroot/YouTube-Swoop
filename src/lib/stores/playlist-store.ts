import { writable } from 'svelte/store';
import type { YouTubePlaylist } from '$lib/api/youtube-types';

type PlaylistStoreState = {
  playlists: YouTubePlaylist[];
  isLoading: boolean;
  error: string | null;
  loaded: boolean;
};

const initialState: PlaylistStoreState = {
  playlists: [],
  isLoading: false,
  error: null,
  loaded: false,
};

const playlistStore = writable<PlaylistStoreState>(initialState);

export const playlists = { subscribe: playlistStore.subscribe };

export function setPlaylists(items: YouTubePlaylist[]): void {
  playlistStore.set({ playlists: items, isLoading: false, error: null, loaded: true });
}

export function setPlaylistsLoading(): void {
  playlistStore.update((s) => ({ ...s, isLoading: true, error: null }));
}

export function setPlaylistsError(error: string): void {
  playlistStore.update((s) => ({ ...s, isLoading: false, error }));
}

export function resetPlaylists(): void {
  playlistStore.set(initialState);
}
