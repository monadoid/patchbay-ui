# Repository Instructions

## Project Rules

- Use Vite+ (`vp`) for package management and root scripts.
- Keep the docs app as a Svelte/Vite Cloudflare Worker at `apps/docs-worker/`.
- Keep Tailwind available for docs and theme examples.
- Treat `apps/pb-ui-lab/` as a Vite comparison lab, not the production docs app.
- Do not reintroduce the old Next.js docs app unless explicitly asked.

## Vendored Repositories

This project may keep external repositories or SDK snapshots under `repos/`.

- Use vendored repositories as read-only reference material when working with related libraries.
- Prefer examples and patterns from the vendored source code over generated guesses or web search.
- Do not edit files under `repos/` unless explicitly asked.
- Do not import from `repos/`; application code should continue importing from normal package dependencies.

Keep any external reference snapshots out of public source and treat them as read-only context only.
