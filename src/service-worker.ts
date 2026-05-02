/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

import { build, files, version } from '$service-worker';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = `yt-swoop-${version}`;
const YOUTUBE_API_ORIGIN = 'https://www.googleapis.com';
const YOUTUBE_IMG_ORIGIN = 'https://i.ytimg.com';

const APP_SHELL = [...build, ...files];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache YouTube API calls — always network-only
  if (url.origin === YOUTUBE_API_ORIGIN) return;

  // Cache YouTube thumbnails with stale-while-revalidate
  if (url.origin === YOUTUBE_IMG_ORIGIN) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) cache.put(request, response.clone());
          return response;
        });
        return cached ?? fetchPromise;
      }),
    );
    return;
  }

  // App shell: cache-first
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => cached ?? fetch(request)),
  );
});
