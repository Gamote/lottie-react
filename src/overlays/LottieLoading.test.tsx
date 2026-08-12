import { act, cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { Lottie } from "../animation/Lottie.js";
import {
  LottieDisplay,
  lottieDisplayClass,
} from "../animation/LottieDisplay.js";
import { stylePrecedence } from "../animation/stylePrecedence.js";
import { useLottie } from "../animation/useLottie.js";
import { reactMajor } from "../test/reactMajor.js";
import { LottieLoading, lottieLoadingClass } from "./LottieLoading.js";

const ANIMATION = {
  v: "5.5.7",
  fr: 30,
  ip: 0,
  op: 30,
  w: 123,
  h: 45,
  nm: "probe",
  ddd: 0,
  assets: [],
  layers: [],
};

/*
 * The clock is installed once for the whole file, because lottie-web's render
 * loop is global to the module and swapping the clock underneath it strands the
 * frame it had queued, leaving every animation loaded afterwards motionless.
 */
beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

afterEach(() => {
  /*
   * Unmount first so the animations are destroyed, then let the loop notice
   * that nothing is playing and park itself. The stylesheets React hoisted are
   * deliberately left alone, because it never inserts one twice and removing
   * one here would silently disarm every later assertion about them.
   */
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  vi.restoreAllMocks();
});

/** lottie-web announces a finished load on a macrotask rather than inline. */
function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

/** Adds a stylesheet the way a consumer's own CSS arrives: already in the head. */
function consumerStyles(css: string): void {
  const element = document.createElement("style");
  element.textContent = css;
  document.head.append(element);
}

function overlay(): HTMLElement {
  const element = document.querySelector<HTMLElement>(`.${lottieLoadingClass}`);
  if (element === null) {
    throw new Error("no overlay was rendered");
  }
  return element;
}

function isShowing(): boolean {
  return document.querySelector(`.${lottieLoadingClass}`) !== null;
}

it("covers the animation while it loads, and goes when it has loaded", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );

  expect(isShowing()).toBe(true);

  flushLoad();

  expect(isShowing()).toBe(false);
});

it("comes back when a new source starts loading", () => {
  const view = render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );
  flushLoad();
  expect(isShowing()).toBe(false);

  view.rerender(
    <Lottie src={{ ...ANIMATION, nm: "second" }}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );

  expect(isShowing()).toBe(true);
});

it("shows nothing at all once the animation is playing", () => {
  render(
    <Lottie src={ANIMATION} autoplay>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );
  flushLoad();

  expect(isShowing()).toBe(false);
  expect(document.querySelector(".lottie-spinner")).toBeNull();
});

it.skipIf(reactMajor < 19)(
  "names its stylesheet with its class, beside the two already there",
  () => {
    render(
      <Lottie src={ANIMATION}>
        <LottieDisplay />
        <LottieLoading />
      </Lottie>,
    );

    /*
     * The token set rather than the element count, because the two render paths
     * disagree about elements: the server merges same-precedence sheets into one
     * element carrying several tokens, and the client keeps them apart.
     */
    const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    expect(tokens).toContain(lottieLoadingClass);
    expect(tokens.filter((token) => token === lottieLoadingClass)).toHaveLength(
      1,
    );
    expect(tokens).toEqual(
      expect.arrayContaining([lottieDisplayClass, "lottie-root"]),
    );
    expect(
      document
        .querySelector(`style[data-href="${lottieLoadingClass}"]`)
        ?.getAttribute("data-precedence"),
    ).toBe(stylePrecedence);
  },
);

it.skipIf(reactMajor < 19)(
  "ships one stylesheet however many animations are loading",
  () => {
    render(
      <>
        <Lottie src={ANIMATION}>
          <LottieDisplay />
          <LottieLoading />
        </Lottie>
        <Lottie src={ANIMATION}>
          <LottieDisplay />
          <LottieLoading />
        </Lottie>
      </>,
    );

    const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    expect(tokens.filter((token) => token === lottieLoadingClass)).toHaveLength(
      1,
    );
  },
);

it("sits over the whole animation, with rules a consumer can see", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );

  /*
   * Computed style rather than geometry: this environment performs no layout,
   * so every box measures zero and only the declarations can be read back.
   */
  const computed = getComputedStyle(overlay());
  expect(computed.position).toBe("absolute");
  expect(computed.top).toBe("0px");
  expect(computed.right).toBe("0px");
  expect(computed.bottom).toBe("0px");
  expect(computed.left).toBe("0px");
  /* Without this the animation paints over it whenever it is rendered later. */
  expect(computed.zIndex).toBe("1");
  expect(computed.display).toBe("flex");
  expect(computed.alignItems).toBe("center");
  expect(computed.justifyContent).toBe("center");
});

it("turns its indicator, at a speed the reduced-motion file compares against", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );

  const spinner = overlay().firstElementChild;
  if (spinner === null) {
    throw new Error("no indicator was rendered");
  }
  const computed = getComputedStyle(spinner);
  /* Longhands, because this environment does not expand the shorthand. */
  expect(computed.animationName).toBe("lottie-spin");
  expect(computed.animationDuration).toBe("0.8s");
  expect(computed.animationIterationCount).toBe("infinite");
});

