export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export type ActionType =
  | 'keep'
  | 'skip'
  | 'remove-from-playlist'
  | 'add-to-playlist'
  | 'move-to-playlist'
  | 'open-video'
  | 'open-channel'
  | 'like'
  | 'tag-local';

export type ActionParams = {
  playlistId?: string;
  rating?: 'like' | 'dislike' | 'none';
  urlMode?: 'video' | 'channel';
  localTag?: string;
};

export type ActionConfig = {
  id: string;
  label: string;
  direction: SwipeDirection;
  type: ActionType;
  enabled: boolean;
  params?: ActionParams;
};

export type ActionResult = {
  success: boolean;
  actionType: ActionType;
  videoId: string;
  playlistItemId?: string;
  targetPlaylistId?: string;
  error?: string;
};

export type UndoPayload =
  | { type: 'add-to-playlist'; videoId: string; playlistItemId: string; playlistId: string }
  | { type: 'remove-from-playlist'; videoId: string; playlistId: string; position?: number }
  | { type: 'move-to-playlist'; videoId: string; fromPlaylistItemId: string; toPlaylistItemId: string; targetPlaylistId: string; sourcePlaylistId: string }
  | { type: 'like'; videoId: string; previousRating: 'like' | 'dislike' | 'none' }
  | { type: 'noop' };
