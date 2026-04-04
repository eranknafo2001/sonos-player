Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- `Bun.$` for shell commands instead of `execa`.

## Project structure

This is a Bun workspace monorepo.

### Packages

- `packages/core` — Sonos control (`@svrooij/sonos`), MQTT integration, shared app/orchestration logic, CLI
- `packages/headless` — headless service entrypoint + HTTP API (the real app)
- `packages/tui` — debug OpenTUI app (optional, for inspection only)
- `packages/ha-addon` — Home Assistant add-on source (Dockerfile, config.yaml, run.sh)
- `packages/ha-integration` — Home Assistant custom integration source (Python, `custom_components/sonos_player`)

### Key files

- `package.json` — root workspace config, scripts
- `tsconfig.json` — shared TypeScript config (packages extend this)
- `flake.nix` — Nix dev shell (NixOS, no system-wide installs)
- `.env` / `.env.sample` — environment variables
- `scripts/export-ha.ts` — exports publishable HA repo to `dist/ha-publish`
- `.github/workflows/publish-ha-repo.yml` — CI: bumps version, exports, publishes to `eranknafo2001/sonos-player-ha`

### Environment

- NixOS dev shell via `nix develop`
- `.env` at repo root is loaded by package scripts via `--env-file=../../.env`
- Key env vars: `SONOS_HOST`, `SONOS_PORT`, `SONOS_DISCOVERY_TIMEOUT`, `MQTT_URL`, `MQTT_USER`, `MQTT_PASSWORD`, `MQTT_DISCOVERY_PREFIX`, `SONOS_PLAYER_API_PORT`, `SONOS_PLAYER_API_TOKEN`

## Scripts

```sh
bun start          # run headless service
bun tui            # run debug TUI
bun cli -- scan    # run CLI
bun run typecheck  # typecheck all packages
bun run export:ha  # export HA publish repo to dist/ha-publish
```

## Architecture

- **Sonos module** (`packages/core/src/sonos/`) — discovery, speaker state, grouping, playback, favorites. Uses `@svrooij/sonos`. No MQTT dependency.
- **MQTT module** (`packages/core/src/mqtt/`) — MQTT connection, desired speaker state, HA discovery publishing, workaround config. No Sonos dependency.
- **App module** (`packages/core/src/app/`) — orchestrates Sonos + MQTT: reconciles desired state, publishes snapshots, handles coordinator-leave workaround, media browsing/playing.
- **Headless** (`packages/headless/`) — starts app background service, exposes HTTP API (`/health`, `/api/state`, `/api/command`, `/api/browse`, `/api/play-media`).
- **TUI** (`packages/tui/`) — OpenTUI React app for debugging. Uses `@tanstack/react-query` with refetch interval. Imports from `@sonos-player/core`.

## Home Assistant integration

- **MQTT entities** — switches per speaker (group membership + advance-on-coordinator-leave workaround), coordinator sensor. Published via MQTT device discovery to `homeassistant/device/sonos-player/config`.
- **Custom integration** (`packages/ha-integration/`) — Python HA integration that provides a real `media_player` entity via the headless HTTP API. Supports play/pause/next/previous, browse media (Sonos Favorites), play media.
- **Add-on** (`packages/ha-addon/`) — Docker-based HA add-on that runs the headless service on HAOS.
- **Publishing** — CI exports source packages into a publishable repo layout at `eranknafo2001/sonos-player-ha`. That repo is what users add to HACS/add-on store.

## Key design decisions

- Sonos is source of truth for actual topology/playback state
- MQTT retained topics are the persistence layer for desired group membership
- No local DB/state for desired membership
- External playback control is allowed (Sonos app, HA, other controllers)
- One long-lived `SonosManager` instance, reused to avoid re-discovery
- Headless service is primary; TUI is temporary/debug only
- OpenTUI is isolated to the TUI package (not installed for headless)
- Version is auto-bumped on each CI publish via `scripts/export-ha.ts`

## Commit conventions

- Always run `bun run typecheck` before committing
- When pushing, CI auto-bumps version and publishes to HA repo
- Version bump commits from CI use `[skip ci]` to prevent cascading runs
- After committing, always push: `git add -A && git commit -m "message" && git pull --rebase origin main && git push origin main`
