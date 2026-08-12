import { act, cleanup, fireEvent, render } from "@testing-library/react";
import { createRef } from "react";
import { afterAll, afterEach, beforeAll, expect, it, vi } from "vitest";
import { Lottie } from "../animation/Lottie.js";
import {
  LottieDisplay,
  lottieDisplayClass,
} from "../animation/LottieDisplay.js";
import { stylePrecedence } from "../animation/stylePrecedence.js";
import type { LottieInstance } from "../animation/types.js";
import { useLottie } from "../animation/useLottie.js";
import {
  type FullscreenStub,
  installFullscreenStub,
} from "../test/installFullscreenStub.js";
import { reactMajor } from "../test/reactMajor.js";
import {
  LottieControls,
  lottieControlsClass,
  lottieControlsStyles,
} from "./LottieControls.js";
import { lottieDirectionClass } from "./LottieDirectionButton.js";
import { lottieFullscreenClass } from "./LottieFullscreenButton.js";
import { lottieLoopClass } from "./LottieLoopButton.js";
import { lottiePlayClass } from "./LottiePlayButton.js";
import { lottieReadoutClass } from "./LottieReadout.js";
import { lottieSeekClass } from "./LottieSeekBar.js";
import { lottieSpeedClass } from "./LottieSpeedSelect.js";
import { lottieStopClass } from "./LottieStopButton.js";

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

beforeAll(() => {
  vi.useFakeTimers();
});

afterAll(() => {
  vi.useRealTimers();
});

let stub: FullscreenStub | null = null;

afterEach(() => {
  cleanup();
  act(() => {
    vi.advanceTimersByTime(100);
  });
  stub?.restore();
  stub = null;
  vi.restoreAllMocks();
});

function flushLoad(): void {
  act(() => {
    vi.advanceTimersByTime(0);
  });
}

function controls(): HTMLElement {
  const element = document.querySelector<HTMLElement>(
    `.${lottieControlsClass}`,
  );
  if (element === null) {
    throw new Error("no control bar was rendered");
  }
  return element;
}

/** Every control, in the order the bar renders them. */
function order(): string[] {
  return [...controls().children].map((child) => child.className);
}

function control(styleClass: string): HTMLElement {
  const element = controls().querySelector<HTMLElement>(`.${styleClass}`);
  if (element === null) {
    throw new Error(`no .${styleClass} was rendered`);
  }
  return element;
}

function disabledStates(): boolean[] {
  return [
    ...controls().querySelectorAll<
      HTMLButtonElement | HTMLInputElement | HTMLSelectElement
    >("button, input, select"),
  ].map((control) => control.disabled);
}

it("puts the controls in the order every Lottie player that publishes one uses", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();

  /*
   * Transport, then position, then the playback modes, then the rate. The rate
   * sits away from play and stop deliberately: it is a setting rather than a
   * transport action, which is where Video.js, Plyr and Media Chrome all put it.
   */
  expect(order()).toEqual([
    lottiePlayClass,
    lottieStopClass,
    lottieSeekClass,
    lottieReadoutClass,
    lottieLoopClass,
    lottieDirectionClass,
    lottieSpeedClass,
  ]);
});

it("leaves fullscreen out entirely where the browser cannot do it", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();

  /*
   * No stub here, so this is a browser without the Fullscreen API, which is
   * also every iPhone ever shipped and any page in an iframe that was not
   * allowed to use it. Absent rather than disabled, because a control that can
   * never work is not a control.
   */
  expect(order()).not.toContain(lottieFullscreenClass);
});

it("puts fullscreen last where the browser can do it", () => {
  stub = installFullscreenStub();
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();

  /* After the rate, which is where every video player puts it. */
  expect(order().at(-1)).toBe(lottieFullscreenClass);
  expect(disabledStates()).toHaveLength(7);
});

it("fills the screen with the animation and its controls, not with the picture", () => {
  stub = installFullscreenStub();
  render(
    <Lottie src={ANIMATION} data-testid="root">
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();

  fireEvent.click(control(lottieFullscreenClass));

  /*
   * The element `<Lottie>` renders, which holds the animation and this bar.
   * Asking the display instead would fill the screen with the picture and leave
   * the controls on a page nobody can see any more.
   */
  const root = document.querySelector("[data-testid=root]");
  expect(stub.requested).toEqual([root]);
  expect(root).not.toBe(document.querySelector(`.${lottieDisplayClass}`));
});

it("keeps a count of repeats when looping is switched off and on again", () => {
  let latest: LottieInstance | null = null;
  /* Read through a function, so the assertion sees the latest render rather
     than the value the variable was declared with. */
  const loop = (): boolean | number | undefined => latest?.loop;

  function Probe() {
    const lottie = useLottie({ src: ANIMATION, loop: 3 });
    latest = lottie;
    return (
      <div>
        <LottieDisplay lottie={lottie} />
        <LottieControls lottie={lottie} />
      </div>
    );
  }
  render(<Probe />);
  flushLoad();

  fireEvent.click(control(lottieLoopClass));
  expect(loop()).toBe(false);
  fireEvent.click(control(lottieLoopClass));

  /*
   * Three, not true. Collapsing a count to a boolean on the way through is what
   * made the old surface's `toggleLoop` destructive, and is why it was dropped
   * rather than rebuilt: one press silently rewrote what the consumer asked for.
   * The memory lives here rather than in the button because the `l` key does the
   * same switching and the two have to share one.
   */
  expect(loop()).toBe(3);
});

it("is a named group rather than a toolbar", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );

  /*
   * `role="toolbar"` obliges arrow-key navigation and a single tab stop for the
   * whole bar. The player this replaces claimed the role and implemented
   * neither, which is worse than not claiming it.
   */
  expect(controls().getAttribute("role")).toBe("group");
  expect(controls().getAttribute("aria-label")).toBe("Animation controls");
});

