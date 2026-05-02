import { PUBLIC_GOOGLE_CLIENT_ID } from '$env/static/public';
import { setAccessToken, clearAuth } from '$lib/stores/auth-store';
import { userInfo } from '$lib/stores/auth-store';
import type { UserInfo } from '$lib/config/config-types';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube',
  'https://www.googleapis.com/auth/youtube.readonly',
].join(' ');

type TokenClient = {
  requestAccessToken: (opts?: { prompt?: string }) => void;
};

type GoogleAccountsOauth2 = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: { access_token?: string; error?: string }) => void;
  }) => TokenClient;
  revoke: (token: string, callback: () => void) => void;
};

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: GoogleAccountsOauth2;
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
          }) => void;
          prompt: () => void;
        };
      };
    };
  }
}

let tokenClient: TokenClient | null = null;
let resolveSignIn: ((token: string) => void) | null = null;
let rejectSignIn: ((err: Error) => void) | null = null;

function waitForGis(): Promise<void> {
  return new Promise((resolve) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const interval = setInterval(() => {
      if (window.google?.accounts?.oauth2) {
        clearInterval(interval);
        resolve();
      }
    }, 100);
  });
}

export async function initAuthClient(): Promise<void> {
  await waitForGis();

  tokenClient = window.google!.accounts.oauth2.initTokenClient({
    client_id: PUBLIC_GOOGLE_CLIENT_ID,
    scope: SCOPES,
    callback: (response) => {
      if (response.error || !response.access_token) {
        rejectSignIn?.(new Error(response.error ?? 'Unknown auth error'));
        resolveSignIn = null;
        rejectSignIn = null;
        return;
      }
      setAccessToken(response.access_token);
      resolveSignIn?.(response.access_token);
      resolveSignIn = null;
      rejectSignIn = null;
    },
  });
}

export function requestSignIn(): Promise<string> {
  if (!tokenClient) {
    return Promise.reject(new Error('Auth client not initialized'));
  }
  return new Promise((resolve, reject) => {
    resolveSignIn = resolve;
    rejectSignIn = reject;
    tokenClient!.requestAccessToken({ prompt: 'consent' });
  });
}

export async function fetchUserInfo(accessToken: string): Promise<UserInfo> {
  const res = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo?fields=id,name,email,picture',
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );
  if (!res.ok) throw new Error('Failed to fetch user info');
  const data = (await res.json()) as { id: string; name: string; email: string; picture: string };
  return data;
}

export async function signIn(): Promise<void> {
  const token = await requestSignIn();
  const info = await fetchUserInfo(token);
  userInfo.set(info);
}

export async function signOut(): Promise<void> {
  clearAuth();
  tokenClient = null;
  await initAuthClient();
}
