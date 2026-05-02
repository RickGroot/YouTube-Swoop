import type { ReviewState, ReviewStats } from '$lib/review/review-types';

export function computeStats(state: ReviewState | null, totalInQueue: number): ReviewStats {
  if (!state) {
    return {
      reviewed: 0,
      remaining: totalInQueue,
      kept: 0,
      removed: 0,
      skipped: 0,
      added: 0,
      moved: 0,
      failed: 0,
    };
  }

  return {
    reviewed: state.seenVideoIds.length,
    remaining: Math.max(0, totalInQueue - state.seenVideoIds.length),
    kept: state.keptVideoIds.length,
    removed: state.removedVideoIds.length,
    skipped: state.skippedVideoIds.length,
    added: state.addedVideoIds.length,
    moved: state.movedVideoIds.length,
    failed: state.failedVideoIds.length,
  };
}
