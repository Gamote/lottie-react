import { spawnSync } from "node:child_process";
import {
  copyFile,
  mkdir,
  mkdtemp,
  readFile,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/*
 * Runs the test suite against React 18, the other half of the peer range.
 * What git considers source is copied whole, so nothing here can disturb the
 * checkout; React resolves to the newest 18; and the suite runs without
 * coverage, because the coverage contract belongs to the React 19 gate and
 * the tests that skip themselves on 18 (see src/test/reactMajor.ts) would
 * sink it here.
 */

const root = path.join(import.meta.dirname, "..");
const dest = path.join(
  await mkdtemp(path.join(tmpdir(), "lottie-react-18-")),
  "repo",
);

function run(command: string, args: readonly string[], cwd: string): void {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

/* A tracked file deleted from disk is still listed, with nothing to copy. */
function isMissingFile(cause: unknown): boolean {
  return cause instanceof Error && "code" in cause && cause.code === "ENOENT";
}

/* Tracked plus untracked-but-not-ignored: the copy is what git would keep,
   so .gitignore and .git/info/exclude decide, never a list kept here. */
const listing = spawnSync(
  "git",
  ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
  { cwd: root, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
);
if (listing.status !== 0) {
  process.exit(listing.status ?? 1);
}
for (const file of listing.stdout.split("\0")) {
  if (file === "") {
    continue;
  }
  const target = path.join(dest, file);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    await copyFile(path.join(root, file), target);
  } catch (cause) {
    if (!isMissingFile(cause)) {
      throw cause;
    }
  }
}

const manifestPath = path.join(dest, "package.json");
const manifest: { devDependencies: Record<string, string> } = JSON.parse(
  await readFile(manifestPath, "utf8"),
);
Object.assign(manifest.devDependencies, { react: "18", "react-dom": "18" });
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

run("pnpm", ["install", "--no-frozen-lockfile"], dest);
run(
  "node",
  [
    "-e",
    "const v = require('react/package.json').version;" +
      "if (!v.startsWith('18.')) { throw new Error('the lane resolved react ' + v); }" +
      "console.log('running against react', v);",
  ],
  dest,
);
run("pnpm", ["exec", "vitest", "run"], dest);
