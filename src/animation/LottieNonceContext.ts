import { createContext } from "react";

/**
 * The nonce every stylesheet the library renders carries, and `undefined` in
 * the common case where the page sets none, which leaves the attribute off.
 */
export const LottieNonceContext = createContext<string | undefined>(undefined);
