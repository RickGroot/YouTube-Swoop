export type FeedSourceType = 'ownedPlaylist' | 'subscriptions' | 'channelUploads' | 'manual';

export type FeedKey =
  | `subscriptions:${string}`
  | `playlist:${string}`
  | `channelUploads:${string}`
  | `manual:${string}`;

export type VideoItem = {
  videoId: string;
  title: string;
  channelId: string;
  channelTitle: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  duration?: string;
  viewCount?: number;
  likeCount?: number;
  source: FeedSourceType;
};

export type PlaylistSourceVideoItem = VideoItem & {
  source: 'ownedPlaylist';
  sourcePlaylistId: string;
  playlistItemId: string;
};

export type FeedLoadResult = {
  items: VideoItem[];
  totalFetched: number;
  hasMore: boolean;
  nextPageToken?: string;
};

export type FeedLoadOptions = {
  maxResults?: number;
  pageToken?: string;
  deduplicateAgainst?: Set<string>;
};
