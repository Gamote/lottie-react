import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { Lottie } from "../animation/Lottie.js";
import { LottieDisplay } from "../animation/LottieDisplay.js";
import { stylePrecedence } from "../animation/stylePrecedence.js";
import { useLottieInstance } from "../animation/useLottieInstance.js";
import { reactMajor } from "../test/reactMajor.js";
import {
  LottieError,
  lottieErrorClass,
  lottieErrorStyles,
} from "./LottieError.js";

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

/** Refused before the engine is reached, so no load is attempted. */
const UNUSABLE = "";

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

function consumerStyles(css: string): void {
  const element = document.createElement("style");
  element.textContent = css;
  document.head.append(element);
}

function overlay(): HTMLElement {
  const element = document.querySelector<HTMLElement>(`.${lottieErrorClass}`);
  if (element === null) {
    throw new Error("no overlay was rendered");
  }
  return element;
}

function isShowing(): boolean {
  return document.querySelector(`.${lottieErrorClass}`) !== null;
}

it("says so when the animation could not be loaded", () => {
  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();

  expect(overlay().textContent).toBe("The animation could not be loaded.");
});

it("stays out of the way while the animation is loading and once it has", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );

  expect(isShowing()).toBe(false);

  flushLoad();

  expect(isShowing()).toBe(false);
});

it("goes when a source that works starts loading", () => {
  const view = render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();
  expect(isShowing()).toBe(true);

  view.rerender(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();

  expect(isShowing()).toBe(false);
});

it("shows what the consumer gives it instead, with the reason in reach", () => {
  function Reason() {
    const { error, reload } = useLottieInstance();
    return (
      <button type="button" onClick={reload}>
        {error?.message}
      </button>
    );
  }

  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError>
        <Reason />
      </LottieError>
    </Lottie>,
  );
  flushLoad();

  const button = overlay().querySelector("button");
  if (button === null) {
    throw new Error("no button was rendered");
  }
  expect(button.textContent).toContain("`src` must be");
  expect(overlay().textContent).not.toContain("could not be loaded");
});

it("lets what it shows ask for another attempt", () => {
  const failed = vi.fn();

  function Retry() {
    const { reload } = useLottieInstance();
    return (
      <button type="button" onClick={reload}>
        Try again
      </button>
    );
  }

  render(
    <Lottie src={UNUSABLE} subscriptions={{ error: failed }}>
      <LottieDisplay />
      <LottieError>
        <Retry />
      </LottieError>
    </Lottie>,
  );
  flushLoad();
  expect(failed).toHaveBeenCalledOnce();

  const button = overlay().querySelector("button");
  if (button === null) {
    throw new Error("no button was rendered");
  }
  act(() => {
    fireEvent.click(button);
  });
  flushLoad();

  /* A second attempt was genuinely made, rather than the first remembered. */
  expect(failed).toHaveBeenCalledTimes(2);
});

it.skipIf(reactMajor < 19)("names its stylesheet with its class", () => {
  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();

  const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
    (element) => element.getAttribute("data-href")?.split(" ") ?? [],
  );
  expect(tokens.filter((token) => token === lottieErrorClass)).toHaveLength(1);
  expect(
    document
      .querySelector(`style[data-href="${lottieErrorClass}"]`)
      ?.getAttribute("data-precedence"),
  ).toBe(stylePrecedence);
});

it("sits over the whole animation, with rules a consumer can see", () => {
  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();

  const computed = getComputedStyle(overlay());
  expect(computed.position).toBe("absolute");
  expect(computed.top).toBe("0px");
  expect(computed.right).toBe("0px");
  expect(computed.bottom).toBe("0px");
  expect(computed.left).toBe("0px");
  expect(computed.zIndex).toBe("1");
  expect(computed.display).toBe("flex");
  expect(computed.alignItems).toBe("center");
  expect(computed.justifyContent).toBe("center");
});

it("carries a background, so what it covers cannot be read through it", () => {
  /*
   * An overlay spans everything the animation's box holds, the control bar
   * included, so with no background of its own the buttons and the seek bar
   * show straight through the message. Asserted against the rule text rather
   * than the computed style, because this environment does not evaluate
   * `color-mix` at all and reports an empty string for anything using it, which
   * is also why nothing here can check what the colour resolves to.
   */
  expect(lottieErrorStyles).toContain("background:color-mix(");
});

it("appears at once, since there is nothing left to wait for", () => {
  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();

  /*
   * The loading overlay waits so that a load finishing quickly is never
   * announced. A failure has already finished, so waiting would only delay the
   * only information there is.
   */
  expect(getComputedStyle(overlay()).animationName).toBe("");
});

it("loses to a consumer's own rule, one property at a time", () => {
  consumerStyles(".probe-error{background:red}");

  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError className="probe-error" />
    </Lottie>,
  );
  flushLoad();

  const computed = getComputedStyle(overlay());
  expect(computed.backgroundColor).toBe("red");
  /* Only the property they wrote moves; the rest of the defaults stand. */
  expect(computed.position).toBe("absolute");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError className="mine" />
    </Lottie>,
  );
  flushLoad();

  expect(overlay().getAttribute("class")).toBe(`${lottieErrorClass} mine`);
});

it("puts every other attribute on the element, and hands it back by ref", () => {
  const mine = createRef<HTMLDivElement>();

  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError ref={mine} id="broken" data-testid="overlay" />
    </Lottie>,
  );
  flushLoad();

  const element = overlay();
  expect(mine.current).toBe(element);
  expect(element.id).toBe("broken");
  expect(element.dataset.testid).toBe("overlay");
});

it("announces itself as an alert, unless the consumer says otherwise", () => {
  const view = render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError />
    </Lottie>,
  );
  flushLoad();
  expect(overlay().getAttribute("role")).toBe("alert");

  view.rerender(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      <LottieError role="presentation" />
    </Lottie>,
  );
  expect(overlay().getAttribute("role")).toBe("presentation");
});

/*
 * What the types refuse. Each of these is a compile error, so the file failing
 * to typecheck is the assertion.
 */
it("refuses what it cannot do, at compile time", () => {
  render(
    <Lottie src={UNUSABLE}>
      <LottieDisplay />
      {/* It renders one element and does not choose which. */}
      <LottieError
        // @ts-expect-error
        as="section"
      />
      <LottieError
        // @ts-expect-error
        invented="nonsense"
      />
      {/* Waiting belongs to the overlay that has something to wait for. */}
      <LottieError
        // @ts-expect-error
        showAfter={200}
      />
    </Lottie>,
  );
  flushLoad();

  expect(document.querySelectorAll(`.${lottieErrorClass}`)).toHaveLength(3);
});
