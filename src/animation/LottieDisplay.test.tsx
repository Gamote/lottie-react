import { act, cleanup, render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { reactMajor } from "../test/reactMajor.js";
import { LottieDisplay, lottieDisplayClass } from "./LottieDisplay.js";
import { LottieInstanceContext } from "./LottieInstanceContext.js";
import { stylePrecedence } from "./stylePrecedence.js";
import { useLottie } from "./useLottie.js";

/** The dimensions are what the rendered `viewBox` is derived from. */
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
   * that nothing is playing and park itself.
   *
   * The stylesheets React hoisted are deliberately left alone. React remembers
   * what it has already inserted for the lifetime of the document, so removing
   * one here would mean it is never inserted again and every later assertion
   * about the cascade would pass while proving nothing.
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

function displayElement(): HTMLElement {
  const element = document.querySelector<HTMLElement>(`.${lottieDisplayClass}`);
  if (element === null) {
    throw new Error("no display was rendered");
  }
  return element;
}

it("draws the animation inside the element it renders", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} />;
  }

  render(<Probe />);
  flushLoad();

  const display = displayElement();
  expect(display.tagName).toBe("DIV");
  expect(display.childElementCount).toBe(1);
  /* Derived from the animation handed in, so no stand-in element satisfies it. */
  expect(display.firstElementChild?.getAttribute("viewBox")).toBe("0 0 123 45");
});

it("takes the animation from the context when it is given none", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <LottieInstanceContext.Provider value={lottie}>
        <div>
          <LottieDisplay />
        </div>
      </LottieInstanceContext.Provider>
    );
  }

  render(<Probe />);
  flushLoad();

  expect(displayElement().firstElementChild?.tagName).toBe("svg");
});

it("renders the element `as` names, and still draws into it", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} as="section" />;
  }

  render(<Probe />);
  flushLoad();

  const display = displayElement();
  expect(display.tagName).toBe("SECTION");
  expect(display.firstElementChild?.getAttribute("viewBox")).toBe("0 0 123 45");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} className="mine" />;
  }

  render(<Probe />);

  expect(displayElement().getAttribute("class")).toBe(
    `${lottieDisplayClass} mine`,
  );
});

it("puts every other attribute on the element", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <LottieDisplay
        lottie={lottie}
        id="hero"
        data-testid="animation"
        aria-label="a loading indicator"
        style={{ opacity: 0.5 }}
      />
    );
  }

  render(<Probe />);

  const display = displayElement();
  expect(display.id).toBe("hero");
  expect(display.dataset.testid).toBe("animation");
  expect(display.getAttribute("aria-label")).toBe("a loading indicator");
  expect(display.style.opacity).toBe("0.5");
});

it("hands the element back through a ref, without losing the animation", () => {
  const mine = createRef<HTMLElement>();

  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} ref={mine} />;
  }

  render(<Probe />);
  flushLoad();

  expect(mine.current).toBe(displayElement());
  expect(displayElement().firstElementChild?.tagName).toBe("svg");
});

it("hands the element to a callback ref once, not once per render", () => {
  const seen: (HTMLElement | null)[] = [];
  const record = (node: HTMLElement | null) => {
    seen.push(node);
  };

  function Probe({ label }: { label: string }) {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} ref={record} aria-label={label} />;
  }

  const view = render(<Probe label="one" />);
  flushLoad();
  view.rerender(<Probe label="two" />);
  flushLoad();

  /*
   * A merged ref rebuilt on every render would make React detach and reattach
   * the element each time, which shows up here as `null` between the nodes.
   */
  expect(seen).toEqual([displayElement()]);
});

it("keeps the animation attached across an unrelated re-render", () => {
  function Probe({ label }: { label: string }) {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} aria-label={label} />;
  }

  const view = render(<Probe label="one" />);
  flushLoad();
  const first = displayElement().firstElementChild;

  view.rerender(<Probe label="two" />);
  flushLoad();

  expect(displayElement().firstElementChild).toBe(first);
});

it("gives every animation on the page its own element", () => {
  function Probe() {
    const first = useLottie({ src: ANIMATION });
    const second = useLottie({ src: ANIMATION });
    return (
      <>
        <LottieDisplay lottie={first} />
        <LottieDisplay lottie={second} />
      </>
    );
  }

  render(<Probe />);
  flushLoad();

  const displays = document.querySelectorAll(`.${lottieDisplayClass}`);
  expect(displays).toHaveLength(2);
  expect([...displays].map((element) => element.firstElementChild?.tagName)) //
    .toEqual(["svg", "svg"]);
});

it("attaches once under StrictMode, which mounts everything twice", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} />;
  }

  render(<Probe />, { reactStrictMode: true });
  flushLoad();

  expect(document.querySelectorAll(`.${lottieDisplayClass}`)).toHaveLength(1);
  expect(displayElement().childElementCount).toBe(1);
});

it.skipIf(reactMajor < 19)(
  "ships one stylesheet however many animations are rendered",
  () => {
    function Probe() {
      const first = useLottie({ src: ANIMATION });
      const second = useLottie({ src: ANIMATION });
      const third = useLottie({ src: ANIMATION });
      return (
        <>
          <LottieDisplay lottie={first} />
          <LottieDisplay lottie={second} />
          <LottieDisplay lottie={third} />
        </>
      );
    }

    render(<Probe />);

    /*
     * The token set rather than the element count, because the two render paths
     * disagree about elements: the server merges same-precedence sheets into one
     * element carrying several tokens, and the client keeps them apart.
     */
    const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    expect(tokens).toEqual([lottieDisplayClass]);
    expect(
      document
        .querySelector("style[data-href]")
        ?.getAttribute("data-precedence"),
    ).toBe(stylePrecedence);
  },
);

