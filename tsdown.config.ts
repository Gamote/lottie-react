import { defineConfig } from "tsdown";

/**
 * Runtime and peer dependencies stay external, so lottie-web is never inlined.
 * The platform is neutral because the output has to load both in a browser and
 * on a server.
 */
export default defineConfig({
  entry: ["./src/index.ts"],
  format: ["esm", "cjs"],
  platform: "neutral",
  dts: true,
  outDir: "build",
  /*
   * One output file per source file. This is what gives `sideEffects: false`
   * something to act on: the field lets a consumer's bundler drop a file whose
   * exports go unused, and a single merged file is always in use.
   *
   * `exports` still names one entry, so none of these files is reachable from
   * outside and the layout stays an implementation detail.
   */
  unbundle: true,
  // The barrel exports named symbols only, and this is what makes the CJS
  // bundle say so rather than guess: without it, a single export would be
  // emitted as `module.exports`, which a consumer would reach through
  // `.default`.
  outputOptions: { exports: "named" },
  // Validate the packed tarball. `error` matters: the default only warns, which
  // would let a broken package build clean. Neither check follows imports into
  // dependencies, so one that resolves but throws on load still passes.
  publint: true,
  attw: { level: "error" },
});
