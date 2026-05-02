export type YouTubePageInfo = {
  totalResults: number;
  resultsPerPage: number;
};

export type YouTubeThumbnail = {
  url: string;
  width?: number;
  height?: number;
};

export type YouTubeThumbnails = {
  default?: YouTubeThumbnail;
  medium?: YouTubeThumbnail;
  high?: YouTubeThumbnail;
  standard?: YouTubeThumbnail;
  maxres?: YouTubeThumbnail;
};

export type YouTubePlaylistItemSnippet = {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  playlistId: string;
  position: number;
  resourceId: {
    kind: 'youtube#video';
    videoId: string;
  };
  videoOwnerChannelTitle?: string;
  videoOwnerChannelId?: string;
};

export type YouTubePlaylistItem = {
  kind: 'youtube#playlistItem';
  etag: string;
  id: string;
  snippet: YouTubePlaylistItemSnippet;
};

export type YouTubePlaylistItemListResponse = {
  kind: 'youtube#playlistItemListResponse';
  etag: string;
  nextPageToken?: string;
  pageInfo: YouTubePageInfo;
  items: YouTubePlaylistItem[];
};

export type YouTubePlaylistSnippet = {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
};

export type YouTubePlaylist = {
  kind: 'youtube#playlist';
  etag: string;
  id: string;
  snippet: YouTubePlaylistSnippet;
  contentDetails?: { itemCount: number };
};

export type YouTubePlaylistListResponse = {
  kind: 'youtube#playlistListResponse';
  etag: string;
  nextPageToken?: string;
  pageInfo: YouTubePageInfo;
  items: YouTubePlaylist[];
};

export type YouTubeSubscriptionSnippet = {
  publishedAt: string;
  title: string;
  description: string;
  resourceId: {
    kind: 'youtube#channel';
    channelId: string;
  };
  channelId: string;
  thumbnails: YouTubeThumbnails;
};

export type YouTubeSubscription = {
  kind: 'youtube#subscription';
  etag: string;
  id: string;
  snippet: YouTubeSubscriptionSnippet;
  contentDetails?: { totalItemCount: number; newItemCount: number };
};

export type YouTubeSubscriptionListResponse = {
  kind: 'youtube#subscriptionListResponse';
  etag: string;
  nextPageToken?: string;
  pageInfo: YouTubePageInfo;
  items: YouTubeSubscription[];
};

export type YouTubeChannelSnippet = {
  title: string;
  description: string;
  customUrl?: string;
  thumbnails: YouTubeThumbnails;
  country?: string;
};

export type YouTubeChannel = {
  kind: 'youtube#channel';
  etag: string;
  id: string;
  snippet?: YouTubeChannelSnippet;
  contentDetails?: {
    relatedPlaylists: {
      uploads: string;
      watchHistory?: string;
      watchLater?: string;
    };
  };
};

export type YouTubeChannelListResponse = {
  kind: 'youtube#channelListResponse';
  etag: string;
  pageInfo: YouTubePageInfo;
  items: YouTubeChannel[];
};

export type YouTubeVideoSnippet = {
  publishedAt: string;
  channelId: string;
  title: string;
  description: string;
  thumbnails: YouTubeThumbnails;
  channelTitle: string;
  tags?: string[];
  categoryId?: string;
  liveBroadcastContent?: string;
  defaultLanguage?: string;
  defaultAudioLanguage?: string;
};

export type YouTubeVideoContentDetails = {
  duration: string;
  dimension?: string;
  definition?: string;
  caption?: string;
  projection?: string;
};

export type YouTubeVideoStatistics = {
  viewCount?: string;
  likeCount?: string;
  dislikeCount?: string;
  commentCount?: string;
};

export type YouTubeVideo = {
  kind: 'youtube#video';
  etag: string;
  id: string;
  snippet?: YouTubeVideoSnippet;
  contentDetails?: YouTubeVideoContentDetails;
  statistics?: YouTubeVideoStatistics;
};

export type YouTubeVideoListResponse = {
  kind: 'youtube#videoListResponse';
  etag: string;
  pageInfo: YouTubePageInfo;
  items: YouTubeVideo[];
};

export type YouTubeErrorResponse = {
  error: {
    code: number;
    message: string;
    status: string;
    errors?: Array<{ message: string; domain: string; reason: string }>;
  };
};

export type YouTubeApiError = {
  code: number;
  message: string;
  status: string;
};
