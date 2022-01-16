import { EventEmitter } from "events";

/**
 * Used to emit typed events to internal component and/or consumer handlers
 *
 * * USE CASE
 * * Instead of storing the `currentFrame` value (which would've rerender
 * * the parent and all the child components) we are letting consumers subscribe to it.
 * * This way we avoid rerender all the components on evey new frame and the consumer
 * * can pass it directly to elements (e.g. `<input>`) using `Ref`s.
 *
 * TODO:
 *  - Should we use https://github.com/primus/eventemitter3?
 *  - revisit the typing and see if we can do better
 *
 * @internal
 */
export class SubscriptionManager<Subscriptions> {
  subscriptionManager = new EventEmitter();

  /**
   * Subscribe to a specific subscription type
   * @param type
   * @param action
   */
  public subscribe = <Type extends keyof Subscriptions>(
    type: Type,
    action: Subscriptions[Type],
  ): (() => void) => {
    this.subscriptionManager.on(String(type), action as unknown as () => void);

    // Return a function to unsubscribe
    return () => this.subscriptionManager.off(String(type), action as unknown as () => void);
  };

  /**
   * Subscribe to multiple notification types using an object
   * @param subscriptions
   */
  public addSubscriptions = (subscriptions?: Partial<Subscriptions>): (() => void) => {
    const eventListenerRemovers: (() => void)[] = [];

    if (subscriptions) {
      for (const type in subscriptions) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        eventListenerRemovers.push(this.subscribe(type, subscriptions[type]));
      }
    }

    // Return a function to unregister all the listeners
    return () => eventListenerRemovers.forEach((deregister) => deregister());
  };

  /**
   * Send a notification to all the subscribers
   * @param type
   * @param payload
   */
  public notify = <Type extends keyof Subscriptions>(
    type: Type,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    payload: Parameters<Subscriptions[Type]>[0],
  ) => this.subscriptionManager.emit(String(type), payload);
}
