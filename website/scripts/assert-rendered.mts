import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";

/*
 * A page whose server render fails still exits the build with 0: the prerender
 * request itself succeeds, and React stamps the failed Suspense boundary with
 * <!--$!--> in the emitted HTML. Scanning for that marker is what turns a
 * broken page into a red build.
 */
const root = path.join(import.meta.dirname, "../.output/public");
const all = await readdir(root, { recursive: true });
const files = all.filter((file) => file.endsWith(".html"));
if (files.length === 0) {
  console.error(`assert-rendered: no HTML files under ${root}`);
  process.exit(1);
}
/*
 * The v2 pages are reachable only through the version switcher, which exists
 * only in the browser, so no crawled link proves them: a build that loses
 * them still exits 0 and every remaining page renders clean. The rest are
 * files nothing crawls either: the page GitHub Pages serves for unknown
 * paths, and the machine-reader files the prepare script writes.
 */
const required = [
  "docs/v2/index.html",
  "docs/v2/api/index.html",
  "404.html",
  "llms.txt",
  "docs.md",
];
const absent = required.filter((file) => !all.includes(file));
if (absent.length > 0) {
  console.error(
    `assert-rendered: pages missing from the build: ${absent.join(", ")}`,
  );
  process.exit(1);
}
const broken = [];
for (const file of files) {
  const html = await readFile(path.join(root, file), "utf8");
  if (html.includes("<!--$!-->")) broken.push(file);
}
if (broken.length > 0) {
  console.error("assert-rendered: failed Suspense boundary in:");
  for (const file of broken) console.error(`  ${file}`);
  process.exit(1);
}
console.log(`assert-rendered: ${files.length} pages rendered clean`);
