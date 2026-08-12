import { act, cleanup, render } from "@testing-library/react";
import lottie from "lottie-web";
import { useState } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { LottieInstanceContext } from "../animation/LottieInstanceContext.js";
import type { LottieInstance } from "../animation/types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "../animation/useLottieAnimation.js";
import { LottieInteractions } from "./LottieInteractions.js";
import type { LottieInteractionContext } from "./types.js";

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

/** A real animation that reports its instance into the given bag. */
function AnimProbe({
  name,
  instances,
  ...options
}: {
  name: string;
  instances: Map<string, LottieInstance>;
} & Partial<UseLottieOptions>) {
  const instance = useLottieAnimation(lottie, { src: ANIMATION, ...options });
  instances.set(name, instance);
  return <div ref={instance.setDisplayRef} />;
}

/** A spy behaviour: counts attaches and cleanups, keeps every context seen. */
function spyInteraction(options: unknown = {}) {
  const contexts: LottieInteractionContext[] = [];
  const cleanup = vi.fn();
  const attach = vi.fn((context: LottieInteractionContext) => {
    contexts.push(context);
    return cleanup;
  });
  return {
    interaction: { attach, options },
    attach,
    cleanup,
    contexts,
    get context() {
      const last = contexts.at(-1);
      if (last === undefined) {
        throw new Error("never attached");
      }
      return last;
    },
  };
}

it("drives every animation rendered inside it", () => {
  const spy = spyInteraction();
  const instances = new Map<string, LottieInstance>();

  render(
    <LottieInteractions interactions={[spy.interaction]}>
      <AnimProbe name="a" instances={instances} />
      <section>
        <AnimProbe name="b" instances={instances} />
      </section>
    </LottieInteractions>,
  );

  expect(spy.attach).toHaveBeenCalledTimes(2);
  const driven = new Set(spy.contexts.map((context) => context.lottie));
  expect(driven).toEqual(new Set(instances.values()));
});

it("the lottie prop drives that animation, and children fall through", () => {
  const outer = spyInteraction();
  const inner = spyInteraction();
  const instances = new Map<string, LottieInstance>();
  let handed: LottieInstance | undefined;

  function Fixture() {
    const a = useLottieAnimation(lottie, { src: ANIMATION });
    handed = a;
    return (
      <LottieInteractions interactions={[outer.interaction]}>
        <LottieInteractions lottie={a} interactions={[inner.interaction]}>
          <AnimProbe name="b" instances={instances} />
        </LottieInteractions>
      </LottieInteractions>
    );
  }

  render(<Fixture />);

  expect(inner.attach).toHaveBeenCalledTimes(1);
  expect(inner.context.lottie).toBe(handed);
  expect(outer.attach).toHaveBeenCalledTimes(1);
  expect(outer.context.lottie).toBe(instances.get("b"));
});

it("is driven by the animation whose <Lottie> it sits inside", () => {
  const spy = spyInteraction();
  const instances = new Map<string, LottieInstance>();

  function Fixture() {
    const instance = useLottieAnimation(lottie, { src: ANIMATION });
    instances.set("host", instance);
    return (
      <LottieInstanceContext.Provider value={instance}>
        <LottieInteractions interactions={[spy.interaction]} />
      </LottieInstanceContext.Provider>
    );
  }

  render(<Fixture />);

  expect(spy.attach).toHaveBeenCalledTimes(1);
  expect(spy.context.lottie).toBe(instances.get("host"));
});

it("the nearest wrapper wins, and even an empty one isolates", () => {
  const outer = spyInteraction();
  const inner = spyInteraction();
  const instances = new Map<string, LottieInstance>();

  render(
    <LottieInteractions interactions={[outer.interaction]}>
      <LottieInteractions interactions={[inner.interaction]}>
        <AnimProbe name="a" instances={instances} />
      </LottieInteractions>
      <LottieInteractions interactions={[]}>
        <AnimProbe name="b" instances={instances} />
      </LottieInteractions>
    </LottieInteractions>,
  );

  expect(inner.attach).toHaveBeenCalledTimes(1);
  expect(inner.context.lottie).toBe(instances.get("a"));
  expect(outer.attach).not.toHaveBeenCalled();
});

it("a fresh but equal list re-arms nothing", () => {
  const spy = spyInteraction();
  const instances = new Map<string, LottieInstance>();

  function Fixture() {
    const [, force] = useState(0);
    return (
      <>
        <button type="button" onClick={() => force((n) => n + 1)} />
        <LottieInteractions
          interactions={[
            { ...spy.interaction, options: { range: [0.2, 0.45] } },
          ]}
        >
          <AnimProbe name="a" instances={instances} />
        </LottieInteractions>
      </>
    );
  }

  const view = render(<Fixture />);
  view.rerender(<Fixture />);

  expect(spy.attach).toHaveBeenCalledTimes(1);
  expect(spy.cleanup).not.toHaveBeenCalled();
});

