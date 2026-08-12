import { afterAll, vi } from "vitest";
import { installCanvasStub } from "./installCanvasStub.js";

/*
 * Runs before any test module is evaluated, which is early enough that a test
 * can reach lottie-web through a plain static import. Without it, importing any
 * build of the engine throws while its module body is still running.
 */
installCanvasStub();

/*
 * lottie-web polls `document.readyState` from its module body on a 100ms
 * interval and clears it only from inside its own callback, so importing the
 * engine leaves a real timer pending. A test file that finishes inside one tick
 * hands that timer to a torn-down environment, where the callback reaches for a
 * `document` that no longer exists and fails the whole run with an unhandled
 * `ReferenceError` blamed on whichever file happened to be running.
 *
 * The timer is not on the fake clock a test file installs later, because the
 * engine is imported before any hook runs. So the handles are kept here and
 * cancelled through the functions captured before anything replaced them, which
 * works whichever clock is in place when the file ends.
 */
const pending = new Set<ReturnType<typeof setInterval>>();
const scheduleInterval = globalThis.setInterval;
const cancelInterval = globalThis.clearInterval;

/**
 * Every repeating timer, remembered so the file can end without leaving one
 * behind. Only the callback and the delay are carried, because the global's own
 * signature is two overloads wide and nothing here schedules with arguments.
 */
function trackedSetInterval(callback: () => void, delay?: number) {
  const handle = scheduleInterval(callback, delay);
  pending.add(handle);
  return handle;
}

vi.stubGlobal("setInterval", trackedSetInterval);

afterAll(() => {
  for (const handle of pending) {
    cancelInterval(handle);
  }
  pending.clear();
});
