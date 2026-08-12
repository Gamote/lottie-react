/** What the animation hook writes its lifecycle tracing to. */
export interface Logger {
  log: (message: string, ...rest: unknown[]) => void;
}

const PREFIX = "[lottie-react]";

const noop = () => undefined;

/**
 * Builds a logger that says nothing unless the caller asked for it.
 *
 * This is tracing rather than diagnosis, and it deliberately reports only what
 * no subscription can: the configuration actually handed to the engine, and the
 * teardown. Anything a consumer can already subscribe to is not repeated here,
 * and nothing per frame is ever written.
 *
 * There is no `warn`, because everything worth warning about reaches the
 * consumer through the `error` subscription with the reason attached.
 *
 * Unlike a development-only warning this survives into a production build on
 * purpose, so a problem that appears only in one can still be looked at.
 */
export function createLogger(debug: boolean): Logger {
  if (!debug) {
    return { log: noop };
  }

  return {
    log: (message, ...rest) => {
      console.log(`${PREFIX} ${message}`, ...rest);
    },
  };
}