it("waits before appearing, so a fast load is never covered", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );

  const computed = getComputedStyle(overlay());
  expect(computed.animationDelay).toBe("400ms");
  expect(computed.animationName).toBe("lottie-loading-in");
  /*
   * The wait is a fade in rather than a hidden element revealed by one, so
   * anything switching the animation off shows the overlay instead of hiding it
   * for good. Nothing sets `opacity`, which is what makes that true.
   */
  expect(computed.animationFillMode).toBe("both");
});

it("takes the wait from a prop", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading showAfter={0} />
    </Lottie>,
  );

  expect(getComputedStyle(overlay()).animationDelay).toBe("0ms");
});

it("takes the wait from a class, which is the same knob", () => {
  consumerStyles(".probe-quick{--lottie-loading-delay:50ms}");

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading className="probe-quick" />
    </Lottie>,
  );

  expect(getComputedStyle(overlay()).animationDelay).toBe("50ms");
});

it("takes the wait from an ancestor, so an application can set it once", () => {
  consumerStyles(".probe-app{--lottie-loading-delay:900ms}");

  render(
    <div className="probe-app">
      <Lottie src={ANIMATION}>
        <LottieDisplay />
        <LottieLoading />
      </Lottie>
    </div>,
  );

  expect(getComputedStyle(overlay()).animationDelay).toBe("900ms");
});

it("lets a consumer replace the whole behaviour rather than its value", () => {
  consumerStyles(".probe-none{animation-name:none}");

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading className="probe-none" showAfter={400} />
    </Lottie>,
  );

  /*
   * The property itself beats the knob, and with no animation left the element
   * is visible rather than hidden, which is the point of writing the wait as a
   * fade in.
   */
  const computed = getComputedStyle(overlay());
  expect(computed.animationName).toBe("none");
  expect(computed.opacity).not.toBe("0");
});

it("lets a duration of their own beat the knob the prop writes", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading showAfter={0} style={{ animationDelay: "700ms" }} />
    </Lottie>,
  );

  /*
   * The property beats the custom property it reads, whichever order the two
   * were written in, so a consumer setting the real thing is never in a race
   * with the prop.
   */
  expect(getComputedStyle(overlay()).animationDelay).toBe("700ms");
});

it("keeps the rest of their style while writing its own", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading showAfter={0} style={{ opacity: 0.5 }} />
    </Lottie>,
  );

  /* The prop's value is added to their style rather than replacing it. */
  const computed = getComputedStyle(overlay());
  expect(computed.opacity).toBe("0.5");
  expect(computed.animationDelay).toBe("0ms");
});

it("shows an indicator of the consumer's instead, when given one", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading>
        <p>loading the hero</p>
      </LottieLoading>
    </Lottie>,
  );

  expect(overlay().textContent).toBe("loading the hero");
  expect(document.querySelector(".lottie-spinner")).toBeNull();
});

it("adds the consumer's class to its own rather than replacing it", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading className="mine" />
    </Lottie>,
  );

  expect(overlay().getAttribute("class")).toBe(`${lottieLoadingClass} mine`);
});

it("puts every other attribute on the element, and hands it back by ref", () => {
  const mine = createRef<HTMLDivElement>();

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading
        ref={mine}
        id="waiting"
        data-testid="overlay"
        aria-label="the animation is loading"
      />
    </Lottie>,
  );

  const element = overlay();
  expect(mine.current).toBe(element);
  expect(element.id).toBe("waiting");
  expect(element.dataset.testid).toBe("overlay");
  expect(element.getAttribute("aria-label")).toBe("the animation is loading");
});

it("announces itself as a status, unless the consumer says otherwise", () => {
  const view = render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading />
    </Lottie>,
  );
  expect(overlay().getAttribute("role")).toBe("status");

  view.rerender(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieLoading role="presentation" />
    </Lottie>,
  );
  expect(overlay().getAttribute("role")).toBe("presentation");
});

it("drives itself from an animation it is handed, with no component around it", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <div style={{ position: "relative" }}>
        <LottieDisplay lottie={lottie} />
        <LottieLoading lottie={lottie} />
      </div>
    );
  }

  render(<Probe />);
  expect(isShowing()).toBe(true);

  flushLoad();
  expect(isShowing()).toBe(false);
});

/*
 * What the types refuse. Each of these is a compile error, so the file failing
 * to typecheck is the assertion; `@ts-expect-error` sits on the offending
 * property rather than on the element, because that is where the error lands.
 */
it("refuses what it cannot do, at compile time", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      {/* It renders one element and does not choose which. */}
      <LottieLoading
        // @ts-expect-error
        as="section"
      />
      <LottieLoading
        // @ts-expect-error
        invented="nonsense"
      />
      {/* Milliseconds, not a CSS duration. */}
      <LottieLoading
        // @ts-expect-error
        showAfter="400ms"
      />
    </Lottie>,
  );

  expect(document.querySelectorAll(`.${lottieLoadingClass}`)).toHaveLength(3);
});
