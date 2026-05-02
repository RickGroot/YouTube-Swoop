<script lang="ts">
  import { signIn } from '$lib/api/youtube-auth';
  import { addToast } from '$lib/stores/toast-store';

  type EmptyStateType = 'auth' | 'empty' | 'error' | 'loading';

  type Props = {
    type: EmptyStateType;
    title: string;
    message: string;
    actionLabel?: string;
    onAction?: () => void;
  };

  let { type, title, message, actionLabel, onAction }: Props = $props();

  let isSigning = $state(false);

  async function handleAuth() {
    isSigning = true;
    try {
      await signIn();
    } catch {
      addToast('Sign in failed. Please try again.', 'error');
    } finally {
      isSigning = false;
    }
  }
</script>

<div class="empty-state" role="status">
  <div class="empty-state__card">
    <div class="empty-state__icon" aria-hidden="true">
      {#if type === 'auth'}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      {:else if type === 'empty'}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      {:else if type === 'error'}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      {:else}
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <line x1="12" y1="2" x2="12" y2="6" /><line x1="12" y1="18" x2="12" y2="22" />
          <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" /><line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
          <line x1="2" y1="12" x2="6" y2="12" /><line x1="18" y1="12" x2="22" y2="12" />
          <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" /><line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
        </svg>
      {/if}
    </div>

    <h2 class="empty-state__title">{title}</h2>
    <p class="empty-state__message">{message}</p>

    {#if type === 'auth'}
      <button class="empty-state__btn" onclick={handleAuth} disabled={isSigning}>
        {isSigning ? 'Connecting…' : 'Connect with Google'}
      </button>
    {:else if actionLabel && onAction}
      <button class="empty-state__btn" onclick={onAction}>{actionLabel}</button>
    {/if}
  </div>
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: 1;
    padding: var(--space-8) var(--space-6);
  }

  .empty-state__card {
    @include glass-raised;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-4);
    padding: var(--space-8) var(--space-6);
    border-radius: var(--radius-lg);
    max-width: 320px;
    width: 100%;
  }

  .empty-state__icon {
    width: 64px;
    height: 64px;
    border-radius: var(--radius-lg);
    background: rgba(0, 0, 0, 0.04);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--color-text-secondary);

    :global([data-theme='dark']) & {
      background: rgba(255, 255, 255, 0.06);
    }
  }

  .empty-state__title {
    font-size: var(--text-xl);
    font-weight: 700;
    color: var(--color-text);
    letter-spacing: -0.02em;
  }

  .empty-state__message {
    font-size: var(--text-sm);
    color: var(--color-text-secondary);
    line-height: 1.6;
  }

  .empty-state__btn {
    @include focus-visible;
    @include touch-target;
    padding: var(--space-3) var(--space-6);
    background: var(--color-accent);
    color: var(--color-text-inverse);
    border: none;
    border-radius: var(--radius-pill);
    font-size: var(--text-sm);
    font-weight: 600;
    cursor: pointer;
    width: 100%;
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
