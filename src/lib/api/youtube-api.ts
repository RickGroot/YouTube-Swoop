import { get } from 'svelte/store';
import { accessToken } from '$lib/stores/auth-store';
import type {
  YouTubePlaylistItemListResponse,
  YouTubePlaylistListResponse,
  YouTubeSubscriptionListResponse,
  YouTubeChannelListResponse,
  YouTubeVideoListResponse,
} from '$lib/api/youtube-types';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

export class YouTubeApiError extends Error {
  constructor(
    public readonly code: number,
    message: string,
    public readonly status: string,
  ) {
    super(message);
    this.name = 'YouTubeApiError';
  }
}

async function apiFetch<T>(path: string, params: Record<string, string>): Promise<T> {
  const token = get(accessToken);
  if (!token) throw new YouTubeApiError(401, 'Not signed in', 'UNAUTHENTICATED');

  const url = new URL(`${BASE_URL}${path}`);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let status = 'UNKNOWN';
    let message = `HTTP ${res.status}`;
    try {
      const err = (await res.json()) as { error: YouTubeApiError };
      message = err.error.message;
      status = err.error.status;
    } catch {
      // ignore parse error
    }
    throw new YouTubeApiError(res.status, message, status);
  }

  return res.json() as Promise<T>;
}

export async function fetchPlaylistItems(
  playlistId: string,
  pageToken?: string,
  maxResults = 50,
): Promise<YouTubePlaylistItemListResponse> {
  return apiFetch<YouTubePlaylistItemListResponse>('/playlistItems', {
    part: 'snippet',
    playlistId,
    maxResults: String(maxResults),
    ...(pageToken ? { pageToken } : {}),
  });
}

export async function fetchMyPlaylists(
  pageToken?: string,
): Promise<YouTubePlaylistListResponse> {
  return apiFetch<YouTubePlaylistListResponse>('/playlists', {
    part: 'snippet,contentDetails',
    mine: 'true',
    maxResults: '50',
    ...(pageToken ? { pageToken } : {}),
  });
}

export async function fetchAllMyPlaylists(): Promise<YouTubePlaylistListResponse['items']> {
  const items: YouTubePlaylistListResponse['items'] = [];
  let pageToken: string | undefined;

  do {
    const page = await fetchMyPlaylists(pageToken);
    items.push(...page.items);
    pageToken = page.nextPageToken;
  } while (pageToken);

  return items;
}

export async function fetchMySubscriptions(
  pageToken?: string,
  maxResults = 50,
): Promise<YouTubeSubscriptionListResponse> {
  return apiFetch<YouTubeSubscriptionListResponse>('/subscriptions', {
    part: 'snippet,contentDetails',
    mine: 'true',
    maxResults: String(maxResults),
    order: 'alphabetical',
    ...(pageToken ? { pageToken } : {}),
  });
}

export async function fetchChannelUploadsPlaylistId(channelId: string): Promise<string> {
  const data = await apiFetch<YouTubeChannelListResponse>('/channels', {
    part: 'contentDetails',
    id: channelId,
  });
  const uploadsId = data.items[0]?.contentDetails?.relatedPlaylists.uploads;
  if (!uploadsId) throw new YouTubeApiError(404, 'Channel has no uploads playlist', 'NOT_FOUND');
  return uploadsId;
}

export async function fetchMyChannelInfo(): Promise<YouTubeChannelListResponse> {
  return apiFetch<YouTubeChannelListResponse>('/channels', {
    part: 'snippet,contentDetails',
    mine: 'true',
  });
}

export async function fetchVideoDetails(
  videoIds: string[],
): Promise<YouTubeVideoListResponse> {
  return apiFetch<YouTubeVideoListResponse>('/videos', {
    part: 'snippet,contentDetails,statistics',
    id: videoIds.join(','),
    maxResults: '50',
  });
}

export async function removePlaylistItem(playlistItemId: string): Promise<void> {
  const token = get(accessToken);
  if (!token) throw new YouTubeApiError(401, 'Not signed in', 'UNAUTHENTICATED');

  const url = new URL(`${BASE_URL}/playlistItems`);
  url.searchParams.set('id', playlistItemId);

  const res = await fetch(url.toString(), {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new YouTubeApiError(res.status, `Failed to remove item: ${res.status}`, 'API_ERROR');
  }
}

export async function addPlaylistItem(
  videoId: string,
  playlistId: string,
): Promise<{ id: string }> {
  const token = get(accessToken);
  if (!token) throw new YouTubeApiError(401, 'Not signed in', 'UNAUTHENTICATED');

  const url = new URL(`${BASE_URL}/playlistItems`);
  url.searchParams.set('part', 'snippet');

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      snippet: {
        playlistId,
        resourceId: { kind: 'youtube#video', videoId },
      },
    }),
  });

  if (!res.ok) {
    throw new YouTubeApiError(res.status, `Failed to add item: ${res.status}`, 'API_ERROR');
  }

  const data = (await res.json()) as { id: string };
  return data;
}

export async function rateVideo(videoId: string, rating: 'like' | 'dislike' | 'none'): Promise<void> {
  const token = get(accessToken);
  if (!token) throw new YouTubeApiError(401, 'Not signed in', 'UNAUTHENTICATED');

  const url = new URL(`${BASE_URL}/videos/rate`);
  url.searchParams.set('id', videoId);
  url.searchParams.set('rating', rating);

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok && res.status !== 204) {
    throw new YouTubeApiError(res.status, `Failed to rate video: ${res.status}`, 'API_ERROR');
  }
}

