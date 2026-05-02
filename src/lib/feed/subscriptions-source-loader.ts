import { fetchMySubscriptions, fetchChannelUploadsPlaylistId, fetchPlaylistItems } from '$lib/api/youtube-api';
import { normalizePlaylistItem } from '$lib/feed/normalize-video';
import type { VideoItem } from '$lib/feed/feed-types';
import type { YouTubeSubscription } from '$lib/api/youtube-types';

export type SubscriptionFeedOptions = {
  maxChannels?: number;
  maxVideosPerChannel?: number;
  deduplicateAgainst?: Set<string>;
  onProgress?: (loaded: number, total: number) => void;
};

export type SubscriptionFeedResult = {
  items: VideoItem[];
  totalChannelsProcessed: number;
  quotaEstimate: number;
};

async function fetchAllSubscriptions(maxChannels = 200): Promise<YouTubeSubscription[]> {
  const subs: YouTubeSubscription[] = [];
  let pageToken: string | undefined;

  do {
    const page = await fetchMySubscriptions(pageToken, 50);
    subs.push(...page.items);
    pageToken = page.nextPageToken;
    if (subs.length >= maxChannels) break;
  } while (pageToken);

  return subs.slice(0, maxChannels);
}

export async function loadSubscriptionFeed(
  options: SubscriptionFeedOptions = {},
): Promise<SubscriptionFeedResult> {
  const {
    maxChannels = 50,
    maxVideosPerChannel = 5,
    deduplicateAgainst = new Set<string>(),
    onProgress,
  } = options;

  const subscriptions = await fetchAllSubscriptions(maxChannels);
  const seen = new Set<string>(deduplicateAgainst);
  const allVideos: VideoItem[] = [];
  let quotaEstimate = 1; // subscriptions.list cost

  for (let i = 0; i < subscriptions.length; i++) {
    const sub = subscriptions[i];
    const channelId = sub.snippet.resourceId.channelId;

    onProgress?.(i, subscriptions.length);

    try {
      const uploadsPlaylistId = await fetchChannelUploadsPlaylistId(channelId);
      quotaEstimate += 1; // channels.list

      const uploadsPage = await fetchPlaylistItems(uploadsPlaylistId, undefined, maxVideosPerChannel);
      quotaEstimate += 1; // playlistItems.list

      const videos = uploadsPage.items
        .filter((item) => !seen.has(item.snippet.resourceId.videoId))
        .filter((item) => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video')
        .map((item) => {
          const v = normalizePlaylistItem(item);
          return { ...v, source: 'subscriptions' as const };
        });

      for (const v of videos) seen.add(v.videoId);
      allVideos.push(...videos);
    } catch {
      // Skip channels that fail (private, terminated, etc.)
    }
  }

  onProgress?.(subscriptions.length, subscriptions.length);

  // Sort by publishedAt descending
  allVideos.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  return {
    items: allVideos,
    totalChannelsProcessed: subscriptions.length,
    quotaEstimate,
  };
}
