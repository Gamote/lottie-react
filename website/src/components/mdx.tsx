import defaultMdxComponents from "fumadocs-ui/mdx";
import {
  Lottie,
  LottieControls,
  LottieDisplay,
  LottieError,
  LottieInteractions,
  LottieLight,
  LottieLoading,
  LottieSvg,
} from "lottie-react";
import type { MDXComponents } from "mdx/types";
import { Example } from "@/components/example";
import { PageScrub } from "@/components/page-scrub";
import { PropsPlayground } from "@/components/props-playground";

export function getMDXComponents(components?: MDXComponents) {
  return {
    ...defaultMdxComponents,
    /*
     * The library itself, so a page writes an example exactly as a reader would
     * write it rather than through something of ours that could differ.
     */
    Lottie,
    LottieControls,
    LottieDisplay,
    LottieError,
    LottieInteractions,
    LottieLight,
    LottieLoading,
    LottieSvg,
    Example,
    PageScrub,
    PropsPlayground,
    ...components,
  } satisfies MDXComponents;
}

export const useMDXComponents = getMDXComponents;

declare global {
  type MDXProvidedComponents = ReturnType<typeof getMDXComponents>;
}
