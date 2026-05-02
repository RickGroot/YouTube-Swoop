import type { ActionConfig } from '$lib/actions/action-types';

export const DEFAULT_PLAYLIST_ACTIONS: ActionConfig[] = [
  {
    id: 'playlist-swipe-left',
    label: 'Remove',
    direction: 'left',
    type: 'remove-from-playlist',
    enabled: true,
  },
  {
    id: 'playlist-swipe-right',
    label: 'Keep',
    direction: 'right',
    type: 'keep',
    enabled: true,
  },
  {
    id: 'playlist-swipe-up',
    label: 'Open',
    direction: 'up',
    type: 'open-video',
    enabled: true,
  },
  {
    id: 'playlist-swipe-down',
    label: 'Skip',
    direction: 'down',
    type: 'skip',
    enabled: true,
  },
];

export const DEFAULT_FEED_ACTIONS: ActionConfig[] = [
  {
    id: 'feed-swipe-left',
    label: 'Skip',
    direction: 'left',
    type: 'skip',
    enabled: true,
  },
  {
    id: 'feed-swipe-right',
    label: 'Save',
    direction: 'right',
    type: 'add-to-playlist',
    enabled: true,
    params: { playlistId: '' },
  },
  {
    id: 'feed-swipe-up',
    label: 'Open',
    direction: 'up',
    type: 'open-video',
    enabled: true,
  },
  {
    id: 'feed-swipe-down',
    label: 'Like',
    direction: 'down',
    type: 'like',
    enabled: false,
  },
];

export const MAX_ITEMS_PER_SESSION_DEFAULT = 50;
