/*
 * The wrapper on a server: children render through it untouched, nothing
 * attaches because effects never run there, and no browser global is reached.
 */
// @vitest-environment node
import { renderToString } from "react-dom/server";
import { expect, it, vi } from "vitest";
import { LottieInteractions } from "./LottieInteractions.js";
import type { LottieInteractionContext } from "./types.js";

it("renders its children on a server and attaches nothing", () => {
  const attach = vi.fn((_context: LottieInteractionContext) => undefined);

  const markup = renderToString(
    <LottieInteractions interactions={[{ attach, options: {} }]}>
      <p>still here</p>
    </LottieInteractions>,
  );

  expect(markup).toContain("still here");
  expect(attach).not.toHaveBeenCalled();
});
