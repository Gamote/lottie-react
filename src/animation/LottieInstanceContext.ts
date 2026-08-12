import { createContext } from "react";
import type { LottieInstance } from "./types.js";

/**
 * How a child component reaches the animation it belongs to.
 *
 * Whatever owns the animation publishes it here, and every child prefers its
 * own `lottie` prop and falls back to this, which is what lets one set of
 * children serve both the component path and the hook path. It has to be a
 * context rather than an injected prop: children are wrapped, mapped and
 * conditional in real code, and only a context reaches all three.
 *
 * Read it through `useLottieInstance`, which turns the un-provided case into an
 * error naming both ways to fix it.
 */
export const LottieInstanceContext = createContext<LottieInstance | null>(null);
