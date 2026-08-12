import { act, cleanup, render } from "@testing-library/react";
import lottie from "lottie-web";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import type { LottieInstance } from "../animation/types.js";
import { useLottieAnimation } from "../animation/useLottieAnimation.js";
import type { LottieInteractionContext } from "./types.js";
import { useLottieInteractions } from "./useLottieInteractions.js";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 60,
  w: 100,
  h: 100,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  vi.restoreAllMocks();
});

function spyInteraction(options: unknown = {}) {
  const contexts: LottieInteractionContext[] = [];
  const detach = vi.fn();
  const attach = vi.fn((context: LottieInteractionContext) => {
    contexts.push(context);
    return detach;
  });
  return { interaction: { attach, options }, attach, detach, contexts };
}

it("attaches once to the animation it was handed, inline array and all", () => {
  const spy = spyInteraction();
  let latest: LottieInstance | undefined;

  function Fixture({ amount }: { amount: number }) {
    const instance = useLottieAnimation(lottie, { src: ANIMATION });
    latest = instance;
    useLottieInteractions(instance, [
      { ...spy.interaction, options: { amount } },
    ]);
    return <div ref={instance.setDisplayRef} />;
  }

  const view = render(<Fixture amount={0.5} />);
  view.rerender(<Fixture amount={0.5} />);

  expect(spy.attach).toHaveBeenCalledTimes(1);
  expect(spy.contexts.at(-1)?.lottie).toBe(latest);

  view.rerender(<Fixture amount={0.9} />);
  expect(spy.attach).toHaveBeenCalledTimes(2);

  view.unmount();
  expect(spy.detach).toHaveBeenCalledTimes(2);
});
