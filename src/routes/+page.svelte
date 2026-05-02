<script lang="ts">
  import { onMount } from 'svelte';
  import { get } from 'svelte/store';
  import AppHeader from '$lib/components/AppHeader.svelte';
  import FeedSetup from '$lib/components/FeedSetup.svelte';
  import SwipeDeck from '$lib/components/SwipeDeck.svelte';
  import ProgressPanel from '$lib/components/ProgressPanel.svelte';
  import ReviewHistory from '$lib/components/ReviewHistory.svelte';
  import ActionSettings from '$lib/components/ActionSettings.svelte';
  import EmptyState from '$lib/components/EmptyState.svelte';
  import { isSignedIn } from '$lib/stores/auth-store';
  import { queue, currentVideo, resetQueue } from '$lib/stores/queue-store';
  import { appConfig } from '$lib/config/config-store';
  import { reviewState, initReviewState, resetReviewState } from '$lib/review/review-store';
  import { loadFeed } from '$lib/feed/feed-loader';
  import { addToast } from '$lib/stores/toast-store';
  import type { FeedKey } from '$lib/feed/feed-types';

  type AppView = 'auth' | 'setup' | 'swipe' | 'settings' | 'history' | 'progress';

  let view = $state<AppView>('auth');
  let subscriptionLoadProgress = $state({ loaded: 0, total: 0 });
  let isStartingFeed = $state(false);

  $effect(() => {
    if ($isSignedIn && view === 'auth') {
      view = 'setup';
    } else if (!$isSignedIn) {
      view = 'auth';
      resetQueue();
    }
  });

  function buildFeedKey(): FeedKey | null {
    const config = get(appConfig);
    if (config.sourceMode === 'ownedPlaylist' && config.sourceFeedId) {
      return `playlist:${config.sourceFeedId}`;
    }
    if (config.sourceMode === 'subscriptions') {
      const uid = localStorage.getItem('yt-swoop-user-info');
      const userId = uid ? (JSON.parse(uid) as { id: string }).id : 'me';
      return `subscriptions:${userId}`;
    }
    return null;
  }

  async function startFeed(): Promise<void> {
    const feedKey = buildFeedKey();
    if (!feedKey) {
      addToast('Please configure a feed source first', 'warning');
      return;
    }
    isStartingFeed = true;
    initReviewState(feedKey);

    await loadFeed({
      reviewState: get(reviewState),
      onSubscriptionProgress: (loaded, total) => {
        subscriptionLoadProgress = { loaded, total };
      },
    });

    isStartingFeed = false;
    const q = get(queue);
    if (q.loadError) {
      addToast(q.loadError, 'error');
      return;
    }
    if (q.items.length === 0) {
      view = 'swipe'; // EmptyState handles this case
      return;
    }
    view = 'swipe';
  }

  function handleBack(): void {
    if (view === 'swipe') {
      resetQueue();
      view = 'setup';
    } else {
      view = 'setup';
    }
  }

  function resetFeed(): void {
    const feedKey = buildFeedKey();
    if (feedKey) resetReviewState(feedKey);
    resetQueue();
    view = 'setup';
  }
</script>

<svelte:head>
  <title>YouTube Swoop</title>
</svelte:head>

<AppHeader
  {view}
  onSettings={() => (view = 'settings')}
  onHistory={() => (view = 'history')}
  onProgress={() => (view = 'progress')}
  onBack={handleBack}
/>

<main class="page-main">
  {#if view === 'auth'}
    <EmptyState
      type="auth"
      title="Sign in to get started"
      message="Connect your Google account to start swooping through your YouTube playlists and subscriptions."
    />
  {:else if view === 'setup'}
    <FeedSetup
      onStart={startFeed}
      isLoading={isStartingFeed}
      {subscriptionLoadProgress}
    />
  {:else if view === 'swipe'}
    {#if $queue.loadError}
      <EmptyState
        type="error"
        title="Failed to load feed"
        message={$queue.loadError}
        actionLabel="Try again"
        onAction={() => startFeed()}
      />
    {:else if $queue.items.length === 0 && !$queue.isLoading}
      <EmptyState
        type="empty"
        title="All caught up!"
        message="You've reviewed all videos in this feed."
        actionLabel="Start over"
        onAction={resetFeed}
      />
    {:else}
      <SwipeDeck onComplete={() => (view = 'progress')} />
    {/if}
  {:else if view === 'settings'}
    <ActionSettings onClose={() => (view = get(queue).items.length > 0 ? 'swipe' : 'setup')} />
  {:else if view === 'history'}
    <ReviewHistory onClose={() => (view = get(queue).items.length > 0 ? 'swipe' : 'setup')} />
  {:else if view === 'progress'}
    <ProgressPanel
      onContinue={() => (view = 'swipe')}
      onReset={resetFeed}
    />
  {/if}
</main>

<style lang="scss">
  .page-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
</style>
