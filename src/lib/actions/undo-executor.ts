import { removePlaylistItem, addPlaylistItem, rateVideo } from '$lib/api/youtube-api';
import type { UndoPayload } from '$lib/actions/action-types';

export async function executeUndo(payload: UndoPayload): Promise<void> {
  switch (payload.type) {
    case 'noop':
      return;

    case 'add-to-playlist':
      // Undo an add: remove the item that was just added
      await removePlaylistItem(payload.playlistItemId);
      return;

    case 'remove-from-playlist':
      // Undo a remove: re-add the video to the playlist
      await addPlaylistItem(payload.videoId, payload.playlistId);
      return;

    case 'move-to-playlist':
      // Undo a move: remove from target, re-add to source
      await removePlaylistItem(payload.toPlaylistItemId);
      await addPlaylistItem(payload.videoId, payload.sourcePlaylistId);
      return;

    case 'like':
      await rateVideo(payload.videoId, payload.previousRating);
      return;
  }
}
