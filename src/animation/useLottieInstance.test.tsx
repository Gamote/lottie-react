import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LottieInstanceContext } from "./LottieInstanceContext.js";
import type { LottieInstance } from "./types.js";
import { useLottie } from "./useLottie.js";
import { useLottieInstance } from "./useLottieInstance.js";

/*
 * Real animations rather than stand-ins, because what this hook decides is
 * which of two instances comes back, and a stand-in would only prove that the
 * stand-in came back. Nothing here attaches a display, so nothing ever loads.
 */
const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 100,
  h: 100,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("hands back the animation it was given", () => {
  let given: LottieInstance | undefined;
  let resolved: LottieInstance | undefined;

  function Child({ lottie }: { lottie: LottieInstance }) {
    resolved = useLottieInstance(lottie);
    return null;
  }

  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    given = lottie;
    return <Child lottie={lottie} />;
  }

  render(<Probe />);

  expect(resolved).toBe(given);
});

it("falls back to the animation its <Lottie> published", () => {
  let published: LottieInstance | undefined;
  let resolved: LottieInstance | undefined;

  function Child() {
    resolved = useLottieInstance();
    return null;
  }

  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    published = lottie;
    return (
      <LottieInstanceContext.Provider value={lottie}>
        <div>
          <Child />
        </div>
      </LottieInstanceContext.Provider>
    );
  }

  render(<Probe />);

  expect(resolved).toBe(published);
});

it("prefers what it was given to what the context published", () => {
  let published: LottieInstance | undefined;
  let given: LottieInstance | undefined;
  let resolved: LottieInstance | undefined;

  function Child({ lottie }: { lottie: LottieInstance }) {
    resolved = useLottieInstance(lottie);
    return null;
  }

  function Probe() {
    const surrounding = useLottie({ src: ANIMATION });
    const own = useLottie({ src: ANIMATION });
    published = surrounding;
    given = own;
    return (
      <LottieInstanceContext.Provider value={surrounding}>
        <Child lottie={own} />
      </LottieInstanceContext.Provider>
    );
  }

  render(<Probe />);

  expect(resolved).toBe(given);
  expect(resolved).not.toBe(published);
});

it("throws with both fixes named when it can reach neither", () => {
  function Child() {
    useLottieInstance();
    return null;
  }

  /* React reports the thrown error itself, which is noise rather than a fault. */
  vi.spyOn(console, "error").mockImplementation(() => undefined);

  expect(() => render(<Child />)).toThrow(/inside <Lottie>.*lottie=/s);
});
