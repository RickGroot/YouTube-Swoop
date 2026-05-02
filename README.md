# YouTube Swoop

A progressive web app (PWA) for triaging YouTube playlists and subscription feeds using swipeable cards. Swipe right to keep, left to remove, up/down for custom actions — all configurable.

## Features

- Swipe through playlist videos to keep or remove them
- Swipe through subscription feeds to save videos to a target playlist
- Fully configurable swipe actions (keep, skip, remove, add, move, like, open, tag)
- Undo the last action
- Persistent review progress per feed (resumes where you left off)
- Session progress stats (reviewed, kept, removed, skipped, added, moved, failed)
- Review history with timestamps
- Installable PWA with offline app shell
- Dark mode (follows system preference)
- Keyboard navigation (arrow keys)
- No backend — all data stays in your browser

---

## Prerequisites

- Node.js 18+
- Yarn 4+ (`npm install -g yarn`)
- A Google Cloud project with the YouTube Data API v3 enabled
- An OAuth 2.0 Web Application credential (Client ID only — no secret needed)

---

## 1. Google Cloud Setup

### 1.1 Create a project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click **Select a project** → **New Project**
3. Name it (e.g. `yt-swoop`) and click **Create**

### 1.2 Enable YouTube Data API v3

1. In the sidebar: **APIs & Services** → **Library**
2. Search for **YouTube Data API v3**
3. Click **Enable**

### 1.3 Configure the OAuth consent screen

