import { writable, derived } from 'svelte/store';
import type { VideoItem } from '$lib/feed/feed-types';

type QueueState = {
  items: VideoItem[];
  currentIndex: number;
  isLoading: boolean;
  loadError: string | null;
  hasMore: boolean;
  nextPageToken: string | undefined;
};

const initialState: QueueState = {
  items: [],
  currentIndex: 0,
  isLoading: false,
  loadError: null,
  hasMore: false,
  nextPageToken: undefined,
};

const queueStore = writable<QueueState>(initialState);

export const queue = { subscribe: queueStore.subscribe };

export const currentVideo = derived(queueStore, ($q) => $q.items[$q.currentIndex] ?? null);

export const queueProgress = derived(queueStore, ($q) => ({
  current: $q.currentIndex,
  total: $q.items.length,
  remaining: $q.items.length - $q.currentIndex,
}));

export function setQueue(items: VideoItem[], hasMore = false, nextPageToken?: string): void {
  queueStore.set({ ...initialState, items, hasMore, nextPageToken });
}

export function advanceQueue(): void {
  queueStore.update((s) => ({ ...s, currentIndex: s.currentIndex + 1 }));
}

export function setQueueLoading(isLoading: boolean): void {
  queueStore.update((s) => ({ ...s, isLoading }));
}

export function setQueueError(loadError: string): void {
  queueStore.update((s) => ({ ...s, isLoading: false, loadError }));
}

export function appendToQueue(
  items: VideoItem[],
  hasMore: boolean,
  nextPageToken?: string,
): void {
  queueStore.update((s) => ({
    ...s,
    items: [...s.items, ...items],
    hasMore,
    nextPageToken,
    isLoading: false,
  }));
}

export function resetQueue(): void {
  queueStore.set(initialState);
}