it("a changed data option re-arms only its own slot, keeping its memory", () => {
  const counting = vi.fn((context: LottieInteractionContext) => {
    const seen = context.memory.count;
    context.memory.count = (typeof seen === "number" ? seen : 0) + 1;
    return undefined;
  });
  const other = spyInteraction();
  const instances = new Map<string, LottieInstance>();
  let memory: Record<string, unknown> | undefined;
  const remember = vi.fn((context: LottieInteractionContext) => {
    memory = context.memory;
    return counting(context);
  });

  function Fixture({ amount }: { amount: number }) {
    return (
      <LottieInteractions
        interactions={[
          { attach: remember, options: { amount } },
          other.interaction,
        ]}
      >
        <AnimProbe name="a" instances={instances} />
      </LottieInteractions>
    );
  }

  const view = render(<Fixture amount={0.2} />);
  view.rerender(<Fixture amount={0.8} />);

  expect(remember).toHaveBeenCalledTimes(2);
  expect(memory?.count).toBe(2);
  expect(other.attach).toHaveBeenCalledTimes(1);
  expect(other.cleanup).not.toHaveBeenCalled();
});

it("a callback identity swap re-arms nothing and reads fresh", () => {
  const spy = spyInteraction();
  const instances = new Map<string, LottieInstance>();

  function Fixture({ answer }: { answer: string }) {
    return (
      <LottieInteractions
        interactions={[{ ...spy.interaction, options: { call: () => answer } }]}
      >
        <AnimProbe name="a" instances={instances} />
      </LottieInteractions>
    );
  }

  const view = render(<Fixture answer="first" />);
  view.rerender(<Fixture answer="second" />);

  expect(spy.attach).toHaveBeenCalledTimes(1);
  const options = spy.context.options();
  if (
    typeof options !== "object" ||
    options === null ||
    !("call" in options) ||
    typeof options.call !== "function"
  ) {
    throw new Error("the callback went missing");
  }
  expect(options.call()).toBe("second");
});

it("a removed slot detaches; unmounting detaches the rest", () => {
  const first = spyInteraction({ which: 1 });
  const second = spyInteraction({ which: 2 });
  const instances = new Map<string, LottieInstance>();

  function Fixture({ both }: { both: boolean }) {
    return (
      <LottieInteractions
        interactions={
          both ? [first.interaction, second.interaction] : [first.interaction]
        }
      >
        <AnimProbe name="a" instances={instances} />
      </LottieInteractions>
    );
  }

  const view = render(<Fixture both={true} />);
  view.rerender(<Fixture both={false} />);

  expect(second.cleanup).toHaveBeenCalledTimes(1);
  expect(first.cleanup).not.toHaveBeenCalled();

  view.unmount();
  expect(first.cleanup).toHaveBeenCalledTimes(1);
});

it("a late animation is armed when it arrives, none before", () => {
  const spy = spyInteraction();
  const instances = new Map<string, LottieInstance>();
  let mountLate: () => void = () => undefined;

  function LateSlot() {
    const [on, setOn] = useState(false);
    mountLate = () => {
      setOn(true);
    };
    return on ? <AnimProbe name="late" instances={instances} /> : null;
  }

  render(
    <LottieInteractions interactions={[spy.interaction]}>
      <p>nothing yet</p>
      <LateSlot />
    </LottieInteractions>,
  );
  expect(spy.attach).not.toHaveBeenCalled();

  act(() => {
    mountLate();
  });

  expect(spy.attach).toHaveBeenCalledTimes(1);
  expect(spy.context.lottie).toBe(instances.get("late"));
});

it("hears about an animation's values moving through onChange", () => {
  const heard = vi.fn();
  const listening = vi.fn((context: LottieInteractionContext) => {
    return context.onChange(heard);
  });
  const instances = new Map<string, LottieInstance>();

  function Fixture({ speed }: { speed: number }) {
    return (
      <LottieInteractions interactions={[{ attach: listening, options: {} }]}>
        <AnimProbe name="a" instances={instances} speed={speed} />
      </LottieInteractions>
    );
  }

  const view = render(<Fixture speed={1} />);
  heard.mockClear();

  view.rerender(<Fixture speed={2} />);

  expect(heard).toHaveBeenCalled();
  expect(instances.get("a")?.speed).toBe(2);
});

it("ends consistent under StrictMode's doubled effects", () => {
  const spy = spyInteraction();
  const instances = new Map<string, LottieInstance>();

  render(
    <LottieInteractions interactions={[spy.interaction]}>
      <AnimProbe name="a" instances={instances} />
    </LottieInteractions>,
    { reactStrictMode: true },
  );

  expect(spy.attach.mock.calls.length - spy.cleanup.mock.calls.length).toBe(1);
});
