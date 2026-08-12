import { useEffect, useMemo, useState } from "react";

/** What {@link useFullscreen} reports about one element. */
export interface UseFullscreenResult {
  /** Whether this element is the one filling the screen. */
  isFullscreen: boolean;
  /**
   * Fills the screen with the element, or gives the screen back.
   *
   * `null` when there is nothing to ask, which covers three cases a caller
   * cannot tell apart and does not need to: no element yet, a browser without
   * the Fullscreen API, and a page that is not allowed to use it. An iPhone is
   * the second of those in every version of iOS shipped so far, and an iframe
   * without `allow="fullscreen"` is the third.
   */
  toggle: (() => void) | null;
}

/**
 * Fills the screen with one element, and says whether it currently is.
 *
 * The state follows the browser's own announcement and nothing else, so leaving
 * through the Escape key, through another animation taking the screen, or
 * through anything else the browser offers is reported the same as leaving
 * through this hook. It also means a request the browser refuses changes
 * nothing here, rather than leaving a control claiming something that did not
 * happen.
 *
 * Nothing touches a browser global outside an effect or the toggle itself, so
 * this is safe on a server, and the first client render agrees with the markup
 * a server sent rather than hydrating a button into a place that had none.
 */
export function useFullscreen(root: HTMLElement | null): UseFullscreenResult {
  const [supported, setSupported] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  /*
   * `fullscreenEnabled` answers all three unsupported cases in one, which is
   * why it is the gate rather than a check for the method or a look at the user
   * agent. It cannot change while a page is open, so it is read once.
   */
  useEffect(() => {
    setSupported(document.fullscreenEnabled === true);
  }, []);

  /*
   * The listener sits on the element rather than on the document, which is what
   * makes several animations on one page independent by construction: the event
   * is fired at the element that entered or left fullscreen, so nothing else
   * hears it. The document has room for one `onfullscreenchange` handler in
   * total, so the whole class of last-one-registered-wins cannot arise here.
   */
  useEffect(() => {
    if (root === null) {
      return;
    }

    const onChange = () => {
      setIsFullscreen(document.fullscreenElement === root);
    };

    root.addEventListener("fullscreenchange", onChange);
    return () => {
      root.removeEventListener("fullscreenchange", onChange);
    };
  }, [root]);

  const toggle = useMemo(() => {
    if (!supported || root === null) {
      return null;
    }

    return () => {
      const change =
        document.fullscreenElement === root
          ? document.exitFullscreen()
          : root.requestFullscreen();

      /*
       * A refusal is reported rather than acted on, because the state above
       * comes from the event and is already correct. Catching it at all is what
       * keeps a rejected promise out of a consumer's error reporting. The
       * message is built inside the guard rather than passed in, so nothing of
       * it survives into a production build.
       */
      change.catch((cause: unknown) => {
        if (
          typeof process !== "undefined" &&
          process.env.NODE_ENV !== "production"
        ) {
          console.warn(
            `[lottie-react] the browser refused to change fullscreen: ${String(cause)}. ` +
              'A request has to come from a click or a key press, and a page in an iframe needs allow="fullscreen".',
          );
        }
      });
    };
  }, [supported, root]);

  return { isFullscreen, toggle };
}
