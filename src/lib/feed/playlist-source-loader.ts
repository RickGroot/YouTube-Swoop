import { fetchPlaylistItems } from '$lib/api/youtube-api';
import { normalizeOwnedPlaylistItem } from '$lib/feed/normalize-video';
import type { PlaylistSourceVideoItem } from '$lib/feed/feed-types';
import type { FeedLoadOptions, FeedLoadResult } from '$lib/feed/feed-types';

export async function loadPlaylistPage(
  playlistId: string,
  options: FeedLoadOptions = {},
): Promise<FeedLoadResult & { items: PlaylistSourceVideoItem[] }> {
  const { maxResults = 50, pageToken, deduplicateAgainst = new Set() } = options;

  const response = await fetchPlaylistItems(playlistId, pageToken, maxResults);

  const items = response.items
    .filter((item) => !deduplicateAgainst.has(item.snippet.resourceId.videoId))
    // Filter out deleted/private videos (YouTube returns them as empty titles)
    .filter((item) => item.snippet.title !== 'Deleted video' && item.snippet.title !== 'Private video')
    .map((item) => normalizeOwnedPlaylistItem(item, playlistId));

  return {
    items,
    totalFetched: response.items.length,
    hasMore: !!response.nextPageToken,
    nextPageToken: response.nextPageToken,
  };
}

export async function loadAllPlaylistItems(
  playlistId: string,
): Promise<PlaylistSourceVideoItem[]> {
  const all: PlaylistSourceVideoItem[] = [];
  let pageToken: string | undefined;
  const seen = new Set<string>();

  do {
    const page = await loadPlaylistPage(playlistId, { pageToken, deduplicateAgainst: seen });
    for (const item of page.items) seen.add(item.videoId);
    all.push(...page.items);
    pageToken = page.nextPageToken;
  } while (pageToken);

  return all;
}
