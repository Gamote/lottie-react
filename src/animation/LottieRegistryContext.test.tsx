import { act, cleanup, render } from "@testing-library/react";
import lottie from "lottie-web";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import {
  createLottieRegistry,
  LottieRegistryContext,
  type LottieRegistryStore,
} from "./LottieRegistryContext.js";
import { LottieState } from "./types.js";
import {
  type UseLottieOptions,
  useLottieAnimation,
} from "./useLottieAnimation.js";

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

function Probe(props: UseLottieOptions) {
  const instance = useLottieAnimation(lottie, props);
  return <div ref={instance.setDisplayRef} />;
}

/** Counts its own renders, so registration can be shown not to cause any. */
function Wrapper({
  store,
  renders,
  children,
}: {
  store: LottieRegistryStore;
  renders: number[];
  children: ReactNode;
}) {
  renders.push(renders.length + 1);
  return (
    <LottieRegistryContext.Provider value={store}>
      {children}
    </LottieRegistryContext.Provider>
  );
}

it("an animation announces itself to the registry around it", () => {
  const store = createLottieRegistry();
  render(
    <LottieRegistryContext.Provider value={store}>
      <Probe src={ANIMATION} />
    </LottieRegistryContext.Provider>,
  );

  expect(store.boxes()).toHaveLength(1);
  expect(store.boxes()[0]?.current.state).toBe(LottieState.loading);
});

it("has registered by the time the wrapper's own effect first reads", () => {
  const store = createLottieRegistry();
  const seen: number[] = [];

  function ReadingWrapper({ children }: { children: ReactNode }) {
    useEffect(() => {
      seen.push(store.boxes().length);
    }, []);
    return (
      <LottieRegistryContext.Provider value={store}>
        {children}
      </LottieRegistryContext.Provider>
    );
  }

  render(
    <ReadingWrapper>
      <Probe src={ANIMATION} />
      <Probe src={ANIMATION} />
    </ReadingWrapper>,
  );

  expect(seen).toEqual([2]);
});

it("a late animation reaches the store without re-rendering the wrapper", () => {
  const store = createLottieRegistry();
  const renders: number[] = [];
  let mountLate: () => void = () => undefined;

  function LateSlot() {
    const [on, setOn] = useState(false);
    mountLate = () => {
      setOn(true);
    };
    return on ? <Probe src={ANIMATION} /> : null;
  }

  render(
    <Wrapper store={store} renders={renders}>
      <Probe src={ANIMATION} />
      <LateSlot />
    </Wrapper>,
  );
  expect(store.boxes()).toHaveLength(1);
  expect(renders).toHaveLength(1);

  act(() => {
    mountLate();
  });

  expect(store.boxes()).toHaveLength(2);
  expect(renders).toHaveLength(1);
});

it("a value change bumps the store without re-registering", () => {
  const store = createLottieRegistry();
  const register = vi.spyOn(store, "register");
  const listener = vi.fn();
  store.subscribe(listener);

  const view = render(
    <LottieRegistryContext.Provider value={store}>
      <Probe src={ANIMATION} speed={1} />
    </LottieRegistryContext.Provider>,
  );
  const registrations = register.mock.calls.length;
  listener.mockClear();

  view.rerender(
    <LottieRegistryContext.Provider value={store}>
      <Probe src={ANIMATION} speed={2} />
    </LottieRegistryContext.Provider>,
  );

  expect(register.mock.calls.length).toBe(registrations);
  expect(listener).toHaveBeenCalled();
  expect(store.boxes()[0]?.current.speed).toBe(2);
});

it("an unmounting animation takes itself back out", () => {
  const store = createLottieRegistry();
  const view = render(
    <LottieRegistryContext.Provider value={store}>
      <Probe src={ANIMATION} />
    </LottieRegistryContext.Provider>,
  );
  expect(store.boxes()).toHaveLength(1);

  view.unmount();

  expect(store.boxes()).toHaveLength(0);
});

it("ends consistent under StrictMode's doubled effects", () => {
  const store = createLottieRegistry();
  render(
    <LottieRegistryContext.Provider value={store}>
      <Probe src={ANIMATION} />
      <Probe src={ANIMATION} />
    </LottieRegistryContext.Provider>,
    { reactStrictMode: true },
  );

  expect(store.boxes()).toHaveLength(2);
});

it("a listener that unsubscribes hears nothing more", () => {
  const store = createLottieRegistry();
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  unsubscribe();

  store.bump();

  expect(listener).not.toHaveBeenCalled();
});
