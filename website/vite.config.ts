import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { fumadocsMdx } from "fumadocs-mdx/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import { siteUrl } from "./src/lib/shared.ts";

export default defineConfig({
  plugins: [
    fumadocsMdx({
      globalOptions: {
        mdxOptions: {
          remarkNpmOptions: {
            persist: { id: "package-manager" },
          },
        },
      },
    }),
    tailwindcss(),
    tanstackStart({
      prerender: {
        enabled: true,
        crawlLinks: true,
      },
      sitemap: {
        host: siteUrl,
      },
      pages: [
        {
          path: "/",
        },
        {
          path: "/docs",
        },
        /* The v2 room is reached through the version switcher, which only
           exists in the browser, so no server-rendered link leads there and
           the crawler cannot discover it. */
        {
          path: "/docs/v2",
        },
        {
          path: "/api/search",
          sitemap: { exclude: true },
        },
        /* Nothing links the not-found page; it exists to become 404.html. */
        {
          path: "/404",
          sitemap: { exclude: true },
        },
      ],
    }),
    react(),
    // please see https://tanstack.com/start/latest/docs/framework/react/guide/hosting#nitro for guides on hosting
    nitro(),
  ],
  /* Two of our dependencies, the docs theme and the router's store, reach for
     `use-sync-external-store`, which is CommonJS. Left alone the dev server
     hands it to the browser unconverted, the named import fails and nothing
     hydrates. Pre-bundling converts it, and the specifier only resolves here
     because the package is also a direct dependency: that entry exists for
     this and nothing else, so dropping it as unused breaks `dev` while `build`
     stays green.
     https://github.com/TanStack/router/issues/5717
     https://github.com/TanStack/form/issues/1879
     Overriding `@tanstack/react-store`, suggested on the second of those, is
     not enough on its own: the theme imports the same module independently. */
  optimizeDeps: {
    include: ["use-sync-external-store/shim/with-selector"],
  },
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
});
