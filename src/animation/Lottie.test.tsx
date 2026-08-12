import { act, cleanup, render } from "@testing-library/react";
import { createRef, useRef } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { reactMajor } from "../test/reactMajor.js";
import { Lottie } from "./Lottie.js";
import { LottieDisplay, lottieDisplayClass } from "./LottieDisplay.js";
import { stylePrecedence } from "./stylePrecedence.js";
import type { LottieHandle } from "./types.js";
import { useLottieInstance } from "./useLottieInstance.js";

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

const lottieRootClass = "lottie-root";

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

function only(selector: string): HTMLElement {
  const element = document.querySelector<HTMLElement>(selector);
  if (element === null) {
    throw new Error(`nothing matched ${selector}`);
  }
  return element;
}

function watchWarnings() {
  return vi.spyOn(console, "warn").mockImplementation(() => undefined);
}

it("is the animation itself when it is given no children", () => {
  render(<Lottie src={ANIMATION} />);
  flushLoad();

  const display = only(`.${lottieDisplayClass}`);
  expect(display.tagName).toBe("DIV");
  expect(document.querySelector(`.${lottieRootClass}`)).toBeNull();
  /* Derived from the animation handed in, so no stand-in element satisfies it. */
  expect(display.firstElementChild?.getAttribute("viewBox")).toBe("0 0 123 45");
});

it("renders the element `as` names", () => {
  render(<Lottie src={ANIMATION} as="section" />);
  flushLoad();

  const display = only(`.${lottieDisplayClass}`);
  expect(display.tagName).toBe("SECTION");
  expect(display.firstElementChild?.getAttribute("viewBox")).toBe("0 0 123 45");
});

it("puts every standard attribute on the element it renders", () => {
  render(
    <Lottie
      src={ANIMATION}
      className="mine"
      id="hero"
      title="a tooltip"
      hidden={false}
      data-testid="animation"
      aria-label="a loading indicator"
      style={{ opacity: 0.5 }}
    />,
  );

  const display = only(`.${lottieDisplayClass}`);
  expect(display.getAttribute("class")).toBe(`${lottieDisplayClass} mine`);
  expect(display.id).toBe("hero");
  expect(display.title).toBe("a tooltip");
  expect(display.dataset.testid).toBe("animation");
  expect(display.getAttribute("aria-label")).toBe("a loading indicator");
  expect(display.style.opacity).toBe("0.5");
});

it("puts them on the outer element instead when you place the animation", () => {
  render(
    <Lottie
      src={ANIMATION}
      className="mine"
      id="hero"
      title="a tooltip"
      data-testid="animation"
      aria-label="a loading indicator"
      style={{ opacity: 0.5 }}
    >
      <LottieDisplay />
    </Lottie>,
  );

  const root = only(`.${lottieRootClass}`);
  expect(root.getAttribute("class")).toBe(`${lottieRootClass} mine`);
  expect(root.id).toBe("hero");
  expect(root.title).toBe("a tooltip");
  expect(root.dataset.testid).toBe("animation");
  expect(root.getAttribute("aria-label")).toBe("a loading indicator");
  expect(root.style.opacity).toBe("0.5");
  /* None of it reaches the animation's own element. */
  expect(only(`.${lottieDisplayClass}`).id).toBe("");
});

it.skipIf(reactMajor < 19)(
  "draws the animation wherever among the children you put it",
  () => {
    render(
      <Lottie src={ANIMATION}>
        <p>a caption above</p>
        <LottieDisplay />
        <p>a caption below</p>
      </Lottie>,
    );
    flushLoad();

    const root = only(`.${lottieRootClass}`);
    expect([...root.children].map((child) => child.tagName)).toEqual([
      "P",
      "DIV",
      "P",
    ]);
    expect(
      only(`.${lottieDisplayClass}`).firstElementChild?.getAttribute("viewBox"),
    ).toBe("0 0 123 45");
  },
);

