/**
 * Keep the state of the logger
 */
let isLoggerActive = true;

/**
 * Set if the logs should appear or not
 * @param isActive
 */
export const setLogger = (isActive: boolean) => {
  isLoggerActive = isActive;
};

/**
 * Prefix a message with a custom message
 * @param message
 */
const prefixMessage = (message?: string) =>
  `[lottie-react]${message !== undefined ? ` ${message}` : ""}`;

/**
 * Method to wrap console's log methods
 * @param method
 */
const customLogger =
  (method: typeof console.log) =>
  (message?: string, ...optionalParams: unknown[]) => {
    // TODO: check if the `method` is valid
    isLoggerActive && method(prefixMessage(message), ...optionalParams);
  };

/**
 * Custom Logger
 */
const logger = {
  // eslint-disable-next-line no-console
  log: customLogger(console.log),
  // eslint-disable-next-line no-console
  error: customLogger(console.error),
  // eslint-disable-next-line no-console
  warn: customLogger(console.warn),
  // eslint-disable-next-line no-console
  info: customLogger(console.info),
};

export default logger;
