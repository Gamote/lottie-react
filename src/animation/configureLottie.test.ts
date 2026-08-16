import type { LottiePlayer } from "lottie-web";
import { beforeEach, expect, it, vi } from "vitest";
import type { LottieEngine } from "./configureLottie.js";

/* The settings are module state, so every test starts from a fresh module. */
beforeEach(() => {
  vi.resetModules();
});

async function load() {
  return import("./configureLottie.js");
}

function fakeEngine(name: LottieEngine["name"]) {
  const player = {
    setIDPrefix: vi.fn(),
    setQuality: vi.fn(),
  };
  return {
    engine: { player: player as unknown as LottiePlayer, name },
    player,
  };
}

it("prefixes with the library's base and the engine's own suffix by default", async () => {
  const { applyEngineSettings, LottieEngineName } = await load();
  const light = fakeEngine(LottieEngineName.light);

  applyEngineSettings(light.engine);

  expect(light.player.setIDPrefix).toHaveBeenCalledWith(
    "lottie-react-lottie_light",
  );
  expect(light.player.setQuality).not.toHaveBeenCalled();
});

it("reaches every engine that has loaded at once, and the rest at their next load", async () => {
  const { applyEngineSettings, configureLottie, LottieEngineName } =
    await load();
  const full = fakeEngine(LottieEngineName.full);
  const svg = fakeEngine(LottieEngineName.svg);
  applyEngineSettings(full.engine);

  configureLottie({ idPrefix: "crm" });

  expect(full.player.setIDPrefix).toHaveBeenLastCalledWith("crm-lottie");
  expect(svg.player.setIDPrefix).not.toHaveBeenCalled();
  applyEngineSettings(svg.engine);
  expect(svg.player.setIDPrefix).toHaveBeenCalledWith("crm-lottie_svg");
});

it("puts the settings back before every load", async () => {
  const { applyEngineSettings, LottieEngineName } = await load();
  const full = fakeEngine(LottieEngineName.full);

  applyEngineSettings(full.engine);
  applyEngineSettings(full.engine);

  expect(full.player.setIDPrefix).toHaveBeenCalledTimes(2);
});

it("passes the quality through only once it is set", async () => {
  const { applyEngineSettings, configureLottie, LottieEngineName } =
    await load();
  const full = fakeEngine(LottieEngineName.full);

  applyEngineSettings(full.engine);
  expect(full.player.setQuality).not.toHaveBeenCalled();

  configureLottie({ quality: "low" });
  expect(full.player.setQuality).toHaveBeenCalledWith("low");

  configureLottie({ quality: 120 });
  expect(full.player.setQuality).toHaveBeenLastCalledWith(120);
});

it("keeps a field that a later call leaves out", async () => {
  const { applyEngineSettings, configureLottie, LottieEngineName } =
    await load();
  const full = fakeEngine(LottieEngineName.full);

  configureLottie({ idPrefix: "crm", quality: "high" });
  configureLottie({ quality: "medium" });
  applyEngineSettings(full.engine);

  expect(full.player.setIDPrefix).toHaveBeenCalledWith("crm-lottie");
  expect(full.player.setQuality).toHaveBeenCalledWith("medium");
});