it("reaches the animation through any depth of the consumer's own markup", () => {
  function Toolbar({ children }: { children: React.ReactNode }) {
    return <div className="toolbar">{children}</div>;
  }

  render(
    <Lottie src={ANIMATION}>
      <Toolbar>
        <LottieDisplay />
      </Toolbar>
    </Lottie>,
  );
  flushLoad();

  expect(only(".toolbar .lottie-display").firstElementChild?.tagName).toBe(
    "svg",
  );
});

it("hands the element back through a ref, whichever element that is", () => {
  const bare = createRef<HTMLElement>();
  const wrapping = createRef<HTMLElement>();

  render(
    <>
      <Lottie src={ANIMATION} ref={bare} />
      <Lottie src={ANIMATION} ref={wrapping}>
        <LottieDisplay />
      </Lottie>
    </>,
  );
  flushLoad();

  expect(bare.current?.className).toBe(lottieDisplayClass);
  expect(wrapping.current?.className).toBe(lottieRootClass);
});

it("drives the animation through the handle on lottieRef", () => {
  const played = vi.fn();
  let handle: LottieHandle | null = null;

  function Probe() {
    const mine = useRef<LottieHandle>(null);
    handle = mine.current;
    return (
      <Lottie
        src={ANIMATION}
        lottieRef={mine}
        subscriptions={{ play: played }}
      />
    );
  }

  const view = render(<Probe />);
  flushLoad();
  view.rerender(<Probe />);

  expect(handle).not.toBeNull();
  act(() => {
    handle?.play();
  });

  expect(played).toHaveBeenCalled();
});

it("says nothing when the children carry exactly one animation container", () => {
  const warn = watchWarnings();

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
    </Lottie>,
  );
  flushLoad();

  expect(warn).not.toHaveBeenCalled();
});

it("says nothing when there are no children to place anything in", () => {
  const warn = watchWarnings();

  render(<Lottie src={ANIMATION} />);
  flushLoad();

  expect(warn).not.toHaveBeenCalled();
});

it("warns when the children carry no animation container", () => {
  const warn = watchWarnings();

  render(
    <Lottie src={ANIMATION}>
      <p>everything except the animation</p>
    </Lottie>,
  );
  flushLoad();

  expect(warn).toHaveBeenCalledTimes(1);
  const message = String(warn.mock.calls[0]?.[0]);
  expect(message).toContain("nowhere to be drawn");
  /* The one case it cannot tell apart is named rather than left to be found. */
  expect(message).toContain("conditionally");
});

it("warns when the children carry more than one, and says how many", () => {
  const warn = watchWarnings();

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieDisplay />
    </Lottie>,
  );
  flushLoad();

  expect(warn).toHaveBeenCalledTimes(1);
  expect(String(warn.mock.calls[0]?.[0])).toContain("2 <LottieDisplay>");
});

it.skipIf(reactMajor < 19)(
  "ships one stylesheet per element it uses, however many animations render",
  () => {
    render(
      <>
        <Lottie src={ANIMATION} />
        <Lottie src={ANIMATION} />
        <Lottie src={ANIMATION}>
          <LottieDisplay />
        </Lottie>
      </>,
    );

    /*
     * The token set rather than the element count, because the two render paths
     * disagree about elements: the server merges same-precedence sheets into one
     * element carrying several tokens, and the client keeps them apart.
     */
    const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    expect(new Set(tokens)).toEqual(
      new Set([lottieDisplayClass, lottieRootClass]),
    );
    expect(
      document
        .querySelector("style[data-href]")
        ?.getAttribute("data-precedence"),
    ).toBe(stylePrecedence);
  },
);

it("stacks what you place inside it", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <p>a control bar's worth of height</p>
    </Lottie>,
  );

  const root = getComputedStyle(only(`.${lottieRootClass}`));
  expect(root.display).toBe("flex");
  expect(root.flexDirection).toBe("column");
  expect(root.position).toBe("relative");
});

