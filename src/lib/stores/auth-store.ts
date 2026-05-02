import { writable, derived } from 'svelte/store';
import type { UserInfo } from '$lib/config/config-types';

const USER_INFO_KEY = 'yt-swoop-user-info';

function loadUserInfo(): UserInfo | null {
  try {
    const raw = localStorage.getItem(USER_INFO_KEY);
    return raw ? (JSON.parse(raw) as UserInfo) : null;
  } catch {
    return null;
  }
}

// Access token lives in memory only — never persisted
const accessTokenStore = writable<string | null>(null);
const userInfoStore = writable<UserInfo | null>(
  typeof window !== 'undefined' ? loadUserInfo() : null,
);

export const accessToken = { subscribe: accessTokenStore.subscribe };

export const userInfo = {
  subscribe: userInfoStore.subscribe,
  set: (info: UserInfo | null) => {
    userInfoStore.set(info);
    if (typeof window !== 'undefined') {
      if (info) {
        localStorage.setItem(USER_INFO_KEY, JSON.stringify(info));
      } else {
        localStorage.removeItem(USER_INFO_KEY);
      }
    }
  },
};

export const isSignedIn = derived(accessTokenStore, ($token) => $token !== null);

export function setAccessToken(token: string): void {
  accessTokenStore.set(token);
}

export function clearAuth(): void {
  accessTokenStore.set(null);
  userInfoStore.set(null);
  if (typeof window !== 'undefined') {
    localStorage.removeItem(USER_INFO_KEY);
  }
}
