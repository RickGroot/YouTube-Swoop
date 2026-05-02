import { removePlaylistItem, addPlaylistItem, rateVideo } from '$lib/api/youtube-api';
import type { VideoItem, PlaylistSourceVideoItem } from '$lib/feed/feed-types';
import type { ActionConfig, ActionResult, UndoPayload } from '$lib/actions/action-types';

function isPlaylistSource(v: VideoItem): v is PlaylistSourceVideoItem {
  return v.source === 'ownedPlaylist';
}

export async function executeAction(
  video: VideoItem,
  action: ActionConfig,
): Promise<ActionResult & { undo: UndoPayload }> {
  const base = { actionType: action.type, videoId: video.videoId };

  switch (action.type) {
    case 'keep':
    case 'skip':
      return { ...base, success: true, undo: { type: 'noop' } };

    case 'remove-from-playlist': {
      if (!isPlaylistSource(video)) {
        return {
          ...base,
          success: false,
          error: 'Video is not from a playlist source',
          undo: { type: 'noop' },
        };
      }
      await removePlaylistItem(video.playlistItemId);
      return {
        ...base,
        success: true,
        playlistItemId: video.playlistItemId,
        undo: {
          type: 'remove-from-playlist',
          videoId: video.videoId,
          playlistId: video.sourcePlaylistId,
        },
      };
    }

    case 'add-to-playlist': {
      const playlistId = action.params?.playlistId;
      if (!playlistId) {
        return {
          ...base,
          success: false,
          error: 'No target playlist configured',
          undo: { type: 'noop' },
        };
      }
      const added = await addPlaylistItem(video.videoId, playlistId);
      return {
        ...base,
        success: true,
        targetPlaylistId: playlistId,
        undo: {
          type: 'add-to-playlist',
          videoId: video.videoId,
          playlistItemId: added.id,
          playlistId,
        },
      };
    }

    case 'move-to-playlist': {
      if (!isPlaylistSource(video)) {
        return {
          ...base,
          success: false,
          error: 'Video is not from a playlist source',
          undo: { type: 'noop' },
        };
      }
      const targetPlaylistId = action.params?.playlistId;
      if (!targetPlaylistId) {
        return {
          ...base,
          success: false,
          error: 'No target playlist configured',
          undo: { type: 'noop' },
        };
      }
      await removePlaylistItem(video.playlistItemId);
      const added = await addPlaylistItem(video.videoId, targetPlaylistId);
      return {
        ...base,
        success: true,
        targetPlaylistId,
        undo: {
          type: 'move-to-playlist',
          videoId: video.videoId,
          fromPlaylistItemId: video.playlistItemId,
          toPlaylistItemId: added.id,
          targetPlaylistId,
          sourcePlaylistId: video.sourcePlaylistId,
        },
      };
    }

    case 'like': {
      const rating = action.params?.rating ?? 'like';
      await rateVideo(video.videoId, rating);
      return {
        ...base,
        success: true,
        undo: { type: 'like', videoId: video.videoId, previousRating: 'none' },
      };
    }

    case 'open-video': {
      window.open(`https://www.youtube.com/watch?v=${video.videoId}`, '_blank', 'noopener');
      return { ...base, success: true, undo: { type: 'noop' } };
    }

    case 'open-channel': {
      window.open(`https://www.youtube.com/channel/${video.channelId}`, '_blank', 'noopener');
      return { ...base, success: true, undo: { type: 'noop' } };
    }

    case 'tag-local': {
      // Tag stored in review history via recordAction — no API call needed
      return { ...base, success: true, undo: { type: 'noop' } };
    }

    default:
      return { ...base, success: false, error: 'Unknown action type', undo: { type: 'noop' } };
  }
}
