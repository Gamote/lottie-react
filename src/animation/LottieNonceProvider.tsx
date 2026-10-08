"use client";

import type { ReactNode } from "react";
import { LottieNonceContext } from "./LottieNonceContext.js";

/** What {@link LottieNonceProvider} takes. */
export interface LottieNonceProviderProps {
  /** The style nonce of the page's Content Security Policy. */
  nonce: string | undefined;
  /** Everything that may render an animation, a control bar or an overlay. */
  children?: ReactNode;
}

/**
 * Puts a nonce on every stylesheet the library renders below it, so a Content
 * Security Policy that allows styles by nonce rather than by `'unsafe-inline'`
 * lets them apply.
 *
 * ```tsx
 * <LottieNonceProvider nonce={nonce}>
 *   <App />
 * </LottieNonceProvider>
 * ```
 *
 * Wrap the app once, high enough that it is in place before the first
 * animation renders. React inserts each stylesheet once per document and never
 * updates it, so a sheet that rendered without the nonce keeps rendering
 * without it.
 *
 * When rendering on the server with React 19, pass the same value to React's
 * own render option as well (`nonce: { style }`). React writes every hoisted
 * sheet under that nonce, and leaves out the rules of any sheet whose nonce
 * differs from it.
 */
export function LottieNonceProvider({
  nonce,
  children,
}: LottieNonceProviderProps): ReactNode {
  return (
    <LottieNonceContext.Provider value={nonce}>
      {children}
    </LottieNonceContext.Provider>
  );
}
