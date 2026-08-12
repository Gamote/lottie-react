import { useEffect, useRef } from "react";
import { type LottieInstance, LottieState } from "../animation/types.js";

/** What the shortcuts need beyond the animation itself. */
export interface ShortcutOptions {
  /** Whether the controls are unusable, in which case the keys are too. */
  disabled: boolean;
  /** Turns looping off and on again, keeping a numeric count. */
  toggleLoop: () => void;
  /** Fills the screen or gives it back, or `null` when that cannot be done. */
  toggleFullscreen: (() => void) | null;
}

/**
 * Whether a key belongs to the element under it rather than to us.
 *
 * The picker is in this list because letters drive its type-ahead, so `l` there
 * is someone looking for an option rather than asking for looping.
 */
function isTyping(element: HTMLElement): boolean {
  return (
    element.isContentEditable ||
    element.tagName === "INPUT" ||
    element.tagName === "TEXTAREA" ||
    element.tagName === "SELECT"
  );
}

/**
 * The keyboard shortcuts a control bar answers: `k` to play or pause, `l` to
 * loop, `f` to fill the screen.
 *
 * They live with the controls, so a page that renders none has no listener at
 * all. Three keys rather than a media player's set, because letters do not
 * activate a focused button and the seek bar already owns the arrow keys when
 * it has focus, so nothing here has to be taken away from the browser.
 *
 * A key is ours when it happened inside this animation's root element, or when
 * this animation is the one filling the screen. The second half is not
 * theoretical: the animation area itself is not focusable, so clicking the
 * picture leaves focus on the document body, and a request made from anywhere
 * outside the element that filled the screen leaves it there too. Both measured
 * in Chromium. A gate that only asked about focus would therefore be dead in
 * the place where a keyboard is all anyone has. With several animations on one
 * page at most one can pass the gate, and when focus is in none of them nothing
 * happens, which is better than all of them answering at once.
 */
export function useShortcuts(
  lottie: LottieInstance,
  options: ShortcutOptions,
): void {
  /*
   * The listener is installed once and reads through here, so a handler that
   * changes every render never means removing and adding a listener.
   */
  const latest = useRef({ lottie, options });
  latest.current.lottie = lottie;
  latest.current.options = options;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const { lottie, options } = latest.current;
      const { root } = lottie;

      if (options.disabled || root === null) {
        return;
      }

      /*
       * A held key would toggle at the repeat rate, and a modifier means the
       * key belongs to the browser or the system: `Cmd+L` is the address bar.
       */
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      const target = event.target;
      const inside = target instanceof Node && root.contains(target);
      if (!inside && document.fullscreenElement !== root) {
        return;
      }
      if (target instanceof HTMLElement && isTyping(target)) {
        return;
      }

      switch (event.key.toLowerCase()) {
        case "k":
          if (lottie.state === LottieState.playing) {
            lottie.pause();
          } else {
            lottie.play();
          }
          break;
        case "l":
          options.toggleLoop();
          break;
        case "f":
          options.toggleFullscreen?.();
          break;
        default:
          return;
      }

      event.preventDefault();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);
}
