/*
 * The environment can drop layered rules silently: happy-dom without the
 * repository's patch parses a `@layer` block and throws its contents away,
 * which would turn every computed-style assertion in the suite into a failure
 * about the environment rather than the code. The first test here names that
 * failure: if the patch is ever lost, this is the file that says why.
 */
import { cleanup, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { reactMajor } from "../test/reactMajor.js";
import { renderStyledElement } from "./renderStyledElement.js";
import { styleLayer } from "./styleLayer.js";

afterEach(cleanup);

it("runs in an environment that applies rules inside a cascade layer", () => {
  const style = document.createElement("style");
  style.textContent = "@layer probe-env{:where(.probe-env){position:relative}}";
  document.head.append(style);
  const element = document.createElement("div");
  element.className = "probe-env";
  document.body.append(element);

  expect(getComputedStyle(element).position).toBe("relative");

  style.remove();
  element.remove();
});

it.skipIf(reactMajor < 19)(
  "wraps the stylesheet in the library's layer",
  () => {
    render(
      <div>
        {renderStyledElement({
          tag: "div",
          styleClass: "probe-wrap",
          styles: ":where(.probe-wrap){padding:7px}",
          attributes: {},
        })}
      </div>,
    );

    const sheet = document.querySelector('style[data-href="probe-wrap"]');
    expect(sheet?.textContent).toBe(
      `@layer ${styleLayer}{:where(.probe-wrap){padding:7px}}`,
    );
  },
);

/*
 * React 18 has no style hoisting, so the sheet renders in place with its
 * literal attributes, its content and its layer intact, and nothing
 * complains. This is the delivery the migration guide documents, and
 * `pnpm check:react18` is the lane that runs it.
 */
it.skipIf(reactMajor >= 19)("delivers the sheet in place on React 18", () => {
  const warn = vi.spyOn(console, "warn");
  const error = vi.spyOn(console, "error");
  const view = render(
    <div>
      {renderStyledElement({
        tag: "div",
        styleClass: "probe-inplace",
        styles: ":where(.probe-inplace){padding:7px}",
        attributes: {},
      })}
    </div>,
  );

  const sheet = view.container.querySelector('style[href="probe-inplace"]');
  expect(sheet?.textContent).toBe(
    `@layer ${styleLayer}{:where(.probe-inplace){padding:7px}}`,
  );
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  warn.mockRestore();
  error.mockRestore();
});

it("loses to a consumer rule although the consumer never declared the layer", () => {
  render(
    <>
      {renderStyledElement({
        tag: "div",
        styleClass: "probe-cascade",
        styles: ":where(.probe-cascade){padding:7px}",
        className: "probe-consumer",
        attributes: {},
      })}
      <style>{".probe-consumer{padding:3px}"}</style>
    </>,
  );

  const element = document.querySelector(".probe-cascade");
  if (element === null) {
    throw new Error("no element was rendered");
  }
  expect(getComputedStyle(element).padding).toBe("3px");
});
