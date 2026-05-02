import type { YouTubePlaylistItem, YouTubeThumbnails } from '$lib/api/youtube-types';
import type { VideoItem, PlaylistSourceVideoItem } from '$lib/feed/feed-types';

function bestThumbnail(thumbnails: YouTubeThumbnails): string {
  return (
    thumbnails.high?.url ??
    thumbnails.medium?.url ??
    thumbnails.standard?.url ??
    thumbnails.default?.url ??
    ''
  );
}

export function normalizePlaylistItem(item: YouTubePlaylistItem): VideoItem {
  const s = item.snippet;
  return {
    videoId: s.resourceId.videoId,
    title: s.title,
    channelId: s.videoOwnerChannelId ?? s.channelId,
    channelTitle: s.videoOwnerChannelTitle ?? s.channelTitle,
    thumbnailUrl: bestThumbnail(s.thumbnails),
    publishedAt: s.publishedAt,
    description: s.description,
    source: 'ownedPlaylist',
  };
}

export function normalizeOwnedPlaylistItem(
  item: YouTubePlaylistItem,
  sourcePlaylistId: string,
): PlaylistSourceVideoItem {
  const base = normalizePlaylistItem(item);
  return {
    ...base,
    source: 'ownedPlaylist',
    sourcePlaylistId,
    playlistItemId: item.id,
  };
}
