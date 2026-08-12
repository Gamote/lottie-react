/** What {@link installFullscreenStub} hands back to drive and to inspect it. */
export interface FullscreenStub {
  /** Every element `requestFullscreen` has been called on, in order. */
  requested: Element[];
  /** How many times `document.exitFullscreen` has been called. */
  exited: number;
  /** Answers the next request with a refusal rather than with the screen. */
  refuseNext: () => void;
  /** Does what a browser does once it has granted the screen to an element. */
  grant: (element: Element) => void;
  /** Does what a browser does when the screen is handed back. */
  release: () => void;
  /** Puts the environment back the way it was. */
  restore: () => void;
}

/**
 * Gives the test environment the Fullscreen API it has none of.
 *
 * happy-dom implements no part of it: `fullscreenEnabled`, `fullscreenElement`,
 * `exitFullscreen` and `requestFullscreen` are all undefined. That absence is
 * itself the unsupported path, which is worth having and needs no stub, so this
 * exists only for the one thing that cannot be reached without it: what happens
 * when a browser does support fullscreen.
 *
 * Granting the screen is deliberately separate from asking for it, because that
 * is how a browser works. A request is a request, and the element only becomes
 * fullscreen when the browser says so, through an event. Anything that inferred
 * the state from the call rather than from the event would pass here and be
 * wrong in a browser, where the user can refuse and can leave with the Escape
 * key.
 */
export function installFullscreenStub(): FullscreenStub {
  let current: Element | null = null;
  let refusing = false;

  const announce = (element: Element) => {
    element.dispatchEvent(new Event("fullscreenchange", { bubbles: true }));
  };

  const stub: FullscreenStub = {
    requested: [],
    exited: 0,
    refuseNext: () => {
      refusing = true;
    },
    grant: (element) => {
      current = element;
      announce(element);
    },
    release: () => {
      const leaving = current;
      current = null;
      if (leaving !== null) {
        announce(leaving);
      }
    },
    restore: () => {
      Reflect.deleteProperty(document, "fullscreenEnabled");
      Reflect.deleteProperty(document, "fullscreenElement");
      Reflect.deleteProperty(document, "exitFullscreen");
      Reflect.deleteProperty(Element.prototype, "requestFullscreen");
    },
  };

  Object.defineProperty(document, "fullscreenEnabled", {
    configurable: true,
    get: () => true,
  });
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    get: () => current,
  });
  Object.defineProperty(document, "exitFullscreen", {
    configurable: true,
    value: () => {
      stub.exited += 1;
      return Promise.resolve();
    },
  });
  Object.defineProperty(Element.prototype, "requestFullscreen", {
    configurable: true,
    value: function requestFullscreen(this: Element) {
      stub.requested.push(this);
      if (refusing) {
        refusing = false;
        return Promise.reject(
          new TypeError("API can only be initiated by a user gesture."),
        );
      }
      return Promise.resolve();
    },
  });

  return stub;
}
