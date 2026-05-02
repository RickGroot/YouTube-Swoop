import type { AppConfig } from '$lib/config/config-types';
import { DEFAULT_FEED_ACTIONS, MAX_ITEMS_PER_SESSION_DEFAULT } from '$lib/config/default-config';

const CONFIG_KEY = 'yt-swoop-config';
const CURRENT_SCHEMA_VERSION = 1 as const;

function buildDefaultConfig(): AppConfig {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    actions: DEFAULT_FEED_ACTIONS,
    targetPlaylistId: null,
    sourceMode: 'ownedPlaylist',
    sourceFeedId: null,
    maxItemsPerSession: MAX_ITEMS_PER_SESSION_DEFAULT,
  };
}

export function loadConfig(): AppConfig {
  if (typeof window === 'undefined') return buildDefaultConfig();

  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (!raw) return buildDefaultConfig();

    const parsed = JSON.parse(raw) as Partial<AppConfig>;

    // v1 is the only version — extend here as schema evolves
    if (parsed.schemaVersion === 1) {
      return { ...buildDefaultConfig(), ...parsed };
    }

    return buildDefaultConfig();
  } catch {
    return buildDefaultConfig();
  }
}

export function saveConfig(config: AppConfig): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
}
