import { get } from 'svelte/store';
import { setQueue, setQueueLoading, setQueueError, appendToQueue } from '$lib/stores/queue-store';
import { appConfig } from '$lib/config/config-store';
import { loadPlaylistPage } from '$lib/feed/playlist-source-loader';
import { loadSubscriptionFeed } from '$lib/feed/subscriptions-source-loader';
import type { VideoItem } from '$lib/feed/feed-types';
import type { ReviewState } from '$lib/review/review-types';

export type LoadFeedOptions = {
  reviewState?: ReviewState | null;
  onSubscriptionProgress?: (loaded: number, total: number) => void;
};

export async function loadFeed(options: LoadFeedOptions = {}): Promise<void> {
  const config = get(appConfig);
  setQueueLoading(true);

  const seenIds = new Set<string>(options.reviewState?.seenVideoIds ?? []);

  try {
    if (config.sourceMode === 'ownedPlaylist' && config.sourceFeedId) {
      const result = await loadPlaylistPage(config.sourceFeedId, {
        maxResults: config.maxItemsPerSession,
        deduplicateAgainst: seenIds,
      });
      setQueue(result.items, result.hasMore, result.nextPageToken);
    } else if (config.sourceMode === 'subscriptions') {
      const result = await loadSubscriptionFeed({
        maxChannels: 50,
        maxVideosPerChannel: 5,
        deduplicateAgainst: seenIds,
        onProgress: options.onSubscriptionProgress,
      });
      setQueue(result.items.slice(0, config.maxItemsPerSession));
    } else {
      setQueueError('No feed source configured');
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load feed';
    setQueueError(message);
  }
}

export async function loadMorePlaylistItems(
  playlistId: string,
  pageToken: string,
  seenIds: Set<string>,
): Promise<void> {
  setQueueLoading(true);
  try {
    const result = await loadPlaylistPage(playlistId, {
      maxResults: 50,
      pageToken,
      deduplicateAgainst: seenIds,
    });
    appendToQueue(result.items as VideoItem[], result.hasMore, result.nextPageToken);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load more items';
    setQueueError(message);
  }
}
