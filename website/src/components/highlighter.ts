import { createBundledHighlighter } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

/*
 * The default DynamicCodeBlock wrapper imports the full shiki bundle, whose
 * module graph carries every grammar and the wasm engine, and wasm does not
 * survive the SSR bundle. This is the same factory the full bundle is built
 * from, carrying one grammar and the JavaScript engine instead. It must be a
 * bundle rather than a bare core highlighter, because fumadocs' hook loads
 * the language by name, which only a bundle's registry can resolve.
 */
const createHighlighter = createBundledHighlighter<string, string>({
  langs: { tsx: () => import("@shikijs/langs/tsx") },
  themes: {
    "github-light": () => import("@shikijs/themes/github-light"),
    "github-dark": () => import("@shikijs/themes/github-dark"),
  },
  engine: () => createJavaScriptRegexEngine(),
});

let highlighter: ReturnType<typeof createHighlighter> | undefined;

/** The site's one highlighter, shared by everything that displays code. */
export function getHighlighter() {
  highlighter ??= createHighlighter({ langs: [], themes: [] });
  return highlighter;
}

/** The theme pair every code display passes to DynamicCodeBlock. */
export const codeThemes = {
  themes: { light: "github-light", dark: "github-dark" },
};
