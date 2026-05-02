import type { FeedKey } from '$lib/feed/feed-types';
import type { ActionType, UndoPayload } from '$lib/actions/action-types';

export type ReviewActionRecord = {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelTitle: string;
  actionType: ActionType;
  actionLabel: string;
  timestamp: number;
  undo?: UndoPayload;
};

export type ReviewStats = {
  reviewed: number;
  remaining: number;
  kept: number;
  removed: number;
  skipped: number;
  added: number;
  moved: number;
  failed: number;
};

export type ReviewState = {
  feedKey: FeedKey;
  schemaVersion: 1;
  seenVideoIds: string[];
  keptVideoIds: string[];
  removedVideoIds: string[];
  skippedVideoIds: string[];
  addedVideoIds: string[];
  movedVideoIds: string[];
  failedVideoIds: string[];
  lastUpdated: number;
};

export type ReviewHistoryEntry = ReviewActionRecord & {
  id: string;
};
