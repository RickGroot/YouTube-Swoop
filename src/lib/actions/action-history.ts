import { writable } from 'svelte/store';
import type { VideoItem } from '$lib/feed/feed-types';
import type { ActionConfig, ActionResult, UndoPayload } from '$lib/actions/action-types';

export type HistoryEntry = {
  video: VideoItem;
  action: ActionConfig;
  result: ActionResult;
  undo: UndoPayload;
  timestamp: number;
};

const MAX_UNDO_HISTORY = 20;

const historyStore = writable<HistoryEntry[]>([]);

export const actionHistory = { subscribe: historyStore.subscribe };

export function pushHistory(
  video: VideoItem,
  action: ActionConfig,
  result: ActionResult,
  undo: UndoPayload,
): void {
  historyStore.update((h) =>
    [{ video, action, result, undo, timestamp: Date.now() }, ...h].slice(0, MAX_UNDO_HISTORY),
  );
}

export function popHistory(): HistoryEntry | null {
  let entry: HistoryEntry | null = null;
  historyStore.update((h) => {
    if (h.length === 0) return h;
    entry = h[0];
    return h.slice(1);
  });
  return entry;
}

export function clearActionHistory(): void {
  historyStore.set([]);
}
