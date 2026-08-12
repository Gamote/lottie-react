import {
  copyFile,
  mkdir,
  readdir,
  readFile,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { siteUrl } from "../src/lib/shared.ts";

/*
 * Completes the built artifact for static hosting, after the prerender:
 *
 * - 404.html: GitHub Pages serves this file for unknown paths. The prerender
 *   emits the not-found route at 404/index.html, so it is copied into place.
 * - One .md twin per docs page, at the page's own URL plus ".md": the page's
 *   source turned back into plain markdown for machine readers, with each
 *   embedded example replaced by the code it displays.
 * - llms.txt: the index of those twins.
 *
 * The twin conversion handles exactly the constructs our pages use. It is a
 * convention, not an MDX parser: a new construct in a page means a new case
 * here, and the render guard only proves the files exist.
 */

const root = path.join(import.meta.dirname, "..");
const out = path.join(root, ".output/public");
const content = path.join(root, "content/docs");
const examples = path.join(root, "src/components/examples");

await copyFile(path.join(out, "404/index.html"), path.join(out, "404.html"));

const files = (await readdir(content, { recursive: true })).filter((file) =>
  file.endsWith(".mdx"),
);

const pages = [];
for (const file of files) {
  const source = await readFile(path.join(content, file), "utf8");
  const { title, description, body } = split(source);
  const slug = file
    .replace(/\(v3\)\//, "")
    .replace(/\.mdx$/, "")
    .replace(/\/index$/, "")
    .replace(/^index$/, "");
  const url = slug === "" ? "/docs" : `/docs/${slug}`;
  const markdown = `# ${title}\n\n${description}\n\n${await convert(body)}`;
  const twin = path.join(out, `${url}.md`);
  await mkdir(path.dirname(twin), { recursive: true });
  await writeFile(twin, markdown);
  pages.push({ title, description, url });
}

pages.sort((a, b) => a.url.localeCompare(b.url));
const index = [
  "# lottie-react",
  "",
  "> Lottie animations in React: one component for the easy path, the whole engine when you need control.",
  "",
  "## Docs",
  "",
  ...pages.map(
    (page) =>
      `- [${page.title}](${siteUrl}${page.url}.md): ${page.description}`,
  ),
  "",
].join("\n");
await writeFile(path.join(out, "llms.txt"), index);

console.log(`prepare-pages: 404.html, llms.txt, ${pages.length} .md twins`);

function split(source: string) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const front = match?.[1] ?? "";
  const field = (name: string) =>
    front
      .match(new RegExp(`^${name}:\\s*(.*)$`, "m"))?.[1]
      .trim()
      .replace(/^"(.*)"$/, "$1") ?? "";
  return {
    title: field("title"),
    description: field("description"),
    body: source.slice(match?.[0].length ?? 0),
  };
}

async function convert(body: string) {
  let text = body.replaceAll(/\{\/\*[\s\S]*?\*\/\}\n?/g, "");
  const embeds = [...text.matchAll(/<Example name="([^"]+)" \/>/g)];
  for (const embed of embeds) {
    const code = await readFile(path.join(examples, `${embed[1]}.tsx`), "utf8");
    text = text.replace(embed[0], `\`\`\`tsx\n${code.trimEnd()}\n\`\`\``);
  }
  text = text.replaceAll(
    /<Callout(?: type="[^"]*")? title="([^"]+)">\n([\s\S]*?)\n<\/Callout>/g,
    (_, title, inner) =>
      `> **${title}**\n${inner
        .split("\n")
        .map((line: string) => `> ${line.trim()}`)
        .join("\n")}`,
  );
  text = text.replaceAll(/<PropsPlayground \/>|<PageScrub \/>/g, "");
  return text.replaceAll(/\n{3,}/g, "\n\n").trim();
}