it("lets the consumer name the group themselves", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls role="region" aria-label="Commandes" />
    </Lottie>,
  );

  expect(controls().getAttribute("role")).toBe("region");
  expect(controls().getAttribute("aria-label")).toBe("Commandes");
});

it("disables every control while the animation is loading", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );

  /*
   * Really disabled rather than styled as such, because both overlays cover this
   * bar, so anything still focusable would be reachable by keyboard while
   * nothing on screen showed it.
   */
  expect(disabledStates()).toEqual([true, true, true, true, true, true]);

  flushLoad();

  expect(disabledStates()).toEqual([false, false, false, false, false, false]);
});

it("disables every control after a load has failed", () => {
  render(
    <Lottie src="">
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();

  expect(disabledStates()).toEqual([true, true, true, true, true, true]);
});

it("stays on screen through both, so nothing jumps when the animation arrives", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  expect(order()).toHaveLength(7);

  flushLoad();

  expect(order()).toHaveLength(7);
});

it("counts in the unit it is given, and passes it to the readout", () => {
  const view = render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();
  expect(document.querySelector(`.${lottieReadoutClass}`)?.textContent).toBe(
    "0 / 29",
  );

  view.rerender(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls unit="seconds" />
    </Lottie>,
  );

  expect(document.querySelector(`.${lottieReadoutClass}`)?.textContent).toBe(
    "0.0s / 1.0s",
  );
});

it("drives the animation it is rendered inside, with nothing handed to it", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );
  flushLoad();

  fireEvent.click(control(lottiePlayClass));

  expect(control(lottiePlayClass).getAttribute("aria-label")).toBe("Pause");
});

it("drives an animation it is handed, with no component around it", () => {
  function Probe() {
    const lottie = useLottie({ src: ANIMATION });
    return (
      <div>
        <LottieDisplay lottie={lottie} />
        <LottieControls lottie={lottie} />
      </div>
    );
  }

  render(<Probe />);
  flushLoad();

  expect(disabledStates()).toEqual([false, false, false, false, false, false]);
});

it.skipIf(reactMajor < 19)(
  "names its stylesheet with its class, beside the ones already there",
  () => {
    render(
      <Lottie src={ANIMATION}>
        <LottieDisplay />
        <LottieControls />
      </Lottie>,
    );

    const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    expect(tokens).toContain(lottieControlsClass);
    expect(
      tokens.filter((token) => token === lottieControlsClass),
    ).toHaveLength(1);
    expect(tokens).toEqual(
      expect.arrayContaining([lottieDisplayClass, "lottie-root"]),
    );
    expect(
      document
        .querySelector(`style[data-href="${lottieControlsClass}"]`)
        ?.getAttribute("data-precedence"),
    ).toBe(stylePrecedence);
  },
);

it.skipIf(reactMajor < 19)(
  "ships one stylesheet however many bars are on the page",
  () => {
    render(
      <>
        <Lottie src={ANIMATION}>
          <LottieDisplay />
          <LottieControls />
        </Lottie>
        <Lottie src={ANIMATION}>
          <LottieDisplay />
          <LottieControls />
        </Lottie>
      </>,
    );

    const tokens = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    expect(
      tokens.filter((token) => token === lottieControlsClass),
    ).toHaveLength(1);
  },
);

it("lays itself out in a row that the seek bar grows into", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );

  /* Computed style rather than geometry: this environment performs no layout. */
  const bar = getComputedStyle(controls());
  expect(bar.display).toBe("flex");
  expect(bar.alignItems).toBe("center");

  /* The longhand, because this environment expands `flex: 1` on the way in. */
  expect(getComputedStyle(control(lottieSeekClass)).flexGrow).toBe("1");
});

it("measures itself rather than the window, for the narrow-width rule", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls />
    </Lottie>,
  );

  /*
   * The declaration is what makes the bar the thing the query measures, so a
   * small animation on a wide page counts as narrow. The query itself cannot be
   * asserted here: this environment parses `@container` and never evaluates it,
   * measured against a media query in the same sheet that does apply. What the
   * rule hides is only observable in a browser.
   */
  expect(getComputedStyle(controls()).containerType).toBe("inline-size");
  expect(lottieControlsStyles).toContain("@container (max-width:400px)");
});

it("adds the consumer's class to its own rather than replacing it", () => {
  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls className="mine" />
    </Lottie>,
  );

  expect(controls().getAttribute("class")).toBe(`${lottieControlsClass} mine`);
});

it("puts every other attribute on the element, and hands it back by ref", () => {
  const mine = createRef<HTMLDivElement>();

  render(
    <Lottie src={ANIMATION}>
      <LottieDisplay />
      <LottieControls ref={mine} id="bar" data-testid="controls" />
    </Lottie>,
  );

  const element = controls();
  expect(mine.current).toBe(element);
  expect(element.id).toBe("bar");
  expect(element.dataset.testid).toBe("controls");
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
      <LottieControls
        // @ts-expect-error
        as="section"
      />
      <LottieControls
        // @ts-expect-error
        invented="nonsense"
      />
      {/* Frames or seconds, and nothing else. */}
      <LottieControls
        // @ts-expect-error
        unit="milliseconds"
      />
    </Lottie>,
  );

  expect(document.querySelectorAll(`.${lottieControlsClass}`)).toHaveLength(3);
});
