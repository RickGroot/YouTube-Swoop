<script lang="ts">
  import { base } from '$app/paths';
  import { isSignedIn, userInfo } from '$lib/stores/auth-store';
  import { signIn, signOut } from '$lib/api/youtube-auth';
  import { addToast } from '$lib/stores/toast-store';

  type AppView = 'auth' | 'setup' | 'swipe' | 'settings' | 'history' | 'progress';

  type Props = {
    view: AppView;
    onSettings: () => void;
    onHistory: () => void;
    onProgress: () => void;
    onBack: () => void;
  };

  let { view, onSettings, onHistory, onProgress, onBack }: Props = $props();

  let isSigningIn = $state(false);

  const showBack = $derived(view === 'settings' || view === 'history' || view === 'progress');
  const showActions = $derived($isSignedIn && (view === 'swipe' || view === 'setup'));

  async function handleSignIn() {
    isSigningIn = true;
    try {
      await signIn();
    } catch {
      addToast('Sign in failed. Please try again.', 'error');
    } finally {
      isSigningIn = false;
    }
  }

  async function handleSignOut() {
    await signOut();
    addToast('Signed out', 'info');
  }
</script>

<header class="app-header">
  <div class="app-header__inner">
    <div class="app-header__start">
      {#if showBack}
        <button class="app-header__back" onclick={onBack} aria-label="Back">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      {:else}
        <a href="{base}/" class="app-header__logo" aria-label="YouTube Swoop home">
          <img src="{base}/icons/logo.png" alt="" class="app-header__logo-img" aria-hidden="true" />
          <span class="app-header__title">Swoop</span>
        </a>
      {/if}
    </div>

    <div class="app-header__end">
      {#if showActions}
        <div class="app-header__action-group">
          <button class="app-header__icon-btn" onclick={onHistory} aria-label="Review history" title="History">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </button>
          <button class="app-header__icon-btn" onclick={onProgress} aria-label="View progress" title="Progress">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <line x1="18" y1="20" x2="18" y2="10" />
              <line x1="12" y1="20" x2="12" y2="4" />
              <line x1="6" y1="20" x2="6" y2="14" />
            </svg>
          </button>
          <button class="app-header__icon-btn" onclick={onSettings} aria-label="Settings" title="Settings">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </button>
        </div>
      {/if}

      {#if $isSignedIn}
        <button class="app-header__avatar-btn" onclick={handleSignOut} title="Sign out — {$userInfo?.name ?? ''}">
          {#if $userInfo?.picture}
            <img src={$userInfo.picture} alt={$userInfo.name} class="app-header__avatar" referrerpolicy="no-referrer" />
          {:else}
            <span class="app-header__avatar-placeholder">{($userInfo?.name ?? 'U')[0]}</span>
          {/if}
        </button>
      {:else}
        <button class="app-header__sign-in" onclick={handleSignIn} disabled={isSigningIn}>
          {isSigningIn ? 'Signing in…' : 'Sign in'}
        </button>
      {/if}
    </div>
  </div>
</header>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .app-header {
    position: sticky;
    top: 0;
    z-index: 100;
    height: var(--header-height);
    @include glass;
    border-left: none;
    border-right: none;
    border-top: none;
    border-radius: 0;
  }

  .app-header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 100%;
    padding: 0 var(--space-4);
    max-width: var(--max-content-width);
    margin: 0 auto;
    width: 100%;
  }

  .app-header__start,
  .app-header__end {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .app-header__logo {
    display: flex;
    align-items: center;
    gap: var(--space-2);
    color: var(--color-text);
    text-decoration: none;
  }

  .app-header__logo-img {
    width: 28px;
    height: 28px;
  }

  .app-header__title {
    font-size: var(--text-lg);
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .app-header__back {
    @include button-reset;
    @include focus-visible;
    @include touch-target;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-accent);
    border-radius: var(--radius-md);
    font-weight: 600;
  }

  .app-header__action-group {
    display: flex;
    align-items: center;
    gap: 2px;
    padding: 4px;
    background: rgba(0, 0, 0, 0.04);
    border-radius: var(--radius-pill);

    :global([data-theme='dark']) & {
      background: rgba(255, 255, 255, 0.06);
    }
  }

  .app-header__icon-btn {
    @include button-reset;
    @include focus-visible;
    @include touch-target;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 34px;
    height: 34px;
    min-width: unset;
    min-height: unset;
    color: var(--color-text-secondary);
    border-radius: var(--radius-pill);
    transition: color var(--transition-fast), background var(--transition-fast);

    &:hover {
      color: var(--color-text);
      background: rgba(0, 0, 0, 0.06);
    }
  }

  .app-header__avatar-btn {
    @include button-reset;
    @include focus-visible;
    width: 30px;
    height: 30px;
    border-radius: var(--radius-pill);
    overflow: hidden;
    flex-shrink: 0;
    box-shadow: 0 0 0 2px var(--color-border);
  }

  .app-header__avatar {
    width: 30px;
    height: 30px;
    border-radius: var(--radius-pill);
    object-fit: cover;
  }

  .app-header__avatar-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    background: var(--color-accent);
    color: var(--color-text-inverse);
    font-size: var(--text-xs);
    font-weight: 700;
    border-radius: var(--radius-pill);
  }

  .app-header__sign-in {
    @include focus-visible;
    padding: 6px var(--space-4);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-pill);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    transition: background var(--transition-fast), opacity var(--transition-fast);

    &:hover:not(:disabled) {
      background: var(--color-accent-hover);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
</style>