1. **APIs & Services** → **OAuth consent screen**
2. Choose **External** (unless you're using Google Workspace)
3. Fill in app name, support email, developer contact
4. Add scopes: `https://www.googleapis.com/auth/youtube`
5. Add your Google account as a **Test user** (required while app is in Testing status)
6. Save

### 1.4 Create OAuth credentials

1. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
2. Application type: **Web application**
3. Name it anything
4. **Authorized JavaScript origins** — add:
   - `http://localhost:5173` (for local dev)
   - `https://YOUR_GITHUB_USERNAME.github.io` (for GitHub Pages)
5. Leave **Authorized redirect URIs** empty (not needed for implicit flow)
6. Click **Create**
7. Copy the **Client ID** (the long string ending in `.apps.googleusercontent.com`)

---

## 2. Local Development

### 2.1 Install dependencies

```bash
yarn install
```

### 2.2 Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```
PUBLIC_GOOGLE_CLIENT_ID=YOUR_CLIENT_ID_HERE.apps.googleusercontent.com
```

### 2.3 Run the dev server

```bash
yarn dev
```

Open `http://localhost:5173`. Sign in with the Google account you added as a test user.

### 2.4 Type checking

```bash
yarn check
```

### 2.5 Lint

```bash
yarn lint
```

---

## 3. GitHub Pages Deployment

### 3.1 Create a GitHub repository

Push this project to a new GitHub repository.

### 3.2 Add the Client ID secret

1. In your repo: **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `PUBLIC_GOOGLE_CLIENT_ID`
4. Value: your Client ID

### 3.3 Enable GitHub Pages

1. **Settings** → **Pages**
2. Source: **GitHub Actions**

### 3.4 Update the authorized JavaScript origin

Back in Google Cloud Console:

1. **APIs & Services** → **Credentials** → your OAuth client
2. Add to **Authorized JavaScript origins**:
   `https://YOUR_GITHUB_USERNAME.github.io`

The deploy workflow (`.github/workflows/deploy.yml`) builds with `BASE_PATH=/youtube-swoop` and publishes to `https://YOUR_GITHUB_USERNAME.github.io/youtube-swoop/`.

**If your repo is named something other than `youtube-swoop`**, update the `BASE_PATH` value in `.github/workflows/deploy.yml` to match.

### 3.5 Deploy

Push to `main`. The GitHub Actions workflow builds and deploys automatically.

---

## 4. PWA Installation

Once deployed (or on localhost), open the site in Chrome/Edge:
- Desktop: click the install icon in the address bar
- Mobile: **Share** → **Add to Home Screen** (iOS), or browser menu → **Install app** (Android)

---

## 5. Usage Guide

### Playlist review

1. Sign in with Google
2. Select **My Playlists** tab and choose a source playlist
3. (Optional) Choose a target playlist for move actions
4. Tap **Start Swiping**
5. Swipe cards: left = Remove, right = Keep (configurable in Settings)

### Subscription feed

1. Select **Subscriptions** tab
2. Choose a target playlist to save videos to
3. Tap **Start Swiping** — the app fetches recent uploads from your subscriptions
4. Swipe right to add to target playlist, left to skip

### Undo

Tap the ↩ button or configure a keyboard shortcut to undo the last action. Undo reverses the YouTube API operation (re-adds removed items, removes added items, etc.).

### Action settings

Tap the settings gear to configure what each swipe direction does. Available actions:
- **Keep** — marks as kept, no API call
- **Skip** — marks as skipped, no API call
- **Remove from playlist** — removes from source playlist
- **Add to playlist** — adds to target playlist
- **Move to playlist** — removes from source + adds to target
- **Open video** — opens in YouTube (new tab)
- **Open channel** — opens channel in YouTube (new tab)
- **Like** — likes the video
- **Tag locally** — records a local tag in history

---

## 6. Quota Usage

YouTube Data API v3 has a daily quota of **10,000 units** (free tier).

| Operation | Cost |
|---|---|
| Playlist items read (per page) | 1 unit |
| Playlist remove | 50 units |
| Playlist add | 50 units |
| Video like/rate | 50 units |
| Channel info (per request) | 1 unit |
| Subscription list (per page) | 1 unit |

**Subscription mode** uses ~2 units per channel (one for uploads playlist ID, one for video list). Loading 50 channels costs ~100 units.

Heavy remove/add operations consume quota fast. Plan sessions accordingly.

---

## 7. Architecture

```
src/
  lib/
    api/           # YouTube REST API wrappers + Google Identity Services auth
    actions/       # Action execution, undo, and in-memory history
    config/        # App config store (localStorage v1) + default configs
    feed/          # Feed loaders (playlist, subscriptions) + video normalization
    review/        # Per-feed review state (localStorage) + progress computation
    stores/        # Svelte stores: auth, queue, playlists, toasts
    components/    # Svelte 5 presentational components
    styles/        # SCSS tokens, mixins, global reset
  routes/
    +layout.ts     # prerender=true
    +layout.svelte # App shell, GIS init, theme
    +page.svelte   # View state machine (auth|setup|swipe|settings|history|progress)
  service-worker.ts  # Cache app shell; skip YouTube API
  app.html           # GIS script, manifest link
```

---

## 8. localStorage Schema

| Key | Schema version | Content |
|---|---|---|
| `yt-swoop-config` | 1 | `AppConfig` (actions, source, target) |
| `yt-swoop-review-playlist:{id}` | 1 | `ReviewState` per playlist |
| `yt-swoop-review-subscriptions:{userId}` | 1 | `ReviewState` for subscriptions |
| `yt-swoop-history` | — | Last 100 `ReviewHistoryEntry[]` |
| `yt-swoop-user-info` | — | `UserInfo` (name, picture, email) |
| `yt-swoop-theme` | — | `'light' \| 'dark'` |

---

## 9. Known Limitations

- **Quota**: Subscription mode can exhaust the free tier quota if you have many subscriptions. Use the channel limit setting.
- **Private/deleted videos**: Filtered out automatically (YouTube returns them with blank titles).
- **Token expiry**: Google access tokens expire in ~1 hour. The app will show an auth error; just sign in again.
- **No token refresh**: The app uses the implicit flow (no refresh token). After expiry, sign in again.
- **Move undo is best-effort**: Undo re-adds to the source playlist but not at the original position.
- **PWA icons**: Placeholder icons are not included. Add real icons at `static/icons/icon-192.png`, `icon-512.png`, and `icon-512-maskable.png` before deploying.

---

## 10. Tech Stack

- [SvelteKit 2](https://kit.svelte.dev/) + [Svelte 5](https://svelte.dev/) (runes)
- TypeScript (strict)
- SCSS (per-component `<style lang="scss">`)
- `@sveltejs/adapter-static` → GitHub Pages
- Google Identity Services (browser OAuth, no client secret)
- YouTube Data API v3 (direct REST, no gapi library)
- Service Worker (built-in SvelteKit `$service-worker`)
- Vitest (test infrastructure ready; unit tests deferred)

---

## 11. Development Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start dev server |
| `yarn build` | Build for production |
| `yarn preview` | Preview production build |
| `yarn check` | TypeScript + Svelte type check |
| `yarn lint` | ESLint + Stylelint |
| `yarn format` | Prettier format |
