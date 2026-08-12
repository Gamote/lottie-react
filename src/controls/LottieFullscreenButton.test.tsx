import { cleanup, fireEvent, render } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  LottieFullscreenButton,
  lottieFullscreenClass,
} from "./LottieFullscreenButton.js";

afterEach(() => {
  cleanup();
});

function button(): HTMLButtonElement {
  const element = document.querySelector<HTMLButtonElement>(
    `.${lottieFullscreenClass}`,
  );
  if (element === null) {
    throw new Error("no fullscreen button was rendered");
  }
  return element;
}

it("says what pressing it will do, and changes when that changes", () => {
  const view = render(
    <LottieFullscreenButton isFullscreen={false} toggle={() => undefined} />,
  );

  expect(button().getAttribute("aria-label")).toBe("Full screen");
  expect(button().getAttribute("title")).toBe("Full screen");
  const enterIcon = button().querySelector("path")?.getAttribute("d");

  view.rerender(
    <LottieFullscreenButton isFullscreen toggle={() => undefined} />,
  );

  expect(button().getAttribute("aria-label")).toBe("Exit full screen");
  /* The icon says the same thing to anyone who is looking rather than reading. */
  expect(button().querySelector("path")?.getAttribute("d")).not.toBe(enterIcon);
});

it("asks for the screen when it is pressed", () => {
  const toggle = vi.fn();
  render(<LottieFullscreenButton isFullscreen={false} toggle={toggle} />);

  fireEvent.click(button());

  expect(toggle).toHaveBeenCalledTimes(1);
});

it("adds the consumer's class to its own rather than replacing it", () => {
  render(
    <LottieFullscreenButton
      isFullscreen={false}
      toggle={() => undefined}
      className="mine"
      disabled
    />,
  );

  expect(button().getAttribute("class")).toBe(`${lottieFullscreenClass} mine`);
  expect(button().disabled).toBe(true);
  /* Never a submit, wherever someone puts the bar. */
  expect(button().type).toBe("button");
});

it("lets the consumer name it themselves", () => {
  render(
    <LottieFullscreenButton
      isFullscreen={false}
      toggle={() => undefined}
      aria-label="Plein écran"
    />,
  );

  expect(button().getAttribute("aria-label")).toBe("Plein écran");
});
