/*
 * Which of two rules wins, which is a question about the order the stylesheets
 * were inserted in, and that is why this is a file of its own.
 *
 * React remembers every stylesheet it has inserted for the lifetime of the
 * document and never inserts one twice, so the order is settled by whatever
 * rendered first and nothing afterwards can change it. A test asserting the
 * order therefore has to be the first thing in its document to render one, and
 * anything added above the first test here disarms it silently.
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { reactMajor } from "../test/reactMajor.js";
import { Lottie } from "./Lottie.js";
import { LottieDisplay, lottieDisplayClass } from "./LottieDisplay.js";

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

afterEach(cleanup);

it.skipIf(reactMajor < 19)(
  "leaves the animation the space anything beside it takes",
  () => {
    /*
     * The animation placed among children, before anything else in this document
     * has rendered a stylesheet. That is the arrangement in which the box's rules
     * are met first and would lose, so it is the only arrangement that can catch
     * the mistake.
     */
    render(
      <Lottie src={ANIMATION}>
        <LottieDisplay />
        <p>a control bar's worth of height</p>
      </Lottie>,
    );

    const sheets = [...document.querySelectorAll("style[data-href]")].flatMap(
      (element) => element.getAttribute("data-href")?.split(" ") ?? [],
    );
    /*
     * Both rules for the animation's height sit at zero specificity, so the one
     * that wins is the one declared last. The box's rules therefore have to be
     * met after the animation's, which is what rendering each stylesheet below
     * the element it belongs to arranges.
     */
    expect(sheets).toEqual([lottieDisplayClass, lottieRootClass]);

    const element = document.querySelector(`.${lottieDisplayClass}`);
    if (element === null) {
      throw new Error("no animation was rendered");
    }
    const display = getComputedStyle(element);
    expect(display.flexGrow).toBe("1");
    expect(display.height).toBe("auto");
  },
);
