import { EventEmitter } from "events";
import { LottieEvent, LottieEvents } from "../types";

/**
 * Event emitter for Lottie's events
 */
export class LottieEventEmitter {
  eventEmitter = new EventEmitter();

  /**
   * Register a typed listener
   * @param name
   * @param handler
   */
  public on = <Type extends keyof LottieEvents>(
    name: Type,
    handler: LottieEvents[Type],
  ): (() => void) => {
    this.eventEmitter.on(String(name), handler);

    // Return a function to unregister the listener
    return () => this.eventEmitter.off(String(name), handler);
  };

  /**
   * Helper to register to all the events using an object with the event name
   * as `key` and the handler as `value`
   * @param batch
   */
  public onBatch = (batch?: Partial<LottieEvents>): (() => void) => {
    const eventListenerRemovers: (() => void)[] = [];

    if (batch) {
      // Register the listener if the key is a valid event name
      Object.keys(batch).map((key) => {
        if (Object.values(LottieEvent).includes(key as LottieEvent)) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
          eventListenerRemovers.push(this.on(key as keyof LottieEvents, batch[key]));
        }
      });
    }

    // Return a function to unregister all the listeners
    return () => eventListenerRemovers.forEach((deregister) => deregister());
  };

  /**
   * Send an event
   * @param name
   * @param values
   */
  public emit = <Type extends keyof LottieEvents>(
    name: Type,
    values: Parameters<LottieEvents[Type]>[0],
  ) => this.eventEmitter.emit(name, values);
}
