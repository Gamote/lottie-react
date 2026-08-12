# Contributing

Thanks for helping make lottie-react better.

## Setup

[pnpm](https://pnpm.io) drives everything; the Node floor is stated in `package.json`'s `devEngines`.

```bash
pnpm install
pnpm dev
```

`pnpm dev` builds the library in watch mode and serves the website beside it. The website consumes the library through its public entry point, exactly as a published install would, so it is where a change becomes visible.

## The checks

```bash
pnpm check
```

This is the gate: typecheck, format and lint, the tests with coverage, the build, and the website's own check. It has to pass before a change is finished. The steps also run individually as `pnpm typecheck`, `pnpm format:check`, `pnpm test` and `pnpm build`; `format:check` only reports, and `pnpm format` applies what is auto-fixable.

Two further checks run on their own rather than inside the gate: `pnpm check:react18` runs the test suite against React 18, and `pnpm check:package` packs the library and proves the result installs and loads through both module systems.

Linting and formatting are both Biome, configured in `biome.jsonc`. The extension is load-bearing: in a `biome.json`, a comment silently voids every exclusion, so the config stays `.jsonc`. `pnpm lint` runs the linter alone; a warning fails every check-only script.

## Changes

- Keep a change focused on one thing, with its test in the same change.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).
- Read the surrounding code first and match its idiom.
