"use client";

import type { LottiePlayer } from "lottie-web";

/** What {@link configureLottie} can be told. */
export interface ConfigureLottieOptions {
  /**
   * The base of every element ID the engine mints, so that two copies of the
   * library on one page can be told apart. Each engine build appends its own
   * suffix (`-lottie`, `-lottie_svg`, `-lottie_light`), so the three builds
   * never share an ID with each other. `lottie-react` unless set.
   */
  idPrefix?: string;
  /**
   * How finely curves are drawn: `low`, `medium`, `high`, or a number of
   * segments above 1. Left alone, the engine draws with 150, between `medium`
   * (50) and `high` (200); the named levels trade smoothness for work. Set it
   * once, before animations load: the engine reads it whenever it builds a
   * curve, so a change reaches every animation on the engine, running ones
   * included.
   */
  quality?: "low" | "medium" | "high" | number;
}

/**
 * The engine builds by the name lottie-web gives each, which is the suffix a
 * build's element IDs carry.
 */
export const LottieEngineName = {
  full: "lottie",
  svg: "lottie_svg",
  light: "lottie_light",
} as const;
export type LottieEngineName =
  (typeof LottieEngineName)[keyof typeof LottieEngineName];

/**
 * One engine build: lottie-web's player object paired with the build's name.
 * Each build declares its pair once, next to the hook that loads it, so the
 * two cannot drift apart.
 */
export interface LottieEngine {
  readonly player: LottiePlayer;
  readonly name: LottieEngineName;
}

let idPrefix = "lottie-react";
let quality: ConfigureLottieOptions["quality"];

/*
 * Both settings are global to a loaded copy of the engine, and there are three
 * such copies, one per build, none of which knows about the others. So the
 * settings live here, apart from every engine, and reach each engine two ways:
 * at once, for every engine that has already loaded something, and again right
 * before every load, which also puts them back should anything else on the
 * page have changed them. Nothing here touches an engine at module scope, so
 * importing any pair still costs only that pair, and a page that never loads
 * an animation never reaches one.
 */
const engines = new Map<LottiePlayer, LottieEngineName>();

function apply(player: LottiePlayer, name: LottieEngineName): void {
  player.setIDPrefix(`${idPrefix}-${name}`);
  if (quality !== undefined) {
    player.setQuality(quality);
  }
}

/**
 * Sets what is global to the engine rather than to one animation: the prefix
 * of the element IDs it mints, and how finely it draws curves.
 *
 * ```ts
 * configureLottie({ idPrefix: "crm", quality: "low" });
 * ```
 *
 * Set it once, at startup, before animations load. It takes effect at once on
 * every engine that has loaded an animation, and on the others when they first
 * do, and it reaches what is already on screen: element IDs for everything the
 * engines build from then on, the drawing quality of every animation on them.
 * A field left out keeps its value.
 */
export function configureLottie(options: ConfigureLottieOptions): void {
  if (options.idPrefix !== undefined) {
    idPrefix = options.idPrefix;
  }
  if (options.quality !== undefined) {
    quality = options.quality;
  }
  for (const [player, name] of engines) {
    apply(player, name);
  }
}

/**
 * Brings one engine up to the current settings and remembers it for later
 * calls to {@link configureLottie}. The load path calls it right before
 * `loadAnimation`.
 */
export function applyEngineSettings(engine: LottieEngine): void {
  engines.set(engine.player, engine.name);
  apply(engine.player, engine.name);
}
