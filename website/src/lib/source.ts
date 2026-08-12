import { loader } from "fumadocs-core/source";
import { defineDocs } from "fumadocs-mdx/macro";
import {
  Blocks,
  BookOpen,
  Clapperboard,
  MousePointerClick,
  Play,
  Rocket,
  Signpost,
  SlidersHorizontal,
} from "lucide-react";
import { createElement } from "react";
import { docsRoute } from "./shared";

export const docs = defineDocs({
  dir: "content/docs",
  docs: {
    async: true,
  },
});

/*
 * The icons a page or a meta.json can name in its `icon` field. Resolving
 * names from this map keeps the bundle to the icons the docs actually use;
 * fumadocs' lucideIconsPlugin resolves the same names by importing every icon
 * lucide ships. A name missing here fails the prerender, so a typo turns the
 * gate red instead of shipping a page without its icon.
 */
const icons = {
  Blocks,
  BookOpen,
  Clapperboard,
  MousePointerClick,
  Play,
  Rocket,
  Signpost,
  SlidersHorizontal,
};

const isIconName = (name: string): name is keyof typeof icons => name in icons;

export const source = loader({
  source: docs.toFumadocsSource(),
  baseUrl: docsRoute,
  icon(name) {
    if (name === undefined) return;
    if (!isIconName(name)) throw new Error(`unknown page icon "${name}"`);
    return createElement(icons[name]);
  },
});
