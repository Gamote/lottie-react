import { DynamicCodeBlock } from "fumadocs-ui/components/dynamic-codeblock.core";
import type { ComponentType } from "react";
import { codeThemes, getHighlighter } from "@/components/highlighter";

const modules = import.meta.glob<Record<string, ComponentType>>(
  "./examples/**/*.tsx",
  { eager: true },
);
const sources = import.meta.glob<string>("./examples/**/*.tsx", {
  eager: true,
  query: "?raw",
  import: "default",
});

export interface ExampleProps {
  /** The example's path under `examples/`, like `basics/first-animation`. */
  name: string;
  /**
   * Presents the demo inside a scrollable stage with a cue to scroll, for
   * behaviours the reader has to scroll to see.
   */
  scroll?: boolean;
}

/**
 * One example, rendered live and displayed as code from the same file, so the
 * code shown is the code that ran.
 */
export function Example({ name, scroll = false }: ExampleProps) {
  const path = `./examples/${name}.tsx`;
  const source = sources[path];
  const component = modules[path]?.[componentName(name)];
  if (!source || !component) throw new Error(`unknown example: ${name}`);
  const Rendered = component;

  const stage = scroll
    ? "example-stage example-scroll"
    : "example-stage flex flex-col items-center justify-center gap-3 p-6";

  return (
    <div className="not-prose rounded-lg border">
      <div className={stage}>
        {scroll && <p className="scroll-cue">Scroll inside this box</p>}
        <Rendered />
      </div>
      <DynamicCodeBlock
        lang="tsx"
        code={source}
        highlighter={getHighlighter}
        options={codeThemes}
      />
    </div>
  );
}

/* The convention: an example file exports the function named after it in
   PascalCase, so the name shown in the displayed code names the behaviour. */
function componentName(name: string): string {
  const base = name.split("/").at(-1) ?? name;
  return base
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}
