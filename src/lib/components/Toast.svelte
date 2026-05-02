<script lang="ts">
  import { toasts, removeToast } from '$lib/stores/toast-store';
</script>

<div class="toast-container" aria-live="polite" aria-atomic="false">
  {#each $toasts as toast (toast.id)}
    <div class="toast toast--{toast.type}" role="status">
      <span class="toast__dot" aria-hidden="true"></span>
      <span class="toast__message">{toast.message}</span>
      <button class="toast__close" onclick={() => removeToast(toast.id)} aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </button>
    </div>
  {/each}
</div>

<style lang="scss">
  @use '$lib/styles/mixins' as *;

  .toast-container {
    position: fixed;
    bottom: var(--space-8);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    pointer-events: none;
    width: min(380px, calc(100vw - 32px));
  }

  .toast {
    @include glass;
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    border-radius: var(--radius-pill);
    pointer-events: all;
    animation: toast-in 200ms cubic-bezier(0.34, 1.56, 0.64, 1);

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  .toast__dot {
    width: 8px;
    height: 8px;
    border-radius: var(--radius-pill);
    flex-shrink: 0;

    .toast--success & { background: var(--color-action-right); }
    .toast--error & { background: var(--color-action-left); }
    .toast--warning & { background: var(--color-action-down); }
    .toast--info & { background: var(--color-action-up); }
  }

  .toast__message {
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--color-text);
    flex: 1;
  }

  .toast__close {
    @include button-reset;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-pill);
    color: var(--color-text-tertiary);
    cursor: pointer;
    flex-shrink: 0;
    transition: color var(--transition-fast);

    &:hover { color: var(--color-text); }
  }

  @keyframes toast-in {
    from { opacity: 0; transform: translateY(12px) scale(0.96); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
</style>
