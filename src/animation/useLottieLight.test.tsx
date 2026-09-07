import { act, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { LottieRenderer, LottieState } from "./types.js";
import { useLottieLight } from "./useLottieLight.js";

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

function systemFontAnimation() {
  return {
    ...ANIMATION,
    fonts: {
      list: [
        {
          fName: "Arial-Regular",
          fFamily: "Arial",
          fStyle: "Regular",
          ascent: 75,
        },
      ],
    },
  };
}

const WITH_SYSTEM_FONT = systemFontAnimation();

const WITH_GLYPH_TABLE = {
  ...systemFontAnimation(),
  chars: [],
};

/**
 * One null layer whose opacity carries an expression, written the way the
 * exporter writes it. `value` is the property's own value, so a build that
 * evaluates it draws exactly what a build that ignores it draws.
 */
const WITH_EXPRESSION = {
  ...ANIMATION,
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 3,
      nm: "null",
      sr: 1,
      ks: {
        o: { a: 0, k: 100, x: "var $bm_rt;\n$bm_rt = value;" },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [50, 50, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      ao: 0,
      ip: 0,
      op: 30,
      st: 0,
      bm: 0,
    },
  ],
};

interface ProbeProps {
  src: string | object;
}

function Probe({ src }: ProbeProps) {
  const lottie = useLottieLight({ src });
  return <div ref={lottie.setDisplayRef} />;
}

function fontMeasurementNodes(): NodeListOf<HTMLSpanElement> {
  return document.body.querySelectorAll(':scope > span[aria-hidden="true"]');
}

afterEach(() => {
  vi.restoreAllMocks();
  for (const node of fontMeasurementNodes()) {
    node.remove();
  }
});

async function flushLoad(): Promise<void> {
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
}

it("loads with the light build, which draws only svg", async () => {
  let state: LottieState | undefined;
  let element: Element | null | undefined;

  function Probe() {
    const lottie = useLottieLight({
      src: ANIMATION,
      renderer: LottieRenderer.svg,
    });
    state = lottie.state;
    element = lottie.animationItem?.renderer.svgElement ?? null;
    return <div ref={lottie.setDisplayRef} />;
  }

  render(<Probe />);
  await flushLoad();

  expect(state).toBe(LottieState.stopped);
  expect(element?.tagName).toBe("svg");
});

it("removes system-font measurement nodes when a path unmounts", async () => {
  vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(function send(
    this: XMLHttpRequest,
  ) {
    setTimeout(() => {
      Object.defineProperties(this, {
        readyState: { configurable: true, value: 4 },
        response: { configurable: true, value: systemFontAnimation() },
        status: { configurable: true, value: 200 },
      });
      this.onreadystatechange?.(new Event("readystatechange"));
    }, 0);
  });
  const view = render(<Probe src="/animation.json" />);
  await flushLoad();

  expect(fontMeasurementNodes()).toHaveLength(2);
  view.unmount();
  expect(fontMeasurementNodes()).toHaveLength(0);
});

it("does not expect measurement rulers when glyph data is embedded", async () => {
  const view = render(<Probe src={WITH_GLYPH_TABLE} />);
  await flushLoad();

  expect(view.container.querySelector("svg")).not.toBeNull();
});

it("removes system-font measurement nodes for shared sources", async () => {
  const view = render(
    <>
      <Probe src={WITH_SYSTEM_FONT} />
      <Probe src={WITH_SYSTEM_FONT} />
    </>,
  );
  await flushLoad();

  expect(fontMeasurementNodes()).toHaveLength(0);
  view.unmount();
  expect(fontMeasurementNodes()).toHaveLength(0);
});

/*
 * Everything below is checked by `tsc` rather than by vitest, and none of it
 * runs. The light build genuinely has no canvas or html renderer and throws
 * when asked for one, while shipping the full build's declarations, which say
 * it does. Refusing them here is what turns that runtime throw into a compile
 * error. The options type is read off the hook rather than written again, so it
 * cannot drift from the signature it is meant to be describing.
 */
type LightOptions = Parameters<typeof useLottieLight>[0];

const _svgIsAccepted: LightOptions = {
  src: ANIMATION,
  renderer: LottieRenderer.svg,
};

const _canvasIsRefused: LightOptions = {
  src: ANIMATION,
  // @ts-expect-error the light build has no canvas renderer
  renderer: LottieRenderer.canvas,
};

const _htmlIsRefused: LightOptions = {
  src: ANIMATION,
  // @ts-expect-error the light build has no html renderer
  renderer: LottieRenderer.html,
};

it("warns once when the animation uses expressions, which this build skips", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
  let state: LottieState | undefined;

  function Probe() {
    const lottie = useLottieLight({
      src: WITH_EXPRESSION,
      renderer: LottieRenderer.svg,
    });
    state = lottie.state;
    return <div ref={lottie.setDisplayRef} />;
  }

  render(<Probe />);
  await flushLoad();

  expect(state).toBe(LottieState.stopped);
  expect(warn).toHaveBeenCalledTimes(1);
  expect(warn.mock.calls[0]?.[0]).toContain("expressions");
  expect(warn.mock.calls[0]?.[0]).toContain("LottieSvg");
});

it("stays quiet when the animation has no expressions", async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);

  function Probe() {
    const lottie = useLottieLight({ src: ANIMATION });
    return <div ref={lottie.setDisplayRef} />;
  }

  render(<Probe />);
  await flushLoad();

  expect(warn).not.toHaveBeenCalled();
});
