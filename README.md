<div align="center">

<h1>carrel.winlab.tw</h1>

<p>The page that shows WinLab members what Carrel does and how to install it in Claude Code.</p>

<p>
<a href="https://github.com/NYCU-WinLab/carrel.winlab.tw/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/NYCU-WinLab/carrel.winlab.tw/actions/workflows/ci.yml/badge.svg"></a>
<a href="https://carrel.winlab.tw"><img alt="Live" src="https://img.shields.io/badge/live-carrel.winlab.tw-0033A0"></a>
</p>

</div>

## What it shows

- A Claude Code window that plays short turns: open a machine, publish a site, add a database, save a snapshot, pause.
- A figure of the 8 machines each member gets, drawn as a row of study carrels.
- The install steps: `/plugins`, the `claudeai-nycu-winlab-marketplace`, the `infrastructure` plugin, then `/mcp` sign-in.

Carrel itself lives in [NYCU-WinLab/carrel](https://github.com/NYCU-WinLab/carrel).

## Quick start

```bash
bun install
bun run dev
```

## How it works

- Next.js static export, served by nginx in one image.
- Components come from the WinLab registry at [ui.winlab.tw](https://ui.winlab.tw).
- `components/terminal/` redraws Claude Code's screen with HTML. The look follows a real Claude Code run with an empty config. The content comes from props and `lib/demos.ts`.
- `public/figure/carrel.html` is an isometric figure built by `figure/build.mjs`.

## Deploy

Each push to `main` publishes `ghcr.io/nycu-winlab/carrel.winlab.tw:sha-<commit>` and `:main`.

```bash
SITE_VERSION=sha-abc1234 SITE_BIND=10.10.10.117:3110 docker compose up -d
```

The gateway sends the Carrel paths (`/mcp`, `/oauth/`, `/.well-known/`, `/healthz`, `/internal/`, `/apps/`) to Carrel and every other path to this image.

## For AI agents

- **Summary:** static marketing and install page for Carrel.
- **Type:** web
- **Interfaces:** HTTP on port 8080 in the image.
- **Install:** `bun install`
- **Run:** `bun run dev`
- **Verify:** `bun run tokens:check && bun run lint && bun run typecheck && bun run build`
- **Config:** `NEXT_PUBLIC_BUILD_SHA`, `NEXT_PUBLIC_BUILD_TIME`, `NEXT_PUBLIC_BUILD_URL` at build time.
- **Secrets:** none
- **Limits:** the terminal is a drawing; it runs no commands.

## License

MIT
