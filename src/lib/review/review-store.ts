import { writable } from 'svelte/store';
import type { FeedKey } from '$lib/feed/feed-types';
import type { ReviewState, ReviewHistoryEntry } from '$lib/review/review-types';
import type { ActionType } from '$lib/actions/action-types';

const REVIEW_KEY_PREFIX = 'yt-swoop-review-';
const HISTORY_KEY = 'yt-swoop-history';
const CURRENT_SCHEMA_VERSION = 1 as const;
const MAX_HISTORY = 100;

function reviewKey(feedKey: FeedKey): string {
  return `${REVIEW_KEY_PREFIX}${feedKey}`;
}

function emptyReviewState(feedKey: FeedKey): ReviewState {
  return {
    feedKey,
    schemaVersion: CURRENT_SCHEMA_VERSION,
    seenVideoIds: [],
    keptVideoIds: [],
    removedVideoIds: [],
    skippedVideoIds: [],
    addedVideoIds: [],
    movedVideoIds: [],
    failedVideoIds: [],
    lastUpdated: Date.now(),
  };
}

function loadReviewState(feedKey: FeedKey): ReviewState {
  if (typeof window === 'undefined') return emptyReviewState(feedKey);
  try {
    const raw = localStorage.getItem(reviewKey(feedKey));
    if (!raw) return emptyReviewState(feedKey);
    const parsed = JSON.parse(raw) as ReviewState;
    if (parsed.schemaVersion !== CURRENT_SCHEMA_VERSION) return emptyReviewState(feedKey);
    return parsed;
  } catch {
    return emptyReviewState(feedKey);
  }
}

function saveReviewState(state: ReviewState): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(reviewKey(state.feedKey), JSON.stringify(state));
}

function loadHistory(): ReviewHistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as ReviewHistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: ReviewHistoryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_HISTORY)));
}

// Per-feed review state
const reviewStateStore = writable<ReviewState | null>(null);
const historyStore = writable<ReviewHistoryEntry[]>(
  typeof window !== 'undefined' ? loadHistory() : [],
);

export const reviewState = { subscribe: reviewStateStore.subscribe };
export const reviewHistory = { subscribe: historyStore.subscribe };

export function initReviewState(feedKey: FeedKey): void {
  const state = loadReviewState(feedKey);
  reviewStateStore.set(state);
}

export function recordAction(
  videoId: string,
  actionType: ActionType,
  actionLabel: string,
  title: string,
  thumbnailUrl: string,
  channelTitle: string,
): void {
  reviewStateStore.update((s) => {
    if (!s) return s;

    const updated: ReviewState = {
      ...s,
      seenVideoIds: s.seenVideoIds.includes(videoId)
        ? s.seenVideoIds
        : [...s.seenVideoIds, videoId],
      lastUpdated: Date.now(),
    };

    const bucket = actionTypeToBucket(actionType);
    if (bucket && !updated[bucket].includes(videoId)) {
      updated[bucket] = [...updated[bucket], videoId];
    }

    saveReviewState(updated);
    return updated;
  });

  historyStore.update((entries) => {
    const entry: ReviewHistoryEntry = {
      id: `${videoId}-${Date.now()}`,
      videoId,
      title,
      thumbnailUrl,
      channelTitle,
      actionType,
      actionLabel,
      timestamp: Date.now(),
    };
    const updated = [entry, ...entries].slice(0, MAX_HISTORY);
    saveHistory(updated);
    return updated;
  });
}

export function markFailed(videoId: string): void {
  reviewStateStore.update((s) => {
    if (!s) return s;
    if (s.failedVideoIds.includes(videoId)) return s;
    const updated = {
      ...s,
      failedVideoIds: [...s.failedVideoIds, videoId],
      lastUpdated: Date.now(),
    };
    saveReviewState(updated);
    return updated;
  });
}

export function resetReviewState(feedKey: FeedKey): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(reviewKey(feedKey));
  }
  reviewStateStore.set(emptyReviewState(feedKey));
}

export function clearHistory(): void {
  historyStore.set([]);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(HISTORY_KEY);
  }
}

function actionTypeToBucket(
  type: ActionType,
): keyof Pick<
  ReviewState,
  'keptVideoIds' | 'removedVideoIds' | 'skippedVideoIds' | 'addedVideoIds' | 'movedVideoIds'
> | null {
  switch (type) {
    case 'keep':
      return 'keptVideoIds';
    case 'remove-from-playlist':
      return 'removedVideoIds';
    case 'skip':
      return 'skippedVideoIds';
    case 'add-to-playlist':
      return 'addedVideoIds';
    case 'move-to-playlist':
      return 'movedVideoIds';
    default:
      return null;
  }
}