it("gives the animation its full height when it stands alone", () => {
  render(<Lottie src={ANIMATION} />);

  const display = getComputedStyle(only(`.${lottieDisplayClass}`));
  expect(display.height).toBe("100%");
  expect(display.width).toBe("100%");
});

it("keeps the animation attached across an unrelated re-render", () => {
  function Probe({ label }: { label: string }) {
    return <Lottie src={ANIMATION} aria-label={label} />;
  }

  const view = render(<Probe label="one" />);
  flushLoad();
  const first = only(`.${lottieDisplayClass}`).firstElementChild;

  view.rerender(<Probe label="two" />);
  flushLoad();

  expect(only(`.${lottieDisplayClass}`).firstElementChild).toBe(first);
});

it("attaches once under StrictMode, which mounts everything twice", () => {
  const warn = watchWarnings();

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
    </Lottie>,
    { reactStrictMode: true },
  );
  flushLoad();

  expect(document.querySelectorAll(`.${lottieDisplayClass}`)).toHaveLength(1);
  expect(only(`.${lottieDisplayClass}`).childElementCount).toBe(1);
  expect(warn).not.toHaveBeenCalled();
});

/*
 * What the types refuse. Each of these is a compile error, so the file failing
 * to typecheck is the assertion; `@ts-expect-error` sits on the offending
 * property rather than on the element, because that is where the error lands.
 */
it("refuses what it cannot render, at compile time", () => {
  render(
    <>
      {/* A void element could never show an animation. */}
      <Lottie
        src={ANIMATION}
        // @ts-expect-error
        as="img"
      />
      {/* Every element's own props still follow the tag it names. */}
      <Lottie src={ANIMATION} as="button" type="button" disabled />
      <Lottie src={ANIMATION} as="a" href="/somewhere" />
      <Lottie
        src={ANIMATION}
        as="span"
        // @ts-expect-error
        disabled
      />
      <Lottie
        src={ANIMATION}
        // @ts-expect-error
        href="/somewhere"
      />
      {/* An inline element cannot hold the <div> the html renderer appends. */}
      <Lottie src={ANIMATION} renderer="html" as="section" />
      <Lottie
        src={ANIMATION}
        renderer="html"
        // @ts-expect-error
        as="span"
      />
      {/* Nor can it hold children, whichever renderer is in use. */}
      <Lottie
        src={ANIMATION}
        // @ts-expect-error
        as="span"
      >
        <LottieDisplay />
      </Lottie>
      {/* The settings bag follows the renderer that reads it. */}
      <Lottie src={ANIMATION} renderer="canvas" rendererSettings={{ dpr: 2 }} />
      <Lottie
        src={ANIMATION}
        // @ts-expect-error
        rendererSettings={{ dpr: 2 }}
      />
      <Lottie
        src={ANIMATION}
        // @ts-expect-error
        invented="nonsense"
      />
    </>,
  );
  flushLoad();

  /* Ten render the animation themselves, and the eleventh places it in a child. */
  expect(document.querySelectorAll(`.${lottieDisplayClass}`)).toHaveLength(11);
  expect(document.querySelectorAll(`.${lottieRootClass}`)).toHaveLength(1);
});

it("hands the element it renders to the animation as its root", () => {
  let seen: HTMLElement | null = null;
  /* Read through a function, so the assertion sees the latest render rather
     than the value the variable was declared with. */
  const root = (): HTMLElement | null => seen;

  function Reader() {
    seen = useLottieInstance().root;
    return null;
  }

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <Reader />
    </Lottie>,
  );
  flushLoad();

  /*
   * The element around everything, which is what fullscreen has to be asked of:
   * the animation and the controls fill the screen together, and asking for the
   * display alone would leave the controls on a page nobody can see. A consumer
   * of this component cannot redirect that somewhere else, which is deliberate;
   * anyone wanting to uses the hook and attaches `setRootRef` themselves.
   */
  expect(root()?.className).toBe(lottieRootClass);
  expect(root()).not.toBe(only(`.${lottieDisplayClass}`));
});
