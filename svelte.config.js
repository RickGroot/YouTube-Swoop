import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      fallback: 'index.html',
    }),
    paths: {
      base: process.env.BASE_PATH ?? '',
    },
    prerender: {
      handleHttpError: ({ path, message }) => {
        // Suppress 404s for icon files — users supply their own
        if (path.startsWith('/icons/') || path.endsWith('.png')) return;
        throw new Error(message);
      },
    },
  },
};

export default config;
