import { RefObject } from "react";

/**
 * Extended version of the {@link Document} that includes the
 * prefixed full screen properties from all the vendors
 */
type ExtendedDocument = Document & {
  mozFullScreenEnabled?: boolean;
  mozFullScreenElement?: Element | null;
  msFullscreenEnabled?: boolean;
  msFullscreenElement?: Element | null;
  webkitFullscreenEnabled?: boolean;
  webkitFullscreenElement?: Element | null;
  webkitCurrentFullScreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void>;
  onwebkitfullscreenchange?: ((event: Event) => void) | null;
};

/**
 * Extended version of the {@link Element} that includes the
 * prefixed full screen properties from all the vendors
 */
type ExtendedElement = Element & {
  webkitRequestFullscreen?: () => Promise<void>;
};

type FullscreenInfo = null | {
  isFullscreenEnabled: boolean;
  fullscreenElement: Element | null;
  requestFullscreen: () => Promise<void> | undefined;
  exitFullscreen: () => Promise<void>;
  onFullscreenChange: (listener: ((event: Event) => void) | null) => void;
};

/**
 * Enrich `documents` type with property that are not yet defined
 */
export const extendedDocument: ExtendedDocument = document;

/**
 * By getting the info through this method we increase the
 * Fullscreen API support by using vendor prefixed properties
 *
 * TODO: should we use the `extendedDocument` if `ref` is `undefined`
 */
export const getFullscreenInfo = (ref?: RefObject<ExtendedElement>): FullscreenInfo => {
  if (!ref?.current) {
    return null;
  }

  switch (true) {
    // Shared properties
    case extendedDocument.fullscreenEnabled:
      return {
        isFullscreenEnabled: extendedDocument.fullscreenEnabled,
        fullscreenElement: extendedDocument.fullscreenElement,
        requestFullscreen: () => ref.current?.requestFullscreen(),
        exitFullscreen: () => extendedDocument.exitFullscreen(),
        onFullscreenChange: (listener) => (extendedDocument.onfullscreenchange = listener),
      };
    // MOZ
    case extendedDocument.mozFullScreenEnabled:
      return {
        isFullscreenEnabled: !!extendedDocument.mozFullScreenEnabled,
        fullscreenElement: extendedDocument.mozFullScreenElement ?? null,
        requestFullscreen: () => ref.current?.requestFullscreen(),
        exitFullscreen: () => extendedDocument.exitFullscreen(),
        onFullscreenChange: (listener) => (extendedDocument.onfullscreenchange = listener),
      };
    // MS
    case extendedDocument.msFullscreenEnabled:
      return {
        isFullscreenEnabled: !!extendedDocument.msFullscreenEnabled,
        fullscreenElement: extendedDocument.msFullscreenElement ?? null,
        requestFullscreen: () => ref.current?.requestFullscreen(),
        exitFullscreen: () => extendedDocument.exitFullscreen(),
        onFullscreenChange: (listener) => (extendedDocument.onfullscreenchange = listener),
      };
    // WebKit
    case extendedDocument.webkitFullscreenEnabled:
      return {
        isFullscreenEnabled: !!extendedDocument.webkitFullscreenEnabled,
        fullscreenElement: extendedDocument.webkitCurrentFullScreenElement ?? null,
        requestFullscreen: () => ref.current?.webkitRequestFullscreen?.(),
        exitFullscreen: async () => await extendedDocument.webkitExitFullscreen?.(),
        onFullscreenChange: (listener) => (extendedDocument.onwebkitfullscreenchange = listener),
      };
    // Not supported
    default:
      return null;
  }
};
