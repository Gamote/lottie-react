# website

The site for lottie-react, built with [Fumadocs](https://fumadocs.dev) on TanStack Start.

It consumes the library through the workspace, so it is a real consumer rather than a fixture.

```bash
pnpm dev     # from the repository root: library watch build plus this site
pnpm build   # static output in .output/public
pnpm start   # serve that output, which is what a static host does
```

Content lives in `content/docs` as MDX. Components used inside MDX are registered in
`src/components/mdx.tsx` rather than imported per file, because the MDX compiles through a
macro-scoped virtual module that cannot resolve import paths.
