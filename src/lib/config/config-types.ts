import type { ActionConfig } from '$lib/actions/action-types';
import type { FeedSourceType } from '$lib/feed/feed-types';

export type AppConfig = {
  schemaVersion: 1;
  actions: ActionConfig[];
  targetPlaylistId: string | null;
  sourceMode: FeedSourceType;
  sourceFeedId: string | null;
  maxItemsPerSession: number;
};

export type UserInfo = {
  id: string;
  name: string;
  email: string;
  picture: string;
};
