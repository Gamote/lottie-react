import { spawnSync } from "node:child_process";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

/*
 * Proves the packed package installs and loads, which the shape checkers
 * cannot: publint and arethetypeswrong read the tarball without following
 * imports, so the fault class they miss is a package that resolves and then
 * throws on load. The two loads below are the two lanes nothing else runs,
 * `require()` and native ESM resolution with no bundler in the middle; the
 * gate's website step already loads the bundler lane daily.
 */

const root = path.join(import.meta.dirname, "..");
const scratch = await mkdtemp(path.join(tmpdir(), "lottie-react-package-"));

function run(command: string, args: readonly string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("pnpm", ["build"], root);

/* What the package exports is read from the build itself, so the expectation
   cannot drift; loading it here is also a native-ESM load of the unpacked
   entry. Only value exports exist at runtime; the type-only names erase. */
const built: Record<string, unknown> = await import(
  pathToFileURL(path.join(root, "build", "index.js")).href
);
const reference = Object.keys(built).sort();
if (reference.length === 0) {
  throw new Error("the built entry exports nothing");
}

run("pnpm", ["pack", "--pack-destination", scratch], root);
const manifest: { name: string; version: string } = JSON.parse(
  await readFile(path.join(root, "package.json"), "utf8"),
);
const tarball = path.join(scratch, `${manifest.name}-${manifest.version}.tgz`);

await writeFile(
  path.join(scratch, "package.json"),
  `${JSON.stringify({ name: "smoke", private: true }, null, 2)}\n`,
);
run(
  "npm",
  ["install", "--no-audit", "--no-fund", tarball, "react", "react-dom"],
  scratch,
);

const assertion = (lane: string) => `
const expected = ${JSON.stringify(reference)};
const missing = expected.filter((name) => !(name in m));
if (missing.length > 0) {
  throw new Error("the ${lane} lane lost: " + missing.join(", "));
}
console.log("${lane} lane: all", expected.length, "exports present");
`;

run(
  "node",
  [
    "--input-type=module",
    "-e",
    `const m = await import("lottie-react");${assertion("import")}`,
  ],
  scratch,
);
run(
  "node",
  ["-e", `const m = require("lottie-react");${assertion("require")}`],
  scratch,
);

console.log("check:package: both lanes load");
