# CLAUDE.md

The build contract for lottie-react. It applies to every change in this repository, whether written by a person or an agent. Read it before the first edit.

## The project

lottie-react is a React wrapper around [lottie-web](https://github.com/airbnb/lottie-web) for rendering After Effects animations. It ships a component (`Lottie`), a hook (`useLottie`), light variants of both backed by `lottie_light`, a player UI, and an interactivity layer.

Active development happens on the `v3` branch, a rewrite currently at `3.0.0-beta.0`. The `main` branch holds the released v2 line.

## Hard rules

1. **The public API is a contract.** Anything exported from `src/index.ts` is depended on by a large number of projects. Within a major version, nothing exported may change shape, change meaning, or disappear. v3 is the major where breaks are allowed, and each one ships with a migration note in the same change.

2. **Server rendering must never break.** No access to `document`, `window`, or any browser global at module scope, during render, or in any code path a server can reach. Browser work belongs in effects and event handlers. When it is unclear whether a path runs on the server, the safe resolution is to not touch the DOM.

3. **Never implement against remembered lottie-web behavior.** lottie-web is the moving dependency underneath this library, and its behavior differs across versions and renderers. Check the installed package's types, source, and changelog before relying on a method, option, or event. The same applies to React version differences and to bundler resolution behavior.

4. **Stay small.** Nothing here ships as one blob. The build emits a file per module and the package declares `sideEffects: false`, so the size that matters is per import rather than per package. The numbers live in one place: the `size-limit` budgets in `package.json`, measured with lottie-web and React left external, minified and gzipped, and `pnpm check` fails when an import outgrows its budget. Growth is therefore a reviewed raise of a budget line, never a drift, and it stays a cost that has to be justified: keep new runtime dependencies close to zero, and never pull the full lottie-web into the light entry point.

   **`sideEffects: false` is a promise, and the build is shaped around it.** It tells a consumer's bundler that importing a file here does nothing by itself, so any file whose exports go unused may be deleted whole. `unbundle` in `tsdown.config.ts` is what gives it something to delete, because a single merged file is always in use, so there is nothing to drop. A bundler acts on the field without verifying it, so declaring it falsely removes code that should run, with no error and usually no symptom until production. It stops being true the moment a file is imported for its effect (`import "./styles.css"`), does work at module scope, or discards the result of a module-scope call. This library's CSS is rendered by React during render rather than imported, which is what keeps the claim honest. If a real stylesheet ever ships, narrow the field to the array form rather than removing it.

5. **React 18 and 19 are both supported.** The peer range promises both, so a change that only works on one is not finished.

6. **The gate decides done.** `pnpm check` passes before any change is called finished. A red gate is the verdict, not a starting point for an opinion about whether the change was fine anyway.

## Conventions

These describe what the code already does. Follow them so the codebase stays uniform.

### Types and values

No native `enum`. A fixed set of values is an `as const` object map with a derived union type of the same name, which gives the same ergonomics and exhaustiveness without the runtime and erasability problems. `src/types/enums.ts` is the template:

```ts
export const Direction = {
  right: "right",
  left: "left",
} as const;
export type Direction = (typeof Direction)[keyof typeof Direction];
```

No non-null assertions (`!`) and no `any`. Neither appears in `src` today. Narrow with a guard, or make the type honest.

Use `interface XProps` for object-shaped props and `type` for unions and aliases.

### Modules and exports

Named exports throughout. `src/index.ts` is the single public barrel, and a symbol is public only if it is exported there. Default exports are limited to small single-purpose utilities and hooks.

A file's name matches the symbol it exports, in the same casing. Components are PascalCase, hooks are `useThing.ts`, utilities are camelCase. Casing is not cosmetic here: a mismatch between a filename and its import specifier works on macOS and fails on a case-sensitive filesystem.

Import order is enforced by Biome's `organizeImports` assist and is auto-fixable with `pnpm format`.

Relative imports carry a `.js` extension even though the file on disk is `.ts` or `.tsx`: the extension names the emitted output, not the source. This follows from `moduleResolution: nodenext`, which checks specifiers the way Node resolves them rather than the way a bundler would, so a missing extension is a typecheck error. The strictness is deliberate, because this package renders on the server and an import only a bundler can resolve is a defect that `bundler` resolution cannot see.

### Components

Feature code decomposes into small components with typed props and a single visual responsibility, kept as sibling files in the folder they belong to. Hooks own state and side effects; components render what they are given.

Extract something into a shared location only when a second real consumer exists. Do not build interfaces, registries, or type variants ahead of a present need.

**`ref` follows the props.** If a component accepts the host element's attributes and spreads them onto an element it renders, then its `ref` names that same element. Anything imperative it wants to hand back goes on a separately named prop.

The rule exists because the alternative is silently inconsistent: a component that takes `className`, `style`, `id`, `data-*` and `aria-*` and puts them all on its outermost element, and then hands back something that is not that element when you ask for a `ref`, has two rules where a reader expects one. `<Lottie>` is the case that settled it, because it accepts the standard HTML attribute set and lets the caller choose the tag with `as`, so `ref` has to follow `as`.

This cuts both ways, and the second half matters as much as the first. A component that does **not** present itself as an element, because it takes a curated set of options rather than the element's attributes, is free to put an imperative handle on `ref`, and usually should rather than inventing a prop for it. So the question to ask about a new component is not "what should `ref` be" but "does this component present itself as a DOM element", and `ref` follows from the answer.

### Comments

Exported symbols carry a JSDoc block explaining what they are for and how they are meant to be used.

Beyond that, comment only to state a constraint or invariant the code cannot show on its own. Do not narrate what the next line does. Do not reference issue numbers, pull requests, dates, or past work: a comment has to make sense to someone reading the file years from now with no other context.

**Anything temporary carries a comment starting `TODO`**, saying what should replace it or what removes it. Scaffolding that is not marked reads as a design decision, which is exactly how it survives past the point it was meant to.

**Keep a multi-row `TODO` inside its highlight.** Editors highlight a `TODO` by the rows they recognise as part of it, so a continuation row that falls outside stops being highlighted and the note stops looking temporary. Prefer the `/* ... */` form, and indent the continuation one space past where the first row's text begins. Aligning it flush under the opening text is not enough.

**Question every comment a change creates or touches**, including ones that were already there in a block being edited. A comment must never stand in for functionality that was removed or replaced. A description of something no longer in the file is worse than no comment at all, because a reader has no reason to distrust it.

## Testing

Tests live next to the code they cover, as `Name.test.ts` or `Name.test.tsx`. There is no separate directory of tests. The stack is Vitest with happy-dom and Testing Library. Shared setup and mocks belong in `src/test/`, which holds no tests of its own.

**happy-dom performs no layout.** Computed styles resolve, but `offsetWidth`, `offsetHeight` and `getBoundingClientRect()` are zero even on an explicitly sized element. So a size default is assertable as computed style and never as a measured one, and anything that genuinely needs geometry has no home in this suite.

Every behavior change ships its test in the same change. Test behavior through the public surface, not implementation details, and do not write tests that only re-prove what TypeScript already guarantees.

Coverage thresholds are configured in `vitest.config.ts` and are a floor, not a target. Do not lower a threshold to make a change pass.

**The gate measures coverage.** `pnpm test` is `vitest run --coverage`, so a change that drops below a threshold fails `pnpm check`. An untested file counts against the numbers even though nothing imports it, so a file cannot be parked in `src/` until its tests arrive.

**Branches sits below the other three deliberately.** Statements, functions and lines are within reach of any code written with its tests, so they are at 100. Branches is not: server guards, React version forks, and the geometry paths this suite cannot reach all leave a branch that no test can take. The alternative to a number below 100 is a `/* v8 ignore */` on each of them, which hides the exception inside the file instead of showing it in the report.

## The gate

```
pnpm check       # typecheck, lint, format, tests, and the build
```

The chain is `pnpm typecheck`, `pnpm format:check`, `pnpm test`, `pnpm build`, and `pnpm --filter website check`, and each is runnable on its own. `format:check` reports without changing anything; use `pnpm format` to apply what is auto-fixable.

The last step builds the website, asserts that every page rendered, and typechecks it. The build prerenders every page to finished HTML through the library's real React server rendering, but a page whose render fails still exits the build with 0, so `website/scripts/assert-rendered.mts` scans the emitted HTML for React's failed-boundary marker and fails the step. It is in the gate because the website consumes the library through `workspace:*`, so it is the only thing here that proves the package works from a consumer's side rather than from inside, the server path included. That makes it slower than the rest of the chain combined, which is the price of the guarantee.

Linting and formatting are both Biome, configured in `biome.jsonc`. The extension is load-bearing: a comment in a `biome.json` is not reported as an error, but it silently voids every exclusion in `files.includes`, putting every excluded directory back in scope. `pnpm format:check` runs `biome check`, which covers the formatter, the linter and the import-order assist in one pass, which is why the gate has no separate lint step: `pnpm lint` is a strict subset of it and exists only for running the linter alone. Both check-only scripts pass `--error-on-warnings`, so a warning fails them rather than scrolling past.

`pnpm build` is part of the gate because it also validates the published shape: tsdown runs `publint` and `arethetypeswrong` over the packed tarball, and both fail the build on a real fault. Neither follows imports into dependencies, so neither can prove the package actually loads.

`pnpm dev` builds the library in watch mode alongside the site in `website/`, the only workspace package, which consumes the library through `workspace:*` exactly as a published consumer would. It replaced an earlier `example/` app.

## Writing style

Applies to code, comments, commit messages, pull requests, documentation, and issue replies.

- No em-dashes. Use commas, parentheses, colons, or separate sentences.
- Plain, direct language and short sentences. Avoid filler words such as "seamless", "robust", and "leverage", and avoid the "not just X, but Y" construction.
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/).
- No tool attribution anywhere in the history. No `Co-Authored-By` trailer and no "generated with" line, in commits or pull request descriptions.

## Working on this repository

Read the surrounding code before changing it, and match its idiom rather than importing another project's style.

Plan non-trivial work before implementing it, and confirm the approach before writing code that is expensive to undo.

Keep a change focused on one thing. Formatting sweeps, renames, and behavior changes belong in separate commits so the diff stays reviewable.