it("sizes and positions the display with rules a consumer can see", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} />;
  }

  render(<Probe />);

  const computed = getComputedStyle(displayElement());
  expect(computed.width).toBe("100%");
  expect(computed.height).toBe("100%");
  expect(computed.position).toBe("relative");
  expect(computed.overflow).toBe("hidden");
  expect(computed.padding).toBe("0px");
});

it("lets a consumer's class beat a default, one property at a time", () => {
  consumerStyles(".probe-height{height:128px}");

  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} className="probe-height" />;
  }

  render(<Probe />);

  const computed = getComputedStyle(displayElement());
  expect(computed.height).toBe("128px");
  /* Only the property they wrote moves; the rest of the defaults stand. */
  expect(computed.width).toBe("100%");
  expect(computed.overflow).toBe("hidden");
});

it("costs a consumer nothing to add a class about something else", () => {
  consumerStyles(".probe-background{background:red}");

  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} className="probe-background" />;
  }

  render(<Probe />);

  const computed = getComputedStyle(displayElement());
  expect(computed.backgroundColor).toBe("red");
  expect(computed.width).toBe("100%");
  expect(computed.height).toBe("100%");
});

it("lets an inline style beat a default as well", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return <LottieDisplay lottie={lottie} style={{ height: "42px" }} />;
  }

  render(<Probe />);

  expect(getComputedStyle(displayElement()).height).toBe("42px");
});

it("loses to a consumer's class wherever the stylesheet sits", () => {
  /*
   * React 19 hoists the tag into the head; React 18 leaves it where it was
   * rendered, after the consumer's own CSS. Document order decides only a tie,
   * and a zero-specificity rule never ties with a class, so the outcome should
   * not depend on the position. This puts the rules in React 18's position and
   * checks that it does not.
   */
  consumerStyles(".probe-position{height:128px}");
  const element = document.createElement("div");
  element.className = `probe-in-body probe-position`;
  document.body.append(element);
  const late = document.createElement("style");
  late.textContent = ":where(.probe-in-body){width:100%;height:100%}";
  document.body.append(late);

  const computed = getComputedStyle(element);
  expect(computed.height).toBe("128px");
  expect(computed.width).toBe("100%");
});

it("would lose that argument without :where(), which is what proves the point", () => {
  /*
   * The discriminating control. The same pair of rules in the same order, with
   * the library's selector written plainly, goes the other way: source order
   * decides and the library wins. Every cascade assertion above is measuring
   * `:where()` rather than an environment that ignores CSS.
   */
  consumerStyles(".probe-control-consumer{height:128px}");
  consumerStyles(".probe-control-library{width:100%;height:100%}");

  const element = document.createElement("div");
  element.className = "probe-control-library probe-control-consumer";
  document.body.append(element);

  expect(getComputedStyle(element).height).toBe("100%");
});

it.skipIf(reactMajor < 19)(
  "scopes every selector it ships to its own class",
  () => {
    function Probe() {
      const lottie = useLottie({ src: ANIMATION });
      return <LottieDisplay lottie={lottie} />;
    }

    render(<Probe />);

    const sheet = document.querySelector(
      `style[data-href="${lottieDisplayClass}"]`,
    );
    const layered = sheet?.textContent ?? "";
    const selectors = layered
      .slice(layered.indexOf("{") + 1)
      .split("}")
      .filter((rule) => rule.trim() !== "")
      .map((rule) => rule.slice(0, rule.indexOf("{")));

    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toContain(`:where(.${lottieDisplayClass}`);
    }
  },
);

it("leaves the host page's own elements alone", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <>
        <LottieDisplay lottie={lottie} />
        <input type="range" />
        <button type="button">unrelated</button>
        <div className="host-element" />
      </>
    );
  }

  render(<Probe />);

  for (const selector of ["input", "button", ".host-element"]) {
    const element = document.querySelector(selector);
    if (element === null) {
      throw new Error(`no ${selector} was rendered`);
    }
    const computed = getComputedStyle(element);
    expect(computed.width).not.toBe("100%");
    expect(computed.overflow).not.toBe("hidden");
    expect(computed.position).not.toBe("relative");
  }
});

/*
 * What the types refuse. Each of these is a compile error, so the file failing
 * to typecheck is the assertion; `@ts-expect-error` sits on the offending
 * property rather than on the element, because that is where the error lands.
 */
it("refuses what it cannot render, at compile time", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <>
        {/* A void element could never show an animation. */}
        <LottieDisplay
          lottie={lottie}
          // @ts-expect-error
          as="img"
        />
        {/* Every element's own props still follow the tag it names. */}
        <LottieDisplay lottie={lottie} as="button" type="button" disabled />
        <LottieDisplay lottie={lottie} as="a" href="/somewhere" />
        <LottieDisplay
          lottie={lottie}
          as="span"
          // @ts-expect-error
          disabled
        />
        <LottieDisplay
          lottie={lottie}
          // @ts-expect-error
          href="/somewhere"
        />
        {/* The contents belong to lottie-web, so nothing may be passed. */}
        {/* @ts-expect-error */}
        <LottieDisplay lottie={lottie}>text</LottieDisplay>
        <LottieDisplay
          lottie={lottie}
          // @ts-expect-error
          invented="nonsense"
        />
      </>
    );
  }

  render(<Probe />);
  flushLoad();

  expect(document.querySelectorAll(`.${lottieDisplayClass}`)).toHaveLength(7);
});
