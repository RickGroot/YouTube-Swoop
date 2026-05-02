<script lang="ts">
  import '../lib/styles/global.scss';
  import Toast from '$lib/components/Toast.svelte';
  import { onMount } from 'svelte';
  import { initAuthClient } from '$lib/api/youtube-auth';
  import { loadConfig } from '$lib/config/migrations';
  import { appConfig } from '$lib/config/config-store';

  let { children } = $props();

  onMount(async () => {
    // Detect and apply saved theme preference
    const savedTheme = localStorage.getItem('yt-swoop-theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const theme = savedTheme ?? (prefersDark ? 'dark' : 'light');
    document.documentElement.setAttribute('data-theme', theme);

    // Initialize OAuth client
    await initAuthClient();
  });
</script>

<div class="app-root">
  {@render children()}
  <Toast />
</div>

<style lang="scss">
  .app-root {
    min-height: 100dvh;
    display: flex;
    flex-direction: column;
  }
</style>
